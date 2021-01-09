// express.js API server
export const SRV_PORT = 3010;
export const SRV_URL_PREFIX = `http://localhost:${SRV_PORT.toString()}`;

// prefix of the front-end server
export const FRONTEND_PREFIX = 'http://localhost:3000';

//pdbE 
export const PDBE_WEB_PREFIX = 'https://www.ebi.ac.uk/pdbe/entry/pdb';
export const PDBE_API_PREFIX = 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary';

export const AMINO_ACIDS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 
'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V'];

// regex of a PDB code entry
export const PDB_CODE_ENTRY_REGEX = /(?<=^\s*>)[1-9]\w{3}/gm;
export const AA_SUB_ENTRY_REGEX = /(?<=^\s*>[1-9]\w{3})(\s+[arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\s+\d+)+/gim;