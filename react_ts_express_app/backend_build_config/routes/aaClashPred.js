import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js';
import { PythonShell } from 'python-shell';
import nodemailer from 'nodemailer';
import fs from 'fs';
import { SENDER_PWD } from '../Secrets.js';
const AA_3_TO_1 = { "ALA": "A", "ARG": "R", "ASN": "N", "ASP": "D", "CYS": "C",
    "GLN": "Q", "GLU": "E", "GLY": "G", "HIS": "H", "ILE": "I", "LEU": "L", "LYS": "K",
    "MET": "M", "PHE": "F", "PRO": "P", "SER": "S", "THR": "T", "TRP": "W", "TYR": "Y", "VAL": "V" };
const SENDER_EMAIL = 'jwz.student.bmc.lu@gmail.com';
const isEmpty = (value) => {
    return (value == null || // From standard.js: Always use === - but obj == null is allowed to check null || undefined
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0));
};
const sendPredsToEmail = (preds, objAddr) => {
    let formattedPreds = [];
    let attachments = new Array();
    let htmlToDisplay = '';
    preds.forEach((pred, ind) => {
        const formattedPred = formattedAaClashPred(pred);
        htmlToDisplay = `${htmlToDisplay}<p><b>AA-Clash Query-ID ${ind + 1}:</b> ${pred.queryId}</p>`;
        formattedPred && formattedPreds.push({ queryId: pred.queryId, ...formattedPred });
        formattedPred && attachments.push({
            filename: `AA_Clash_Prediction_${pred.queryId}.json`,
            content: JSON.stringify({ formatted: formattedPreds[ind], raw: pred }),
            encoding: 'utf-8'
        });
    });
    let transporter = nodemailer.createTransport({
        port: 2525,
        secure: true,
        service: 'Gmail',
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PWD
        }
    });
    // let attachMentList
    let message = {
        from: SENDER_EMAIL,
        // Comma separated list of recipients
        to: objAddr,
        // Subject of the message
        html: htmlToDisplay,
        subject: `Steric-clash prediction for AA substitutions by PON-SC+`,
        attachments: attachments
    };
    attachments.length > 0 && transporter.sendMail(message).catch((err) => console.log(err.message));
};
const formattedAaClashPred = (aaClashPred) => {
    const goodAAs = aaClashPred.goodAcids;
    const badAAs = aaClashPred.badAcids;
    const output = { goodList: [], badList: [] };
    if (!(goodAAs && badAAs)) {
        return undefined;
    }
    ;
    Object.keys(goodAAs).map(chain_pos => {
        let chain = '';
        let pos = '';
        let old_aa = '';
        const CHAIN_REG_MATCH = chain_pos.match(/([A-Z])(?=_\w\d+)/i);
        if (CHAIN_REG_MATCH)
            chain = CHAIN_REG_MATCH[0].toUpperCase();
        const POS_REG_MATCH = chain_pos.match(/(?<=[A-Z]_)(\w\d+)/i);
        if (POS_REG_MATCH) {
            pos = POS_REG_MATCH[0];
            const OLD_AA_MATCH = pos.match(/[arndcqeghilkmfpstwyv](?=\d+)/i);
            if (OLD_AA_MATCH)
                old_aa = OLD_AA_MATCH[0].toUpperCase();
        }
        if (!isEmpty(goodAAs[chain_pos])) {
            Object.keys(goodAAs[chain_pos]).map(goodAA => {
                (chain.length > 0 && pos.length > 0) &&
                    output.goodList.push({
                        chain: chain,
                        oldAa: old_aa,
                        pos: parseInt(pos.substring(1, pos.length)),
                        newAa: AA_3_TO_1[goodAA],
                        pred: 'good'
                    });
            });
        }
        if (badAAs[chain_pos].length > 0) {
            badAAs[chain_pos].map(badAA => {
                (chain.length > 0 && pos.length > 0) &&
                    output.badList.push({
                        chain: chain,
                        oldAa: old_aa,
                        pos: parseInt(pos.substring(1, pos.length)),
                        newAa: AA_3_TO_1[badAA],
                        pred: 'bad'
                    });
            });
        }
    });
    return output;
};
// define the route of pdb-file mode
export const handlePdbFileQuery = (req, res) => {
    const pdbFile = req.file;
    const pdbFileName = req.file.filename;
    let aaSubs = req.body.aaSubs;
    let queryId = req.body.queryId;
    const emailAddr = req.body.emailAddr;
    if (pdbFile && queryId && aaSubs) {
        aaSubs = JSON.parse(aaSubs);
        const FILE_NAME = `${AA_CLASH_PREFIX}/extra_files/pos${pdbFileName}.txt`;
        if (Array.isArray(aaSubs)) {
            fs.writeFileSync(FILE_NAME, '');
            aaSubs.map(aaSub => fs.appendFileSync(FILE_NAME, `${aaSub}\n`));
        }
        const pyShellOptions = {
            mode: 'json',
            pythonPath: PY_PATH,
            pythonOptions: ['-u'],
            scriptPath: AA_CLASH_PREFIX,
            args: ['file', pdbFileName]
        };
        let pyScriptRes = { code: -1, finalText: 'Python scripts have not yet run' };
        let dataToClient = { aaClash: { queryId: queryId }, pyRunInfo: pyScriptRes };
        const pdbCodePredPyShell = new PythonShell('prediction_aaclash.py', pyShellOptions);
        pdbCodePredPyShell.on('message', (aaClashResult) => {
            // catch stdout of the Python script (a simple "print" statement)
            const aaClashData = { queryId: queryId, ...aaClashResult['0'] };
            dataToClient.aaClash = JSON.parse(JSON.stringify(aaClashData));
        });
        // end the input stream and allow the process to exit
        pdbCodePredPyShell.end((err, code, signal) => {
            if (err) {
                pyScriptRes.finalText = err.message;
            }
            else {
                pyScriptRes.finalText = 'Python Script finished!';
            }
            pyScriptRes.code = code;
            pyScriptRes.signal = signal;
            res.send(dataToClient);
            !err && emailAddr && sendPredsToEmail([dataToClient.aaClash], emailAddr);
        });
    }
};
// define the route of pdb-code mode
const handlePdbCodeQuery = (req, res) => {
    const aaClashQueries = req.body.queries;
    const emailAddr = req.body.emailAddr;
    // when authentication is correct, use python-shell and respond back to front-end
    if (aaClashQueries.length > 0) {
        //use time of ISO-format as job_id(part of file_name) of aaclash-query
        const CURRENT_TIME = new Date().toISOString();
        const RANDOM_SUFFIX = Math.round(Math.random() * 1E8);
        const JOB_ID = `${CURRENT_TIME}${RANDOM_SUFFIX}`.replace(/[-:\.\/]/gi, '');
        const FILE_NAME = `${AA_CLASH_PREFIX}/extra_files/pos${JOB_ID}.txt`;
        // console.log(`New query text file created: ${FILE_NAME}`);
        // write .txt query file first under 'aaclash/' subfolder as a prerequisite to run the .py script
        fs.writeFileSync(FILE_NAME, '');
        aaClashQueries.map(aaClashQuery => {
            //':' in ${FILE_NAME} would be automatically converted to '/' in file system
            fs.appendFileSync(FILE_NAME, `>${aaClashQuery.pdbId}\n`);
            aaClashQuery.aaSubs.map(aaSub => {
                fs.appendFileSync(FILE_NAME, `${aaSub}\n`);
            });
        });
        // run the .py script for aa-clash prediction 
        const pyShellOptions = {
            mode: 'json',
            pythonPath: PY_PATH,
            pythonOptions: ['-u'],
            scriptPath: AA_CLASH_PREFIX,
            args: ['text', JOB_ID]
        };
        let pyScriptRes = { code: -1, finalText: 'Python scripts have not yet run' };
        let dataToClient = { aaClash: [], pyRunInfo: pyScriptRes };
        const pdbCodePredPyShell = new PythonShell('prediction_aaclash.py', pyShellOptions);
        pdbCodePredPyShell.on('message', (aaClashResults) => {
            // catch stdout of the Python script (a simple "print" statement)
            aaClashResults.map(aaClashResult => {
                var _a;
                let jobNameSuffix = (_a = aaClashResult.jobName) === null || _a === void 0 ? void 0 : _a.match(/(?<=\w+_)[1-9]\w{3}/i);
                if (jobNameSuffix) {
                    let pdbIdSuffix = jobNameSuffix[0].toUpperCase();
                    let matchedQuery = aaClashQueries.filter(el => {
                        let pdbIdPrefixMatch = el.queryId.match(/[1-9]\w{3}(?=_\w+)/i);
                        if (pdbIdPrefixMatch) {
                            let pdbIdPrefix = pdbIdPrefixMatch[0].toUpperCase();
                            if (pdbIdPrefix === pdbIdSuffix)
                                return el;
                        }
                    })[0];
                    const aaClashData = { queryId: matchedQuery.queryId, ...aaClashResult };
                    dataToClient.aaClash.push(JSON.parse(JSON.stringify(aaClashData)));
                }
            });
        });
        // end the input stream and allow the process to exit
        pdbCodePredPyShell.end((err, code, signal) => {
            if (err) {
                pyScriptRes.finalText = err.message;
            }
            else {
                pyScriptRes.finalText = 'Python Script finished!';
            }
            pyScriptRes.code = code;
            pyScriptRes.signal = signal;
            res.send(dataToClient);
            !err && emailAddr && sendPredsToEmail(dataToClient.aaClash, emailAddr);
        });
    }
};
export default handlePdbCodeQuery;
