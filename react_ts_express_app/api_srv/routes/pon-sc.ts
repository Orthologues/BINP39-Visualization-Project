import express from 'express';
import axios from 'axios';
import { Options, PythonShell } from 'python-shell'
import path from 'path';
const moduleURL = new URL(import.meta.url); 
const dirName = path.dirname(moduleURL.pathname);

export const tryPyStdout = (req: express.Request, res: express.Response) => {
    const pdb_id: string = req.params.pdb_id;
    const pyShellOptions = {
        mode: 'text',
        pythonPath: '/usr/local/Caskroom/miniconda/base/bin/python',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: `${dirName}/../src`
    };
    let tryREpyShell = new PythonShell('testRoutes.py', <Options>pyShellOptions);
    tryREpyShell.send(pdb_id);
    tryREpyShell.on('message', pyStdout => {
        // received a message sent from the Python script (a simple "print" statement)
        res.write(pyStdout as string);
    });

    // end the input stream and allow the process to exit
    tryREpyShell.end((err, code, signal) => {
        if (err) console.log((<Error>err).message);
        res.write(`\nThe exit signal was: ${signal}\n`);
        res.write(`The exit code was: ${code}\n`);
        res.write('Python Script finished!');
        res.end();
    });
};

export default async function ponscResult(req: express.Request, res: express.Response) {
    const pdb_id: string = req.params.pdb_id;
    await res.send({ answer: `Your query is '${pdb_id}'` });
    axios.post(`http://localhost:3010/pon-sc/${pdb_id}/results`, {
        results: `PON-SC prediction for ${pdb_id} is:`
    }).then(
        res_axios => { console.log({ statusText: res_axios.statusText, data: res_axios.data }) },
        error => { console.log(`${(<Error>error).message}, failure`) });
}




