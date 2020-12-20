// define port number and url prefix of the api server
export const portNum: number = 3010;
const urlPrefix: string = `http://localhost:${portNum.toString()}`;
export default urlPrefix; 

// absolute path of python binary
export const pyPath: string = '/usr/local/Caskroom/miniconda/base/bin/python'

//pdbE 
export const pdbeWebPrefix: string = 'https://www.ebi.ac.uk/pdbe/entry/pdb';
export const pdbeApiPrefix: string = 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary';