import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js';
import { PythonShell } from 'python-shell';
import { unlinkSync } from 'fs';
// example of pdbId_chain_sub: 6VXX-A_T50R, download .pdb file of individual variant AA
export default function dlJobIdPdbFile(req, res) {
    const JOB_ID = req.params.job_id;
    const aaSub = req.body.aaSub;
    const STD_SUFFIX = `${aaSub.chain}_${aaSub.oldAa}${aaSub.pos}${aaSub.newAa}`;
    const pyShellOptions = {
        mode: 'json',
        pythonPath: PY_PATH,
        pythonOptions: ['-u'],
        scriptPath: AA_CLASH_PREFIX,
        args: [`${JOB_ID}-${STD_SUFFIX}`]
    };
    const jobId2pdbPyShell = new PythonShell('aaclash2pdb.py', pyShellOptions);
    jobId2pdbPyShell.end((err, code, signal) => {
        if (err) {
            res.sendStatus(500);
        }
        else {
            const FILE_NAME = `${AA_CLASH_PREFIX}/templates/jobId-${JOB_ID}-${STD_SUFFIX}`;
            res.sendFile(FILE_NAME);
            res.on('finish', () => {
                try {
                    unlinkSync(FILE_NAME);
                }
                catch (e) {
                    console.log("error removing ", FILE_NAME);
                }
            });
        }
    });
};
// example of pdbId_chain_sub: 6VXX-A_T50R, download the entire .pdb file of the structure that includes a given individual variant AA
export const dlJobIdFullPdbFile = (req, res) => {
    const JOB_ID = req.params.job_id;
    const aaSub = req.body.aaSub;
    const STD_SUFFIX = `${aaSub.chain}_${aaSub.oldAa}${aaSub.pos}${aaSub.newAa}`;
    const pyShellOptions = {
        mode: 'json',
        pythonPath: PY_PATH,
        pythonOptions: ['-u'],
        scriptPath: AA_CLASH_PREFIX,
        args: [`${JOB_ID}-${STD_SUFFIX}`]
    };
    const jobId2pdbPyShell = new PythonShell('aaclash2fullpdb.py', pyShellOptions);
    jobId2pdbPyShell.end((err, code, signal) => {
        if (err) {
            res.sendStatus(500);
        }
        else {
            const FILE_NAME = `${AA_CLASH_PREFIX}/templates/full-jobId-${JOB_ID}-${STD_SUFFIX}`;
            res.sendFile(FILE_NAME);
            res.on('finish', () => {
                try {
                    unlinkSync(FILE_NAME);
                }
                catch (e) {
                    console.log("error removing ", FILE_NAME);
                }
            });
        }
    });
};
