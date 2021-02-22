import { Request, Response } from 'express';
import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js'
import { Options, PythonShell, PythonShellError } from 'python-shell'

type AaSubDetailed = {
  chain: string;
  oldAa: string;
  pos: number;
  newAa: string;
  pred: 'good' | 'bad';
}

// example of pdbId_chain_sub: 6VXX-A_T50R
export default function dlJobIdPdbFile(req: Request, res: Response) {
  const JOB_ID: string = req.params.job_id;
  const aaSub: AaSubDetailed = req.body.aaSub;
  const STD_SUFFIX = `${aaSub.chain}_${aaSub.oldAa}${aaSub.pos}${aaSub.newAa}`;
  const pyShellOptions: Options = {
    mode: 'json',
    pythonPath: PY_PATH,
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: AA_CLASH_PREFIX,
    args: [`${JOB_ID}-${STD_SUFFIX}`]
  };
  const jobId2pdbPyShell = new PythonShell('aaclash2pdb.py', pyShellOptions);
  jobId2pdbPyShell.end((err: PythonShellError, code: number, signal: string) => {
    if (err) { res.sendStatus(500) } 
    else {
        const FILE_NAME = `${AA_CLASH_PREFIX}/templates/jobId-${JOB_ID}-${STD_SUFFIX}`;
        setTimeout(() => res.sendFile(FILE_NAME), 100);
    }
  });
};