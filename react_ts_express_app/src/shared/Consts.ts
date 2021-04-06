import { invert, Dictionary } from 'lodash';

// express.js API server
export const SRV_URL_PREFIX = 'https://structure-next.med.lu.se';

export const AMINO_ACIDS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 
'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V'];
export const AA_3_TO_1: Dictionary<string> = {"ALA":"A", "ARG":"R", "ASN":"N","ASP":"D", "CYS":"C", 
"GLN":"Q", "GLU":"E", "GLY":"G", "HIS":"H", "ILE":"I", "LEU":"L", "LYS":"K", 
"MET":"M", "PHE":"F", "PRO":"P","SER":"S", "THR":"T", "TRP":"W", "TYR":"Y", "VAL":"V"};
export const AA_1_TO_3 = invert(AA_3_TO_1);

// regex of a PDB-code entry
export const PDB_CODE_ENTRY_REGEX = /(?<=^\s*>)[1-9]\w{3}/gm;
export const PDB_FILE_NAME_REGEX = /[1-9]\w{3}\.pdb/i;
export const AA_SUB_ENTRY_REGEX = /(?<=^\s*>[1-9]\w{3})(\s+[arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\s+\d+)+/gim;
export const FILE_AA_SUB_REGEX = /((?<=(^\s*|\s+))([arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\d+)|(?<=(^\s*|\s+))([arndcqeghilkmfpstwyv]{0,1}\d+[arndcqeghilkmfpstwyv]|\d+)(?=\s*$))+/gim;
export const EMAIL_ADDR_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//EBI's Variant API
export const UNIPROT_VARIANT_API_PREFIX = 'https://www.ebi.ac.uk/proteins/api/variation';

//JSmol CDN
export const JSMOL_HOST = 'https://chemapps.stolaf.edu/jmol/jsmol';
