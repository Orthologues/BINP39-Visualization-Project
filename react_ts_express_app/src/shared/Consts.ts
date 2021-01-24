// express.js API server
const SRV_PORT = 3010;
export const SRV_URL_PREFIX = `http://localhost:${SRV_PORT.toString()}`;

// prefix of the front-end server
export const FRONTEND_PREFIX = 'http://localhost:3000';

export const AMINO_ACIDS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 
'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V'];

// regex of a PDB-code entry
export const PDB_CODE_ENTRY_REGEX = /(?<=^\s*>)[1-9]\w{3}/gm;
export const AA_SUB_ENTRY_REGEX = /(?<=^\s*>[1-9]\w{3})(\s+[arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\s+\d+)+/gim;
export const FILE_AA_SUB_REGEX = /((?<=(^\s*|\s+))([arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\d+)|(?<=(^\s*|\s+))([arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\d+)(?=\s*$))+/gim;