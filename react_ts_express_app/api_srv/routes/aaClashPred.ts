// this module defines backend operations of 'http(s)://api.structure.bmc.lu.se/pon-scp/pred'

import { Request, Response } from 'express';
import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js';
import { Options, PythonShell, PythonShellError } from 'python-shell';
import nodemailer from 'nodemailer';
import { Dictionary, isEmpty } from 'lodash';
import fs from 'fs';
import { SENDER_PWD } from '../Secrets.js'

// type declarations only for dev, erased after compilation to ecma-script codes
type PdbIdAaQuery = {
    pdbId: string,
    aaSubs: Array<string>,
    queryId: string
};
type PdbFileQueryBody = {
    aaSubs: string,
    queryId: string,
    emailAddr?: string
}
type PdbCodeQueryBody = {
    queries: Array<PdbIdAaQuery>
    emailAddr?: string
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
type AaSubDetailed = {
    chain: string;
    oldAa: string;
    pos: number;
    newAa: string;
    pred: 'good' | 'bad';
}
const AA_3_TO_1: Dictionary<string> = {"ALA":"A", "ARG":"R", "ASN":"N","ASP":"D", "CYS":"C", 
"GLN":"Q", "GLU":"E", "GLY":"G", "HIS":"H", "ILE":"I", "LEU":"L", "LYS":"K", 
"MET":"M", "PHE":"F", "PRO":"P","SER":"S", "THR":"T", "TRP":"W", "TYR":"Y", "VAL":"V"};
const SENDER_EMAIL = 'jwz.student.bmc.lu@gmail.com';

const sendPredsToEmail = (preds: AaClashPredData[], objAddr: string) => {
  let formattedPreds: Array<{ queryId: string, goodList: Array<AaSubDetailed>, badList: Array<AaSubDetailed> }> = [];
  preds.forEach(pred => {
      formattedPreds.push({ ...formattedAaClashPred(pred), queryId: pred.queryId })
  });

  let transporter = nodemailer.createTransport(
  { 
    port: 2525,
    secure: true, 
    service: 'Gmail',
    auth: 
    {
      user: SENDER_EMAIL,
      pass: SENDER_PWD
    }
  });
  let message = {
    from: SENDER_EMAIL,
    // Comma separated list of recipients
    to: objAddr,
    // Subject of the message
    subject: `Steric-clash prediction for AA substitutions by PON-SC+`,
    // plaintext body
    text: JSON.stringify(formattedPreds),
  };
  transporter.sendMail(message);
}
const formattedAaClashPred = (aaClashPred: AaClashPredData): 
{ goodList: Array<AaSubDetailed>, badList: Array<AaSubDetailed> } => {
   const goodAAs = aaClashPred.goodAcids as Dictionary<Dictionary<string>>;
   const badAAs = aaClashPred.badAcids as Dictionary<string[]>;
   const output = { goodList: [] as Array<AaSubDetailed>, badList: [] as Array<AaSubDetailed> };
   Object.keys(goodAAs).map(chain_pos => {
     let chain=''; 
     let pos='';
     let old_aa='';
     const CHAIN_REG_MATCH = chain_pos.match(/([A-Z])(?=_\w\d+)/i);
     if (CHAIN_REG_MATCH) chain = CHAIN_REG_MATCH[0].toUpperCase();
     const POS_REG_MATCH = chain_pos.match(/(?<=[A-Z]_)(\w\d+)/i);
     if (POS_REG_MATCH) { 
       pos = POS_REG_MATCH[0]; 
       const OLD_AA_MATCH = pos.match(/[arndcqeghilkmfpstwyv](?=\d+)/i);
       if (OLD_AA_MATCH) old_aa = OLD_AA_MATCH[0].toUpperCase(); 
     }
 
     if ( !isEmpty(goodAAs[chain_pos]) ) {
       Object.keys(goodAAs[chain_pos]).map(goodAA => {
         (chain.length > 0 && pos.length > 0) && 
         output.goodList.push({
           chain: chain,
           oldAa: old_aa,
           pos: parseInt(pos.substring(1, pos.length)),
           newAa: AA_3_TO_1[goodAA],
           pred: 'good'
         })
       });
     } 
     if (badAAs[chain_pos].length > 0){
       badAAs[chain_pos].map(badAA => {
         (chain.length > 0 && pos.length > 0) && 
         output.badList.push({
          chain: chain,
          oldAa: old_aa,
          pos: parseInt(pos.substring(1, pos.length)),
          newAa: AA_3_TO_1[badAA],
          pred: 'bad'
        })
       })
     }
   });
   return output;
}

// define the route of pdb-file mode
export const handlePdbFileQuery = (req: Request, res: Response) => {
    const pdbFile = req.file;
    const pdbFileName = req.file.filename;
    let aaSubs = (req.body as PdbFileQueryBody).aaSubs;
    let queryId = (req.body as PdbFileQueryBody).queryId;
    const emailAddr = (req.body as PdbFileQueryBody).emailAddr;
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
            emailAddr && sendPredsToEmail([dataToClient.aaClash], emailAddr)
        });
    }
}

// define the route of pdb-code mode
const handlePdbCodeQuery = (req: Request, res: Response) => {
    const aaClashQueries: Array<PdbIdAaQuery> = (req.body as PdbCodeQueryBody).queries;
    const emailAddr = (req.body as PdbCodeQueryBody).emailAddr;
    // when authentication is correct, use python-shell and respond back to front-end
    if (aaClashQueries.length > 0) {
        //use time of ISO-format as job_id(part of file_name) of aaclash-query
        const CURRENT_TIME = new Date().toISOString();
        const RANDOM_SUFFIX = Math.round(Math.random() * 1E8);
        const JOB_ID = `${CURRENT_TIME}${RANDOM_SUFFIX}`.replace(/[-:\.\/]/gi,'');
        const FILE_NAME = `${AA_CLASH_PREFIX}/extra_files/pos${JOB_ID}.txt`;
        // console.log(`New query text file created: ${FILE_NAME}`);
        // write .txt query file first under 'aaclash/' subfolder as a prerequisite to run the .py script
        fs.writeFileSync(FILE_NAME, '');
        aaClashQueries.map(aaClashQuery => {
            //':' in ${FILE_NAME} would be automatically converted to '/' in file system
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
            aaClashResults.map(aaClashResult => {
                let jobNameSuffix = aaClashResult.jobName?.match(/(?<=\w+_)[1-9]\w{3}/i);
                if (jobNameSuffix) {
                  let pdbIdSuffix = jobNameSuffix[0].toUpperCase(); 
                  let matchedQuery = aaClashQueries.filter(el => {
                    let pdbIdPrefixMatch = el.queryId.match(/[1-9]\w{3}(?=_\w+)/i);
                    if (pdbIdPrefixMatch) {
                        let pdbIdPrefix = pdbIdPrefixMatch[0].toUpperCase();
                        if (pdbIdPrefix === pdbIdSuffix) return el;
                    }
                  })[0];
                  const aaClashData: AaClashPredData = { queryId: matchedQuery.queryId, ...aaClashResult };
                  dataToClient.aaClash.push(JSON.parse(JSON.stringify(aaClashData)));
                }
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
            emailAddr && sendPredsToEmail(dataToClient.aaClash, emailAddr)
        });
    }
}

export default handlePdbCodeQuery;
