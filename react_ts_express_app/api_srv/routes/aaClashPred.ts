// this module defines backend operations of 'http(s)://api.structure.bmc.lu.se/pon-scp/pred'

import { Request, Response } from 'express';
import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js'
import { Options, PythonShell, PythonShellError } from 'python-shell'
import fs from 'fs';

// type declarations only for dev, erased after compilation to ecma-script codes
type PdbIdAaQuery = {
    pdbId: string,
    aaSubs: Array<string>,
    queryId: string
};
type PdbFileQueryBody = {
    aaSubs: string,
    queryId: string
}
type AaClashPredData = {
    queryId: string,
    jobName?: string,
    angles?: object,
    goodAcids?: object,
    badAcids?: object,
    matrices?: object
}
type PyScriptResponse = {
    code: number,
    signal?: string,
    finalText: string
}
type CodeDataToClient = {
    aaClash: Array<AaClashPredData>,
    pyRunInfo: PyScriptResponse
}
type FileDataToClient = {
    aaClash: AaClashPredData,
    pyRunInfo: PyScriptResponse
}

// define the route of pdb-file mode
export const handlePdbFileQuery = (req: Request, res: Response) => {
    const pdbFile = req.file;
    const pdbFileName = req.file.filename;
    let aaSubs = (req.body as PdbFileQueryBody).aaSubs;
    let queryId = (req.body as PdbFileQueryBody).queryId;
    if (pdbFile && queryId && aaSubs) { 
        aaSubs = JSON.parse(aaSubs);
        const FILE_NAME = `${AA_CLASH_PREFIX}/extra_files/pos${pdbFileName}.txt`;
        if (Array.isArray(aaSubs)) {
            fs.writeFileSync(FILE_NAME, ''); 
            aaSubs.map(aaSub => fs.appendFileSync(FILE_NAME, `${aaSub}\n`));
        }
        const pyShellOptions: Options = {
            mode: 'json',
            pythonPath: PY_PATH,
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: AA_CLASH_PREFIX,
            args: ['file', pdbFileName]
        };
        let pyScriptRes: PyScriptResponse = { code: -1, finalText: 'Python scripts have not yet run' };
        let dataToClient: FileDataToClient = { aaClash: {queryId: queryId}, pyRunInfo: pyScriptRes };
        const pdbCodePredPyShell = new PythonShell('prediction_aaclash.py', pyShellOptions);
        pdbCodePredPyShell.on('message', (aaClashResult: { '0': Omit<AaClashPredData, 'queryId'> }) => {
            // catch stdout of the Python script (a simple "print" statement)
            const aaClashData: AaClashPredData = { queryId: queryId, ...aaClashResult['0'] };
            dataToClient.aaClash = JSON.parse(JSON.stringify(aaClashData));
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
            res.send(dataToClient);
        });
    }
}

// define the route of pdb-code mode
const handlePdbCodeQuery = (req: Request, res: Response) => {
    const aaClashQueries: Array<PdbIdAaQuery> = req.body.queries;
    // when authentication is correct, use python-shell and respond back to front-end
    if (aaClashQueries.length > 0) {
        //use time of ISO-format as job_id(part of file_name) of aaclash-query
        const CURRENT_TIME = new Date().toISOString();
        const RANDOM_SUFFIX = Math.round(Math.random() * 1E8);
        const JOB_ID = `${CURRENT_TIME}_${RANDOM_SUFFIX}`;
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
        let pyScriptRes: PyScriptResponse = { code: -1, finalText: 'Python scripts have not yet run' };
        let dataToClient: CodeDataToClient = { aaClash: [], pyRunInfo: pyScriptRes };
        const pdbCodePredPyShell = new PythonShell('prediction_aaclash.py', pyShellOptions);
        pdbCodePredPyShell.on('message', (aaClashResults: Omit<AaClashPredData, 'queryId'>[]) => {
            // catch stdout of the Python script (a simple "print" statement)
            aaClashResults.map((aaClashResult, ind) => {
                const aaClashData: AaClashPredData = { queryId: aaClashQueries[ind].queryId, ...aaClashResult };
                dataToClient.aaClash.push(JSON.parse(JSON.stringify(aaClashData)));
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
            res.send(dataToClient);
        });
    }
}

export default handlePdbCodeQuery;
