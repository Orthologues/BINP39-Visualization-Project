// express.js API server
export const SRV_PORT = 3010;
export const SRV_URL_PREFIX = `http://localhost:${SRV_PORT.toString()}`;

// prefix of the front-end server
export const FRONTEND_PREFIX = 'http://localhost:3000';

//pdbE 
export const PDBE_WEB_PREFIX = 'https://www.ebi.ac.uk/pdbe/entry/pdb';
export const PDBE_API_PREFIX = 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary';
//PDBsum 
export const PDBSUM_PDB_PREFIX = 'https://www.ebi.ac.uk/thornton-srv/databases/cgi-bin/pdbsum/GetPage.pl?pdbcode=';
//HUMA
export const HUMA_UNIPROT_PREFIX = 'https://huma.rubi.ru.ac.za/#proteins/fetch';

export const AMINO_ACIDS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 
'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V'];

// regex of a PDB-code entry
export const PDB_CODE_ENTRY_REGEX = /(?<=^\s*>)[1-9]\w{3}/gm;
export const AA_SUB_ENTRY_REGEX = /(?<=^\s*>[1-9]\w{3})(\s+[arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\s+\d+)+/gim;
export const FILE_AA_SUB_REGEX = /((?<=(^\s*|\s+))([arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\d+)|(?<=(^\s*|\s+))([arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\d+)(?=\s*$))+/gim;