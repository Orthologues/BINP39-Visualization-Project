import express from 'express';
import srvUrlPrefix, { pyPath, aaClashPrefix } from '../constants.js'
import axios from 'axios';
import { Options, PythonShell, PythonShellError } from 'python-shell'
import path from 'path';
const moduleURL = new URL(import.meta.url);
const dirName = path.dirname(moduleURL.pathname);

type pdbIDquery = {
    pdbID: string,
    positions?: Array<number>
}

type regexPythonOutput = {
    oldString: string,
    newString: string,
    regex: string,
}

type pythonScriptResponse = {
    code?: number,
    signal?: string,
    finalText?: string
}

export const tryPyStdout = (req: express.Request, res: express.Response) => {
    //define input values to python-shell
    const pdb_id: string = req.params.pdb_id;
    const dataToPy: Array<pdbIDquery> = [{ pdbID: pdb_id }, { pdbID: "6vxx" }];

    //define feedbacks from python-shell
    let regexPyFeedback: Array<regexPythonOutput> = [];
    let allFeedbacks: Array<regexPythonOutput[] | pythonScriptResponse> = [];
    let pythonScriptRes: pythonScriptResponse = {}

    //define python-shell
    const pyShellOptions: Options = {
        mode: 'json',
        pythonPath: pyPath,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: `${dirName}/../src`
    };
    let tryREpyShell = new PythonShell('testRoutes.py', pyShellOptions);

    dataToPy.map((datumToPy: pdbIDquery) => {
        tryREpyShell.send(JSON.stringify(datumToPy));
    })

    tryREpyShell.on('message', pyStdouts => {
        // received a message sent from the Python script (a simple "print" statement)
        (pyStdouts as Array<regexPythonOutput>).map((pyStdout: regexPythonOutput, index: number) => {
            regexPyFeedback[index] = JSON.parse(JSON.stringify(pyStdout));
            console.log(regexPyFeedback[index]);
        });
        allFeedbacks.push(regexPyFeedback);
    });

    // end the input stream and allow the process to exit
    tryREpyShell.end((err: PythonShellError, code: number, signal: string) => {
        if (err) {
            pythonScriptRes.finalText = err.message
        } else {
            pythonScriptRes.finalText = 'Python Script finished!'
        }
        pythonScriptRes.code = code;
        pythonScriptRes.signal = signal;
        allFeedbacks.push(pythonScriptRes);
        res.write(JSON.stringify(allFeedbacks));
        res.end();
    });
};

export default async function ponscResult(req: express.Request, res: express.Response) {
    const pdb_id: string = req.params.pdb_id;
    await res.send({ answer: `Your query is '${pdb_id}'` });
    axios.post(`${srvUrlPrefix}/pon-sc/${pdb_id}/results`, {
        results: `PON-SC prediction for ${pdb_id} is:`
    }).then(
        res_axios => { console.log({ statusText: res_axios.statusText, data: res_axios.data }) },
        error => { console.log(`${(error as Error).message}, failure`) });
}