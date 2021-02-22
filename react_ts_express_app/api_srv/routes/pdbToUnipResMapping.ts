import { Request, Response } from 'express';
import { Dictionary } from 'lodash';
import { PY_PATH, AA_CLASH_PREFIX } from '../constants.js'
import util from 'util';
import { exec } from 'child_process';

interface PdbResidueToUniprot extends Dictionary<string|number> {
    pdbId: string,
    pdbChain: string,
    pdbPos: string|number,
    pdbAa: string;
    uniId: string,
    uniPos: string|number,
    uniAa: string;
}

const execMapping = async (pdbId: string) => {
    const execPromise = util.promisify(exec);
    const PDB_ID: string = pdbId.toLowerCase();
    const XML_URL = `ftp://ftp.ebi.ac.uk/pub/databases/msd/sifts/xml/${PDB_ID}.xml.gz`;
    const SCRIPT_PATH = `${AA_CLASH_PREFIX}/parse_sifts.py`;
    const { stdout, stderr } = await execPromise(`curl -s ${XML_URL}|gunzip|${PY_PATH} -u ${SCRIPT_PATH}`);
    if (stderr) return `Python error: ${stderr}`;
    let mappedData = new Array<PdbResidueToUniprot>();
    const stdoutLines: string[] = stdout.toString().split('\n');
    stdoutLines.length > 0 && stdoutLines.map(line => {
      const pdbIdMatch = line.match(/^[1-9]\w{3}(?=\t)/i);
      const uniIdMatch = line.match(/\w{6}(?=\t\w)/i);
      const chainMatch = line.match(/(?<=[1-9]\w{3}\t)[A-Z]/i);
      const aaMatch = line.match(/[arndcqeghilkmfpstwyv](?=\t\d+)/gi);
      const residuePosMatch = line.match(/(?<=\t[arndcqeghilkmfpstwyv]\t)\d+/gi); // filter 'null' position
      if (pdbIdMatch && uniIdMatch && chainMatch && residuePosMatch?.length === 2 && aaMatch?.length === 2) {
        const pdbChain = chainMatch[0], pdbPos = residuePosMatch[0], uniPos = residuePosMatch[1]; 
        const pdbAa = aaMatch[0], uniAa = aaMatch[1];
        const pdbId = pdbIdMatch[0], uniId = uniIdMatch[0];
        const newItem: PdbResidueToUniprot = {
            pdbId: pdbId,
            pdbChain: pdbChain,
            pdbPos: pdbPos,
            pdbAa: pdbAa,
            uniId: uniId,
            uniPos: uniPos,
            uniAa: uniAa
        } 
        mappedData.push(newItem);
      }
    });
    return mappedData;
}

export default async function pdbResidueToUniprot(req: Request, res: Response) {
  const pdbId: string = req.params.pdb_id;
  const mappedData = await execMapping(pdbId);
  Array.isArray(mappedData) 
    ? mappedData.length > 0 
      ? res.send(mappedData as PdbResidueToUniprot[])
      : res.send('No mapped data found!')
    : res.send(mappedData as string) 
}