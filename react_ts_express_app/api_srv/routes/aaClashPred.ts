// this module defines backend operations of 'http(s)://api.structure.bmc.lu.se/pon-scp/pred'

import { Request, Response } from 'express';
import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js'
import { Options, PythonShell, PythonShellError } from 'python-shell'
import fs from 'fs';

// type declarations only for dev, erased after compilation to ecma-script codes
type PdbIdAaQuery = {
    pdbId: string,
    aaSubs: Array<string>
};

type AaClashPredData = {
    jobName?: string,
    angles?: object,
    goodAcids?: object,
    badAcids?: object,
    matrices?: object
}

type PyScriptResponse = {
    code?: number,
    signal?: string,
    finalText?: string
}

type AaClashDataToClient = {
    aaClash: Array<AaClashPredData>,
    pyRunInfo: PyScriptResponse
}

// define the route of pdb-file mode
export const handlePdbFileQuery = async (req: Request, res: Response) => {}

// define the route of pdb-code mode
const handlePdbCodeQuery = (req: Request, res: Response) => {
    const aaClashQueries: Array<PdbIdAaQuery> = req.body.queries;
    // when authentication is correct, use python-shell and respond back to front-end
    if (aaClashQueries.length > 0) {
        //use time of ISO-format as job_id(part of file_name) of aaclash-query
        const JOB_ID = new Date().toISOString();
        const FILE_NAME = `${AA_CLASH_PREFIX}/extra_files/pos${JOB_ID}.txt`;
        // console.log(`New query text file created: ${FILE_NAME}`);
        // write .txt query file first under 'aaclash/' subfolder as a prerequisite to run the .py script
        fs.writeFileSync(FILE_NAME, '');
        aaClashQueries.map(aaClashQuery => {
            fs.appendFileSync(FILE_NAME, `>${aaClashQuery.pdbId}\n`);
            aaClashQuery.aaSubs.map(aaSub => {
                fs.appendFileSync(FILE_NAME, `${aaSub}\n`)
            })
        })
        // run the .py script for aa-clash prediction 
        const pyShellOptions: Options = {
            mode: 'json',
            pythonPath: PY_PATH,
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: AA_CLASH_PREFIX,
            args: ['text', JOB_ID]
        };
        let pyScriptRes: PyScriptResponse = {};
        let dataToClient: AaClashDataToClient = { aaClash: [], pyRunInfo: {} };
        const pdbCodePredPyShell = new PythonShell('prediction_aaclash.py', pyShellOptions);
        pdbCodePredPyShell.on('message', (aaClashResults: Array<AaClashPredData>) => {
            // catch stdout of the Python script (a simple "print" statement)
            aaClashResults.map(aaClashResult => {
                dataToClient.aaClash.push(JSON.parse(JSON.stringify(aaClashResult)));
            });
        });

        // end the input stream and allow the process to exit
        pdbCodePredPyShell.end((err: PythonShellError, code: number, signal: string) => {
            if (err) {
                pyScriptRes.finalText = err.message
            } else {
                pyScriptRes.finalText = 'Python Script finished!'
            }
            pyScriptRes.code = code;
            pyScriptRes.signal = signal;
            dataToClient.pyRunInfo = pyScriptRes;
            // console.log(JSON.stringify(dataToClient));
            res.send(dataToClient);
        });
    }
}

export default handlePdbCodeQuery;


