import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js';
import util from 'util';
import { exec } from 'child_process';
const execMapping = async (pdbId) => {
    const execPromise = util.promisify(exec);
    const PDB_ID = pdbId.toLowerCase();
    const XML_URL = `ftp://ftp.ebi.ac.uk/pub/databases/msd/sifts/xml/${PDB_ID}.xml.gz`;
    const SCRIPT_PATH = `${AA_CLASH_PREFIX}/parse_sifts.py`;
    const { stdout, stderr } = await execPromise(`curl -s ${XML_URL}|gunzip|${PY_PATH} -u ${SCRIPT_PATH}`);
    if (stderr)
        return `Python error: ${stderr}`;
    let mappedData = new Array();
    const stdoutLines = stdout.toString().split('\n');
    stdoutLines.length > 0 && stdoutLines.map(line => {
        const pdbIdMatch = line.match(/^[1-9]\w{3}(?=\t)/i);
        const uniIdMatch = line.match(/\w{6}(?=\t\w)/i);
        const chainMatch = line.match(/(?<=[1-9]\w{3}\t)[A-Z]/i);
        const aaMatch = line.match(/[arndcqeghilkmfpstwyv](?=\t\d+)/gi);
        const residuePosMatch = line.match(/(?<=\t[arndcqeghilkmfpstwyv]\t)\d+/gi); // filter 'null' position
        if (pdbIdMatch && uniIdMatch && chainMatch && (residuePosMatch === null || residuePosMatch === void 0 ? void 0 : residuePosMatch.length) === 2 && (aaMatch === null || aaMatch === void 0 ? void 0 : aaMatch.length) === 2) {
            const pdbChain = chainMatch[0], pdbPos = residuePosMatch[0], uniPos = residuePosMatch[1];
            const pdbAa = aaMatch[0], uniAa = aaMatch[1];
            const pdbId = pdbIdMatch[0], uniId = uniIdMatch[0];
            const newItem = {
                pdbId: pdbId,
                pdbChain: pdbChain,
                pdbPos: pdbPos,
                pdbAa: pdbAa,
                uniId: uniId,
                uniPos: uniPos,
                uniAa: uniAa
            };
            mappedData.push(newItem);
        }
    });
    return mappedData;
};
export default async function pdbResidueToUniprot(req, res) {
    const pdbId = req.params.pdb_id;
    const mappedData = await execMapping(pdbId).catch((err) => console.log(err.message));
    Array.isArray(mappedData)
        ? mappedData.length > 0
            ? res.send(mappedData)
            : res.send('No mapped data found!')
        : res.send(mappedData);
}
