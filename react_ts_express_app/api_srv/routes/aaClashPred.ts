// this module defines backend operations of 'http(s)://api.structure.bmc.lu.se/pon-scp/pred'

import { Request, Response } from 'express';
import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js'
import axios from 'axios';
import { Options, PythonShell, PythonShellError } from 'python-shell'
import fs from 'fs';

// type declarations only for dev, erased after compilation to ecma-script codes
type PdbIdAaQuery = {
    pdbId: string,
    aaSubs: Array<string>
};

// define the route of pdb-file mode
export const handlePdbFileQuery = async (req: Request, res: Response) => {}

// define the route of pdb-code mode
const handlePdbCodeQuery = (req: Request, res: Response) => {
    const aaClashQueries: Array<PdbIdAaQuery> = req.body.queries;
    // when authentication is correct, use python-shell and respond back to front-end
    if (aaClashQueries.length > 0) {
        //use time of ISO-format as job_id(part of file_name) of aaclash-query
        const FILE_NAME = `${AA_CLASH_PREFIX}/extra_files/pos${new Date().toISOString()}.txt`;
        console.log(`New query text file created: ${FILE_NAME}`);
        // write .txt query file first under 'aaclash/' subfolder as a prerequisite to run the .py script
        fs.writeFileSync(FILE_NAME, '');
        aaClashQueries.map(aaClashQuery => {
            fs.appendFileSync(FILE_NAME, `>${aaClashQuery.pdbId}\n`);
            aaClashQuery.aaSubs.map(aaSub => {
                fs.appendFileSync(FILE_NAME, `${aaSub}\n`)
            })
        })
    }
    res.send( {aaClash: 'yes'} );
}

export default handlePdbCodeQuery;


