// AaClashQueryState
// PDB-CODE MODE
export const HANDLE_CODE_QUERY_INPUT = 'HANDLE_CODE_QUERY_INPUT';
export const ADD_PDB_CODE_QUERY = 'ADD_PDB_CODE_QUERY';
export const APPEND_PDB_CODE_QUERY_HISTORY = 'APPEND_PDB_CODE_QUERY_HISTORY';
export const DELETE_PDB_CODE_QUERY = 'DELETE_PDB_CODE_QUERY';
export const ERASE_PDB_CODE_QUERY_HISTORY = 'ERASE_PDB_CODE_QUERY_HISTORY';
// PDB-FILE MODE
export const HANDLE_FILE_QUERY_INPUT = 'HANDLE_FILE_QUERY_INPUT';
export const ADD_PDB_FILE_QUERY = 'ADD_PDB_FILE_QUERY';
export const APPEND_PDB_FILE_QUERY_HISTORY = 'APPEND_PDB_FILE_QUERY_HISTORY';
export const DELETE_PDB_FILE_QUERY = 'DELETE_PDB_FILE_QUERY';
export const ERASE_PDB_FILE_QUERY_HISTORY = 'ERASE_PDB_FILE_QUERY_HISTORY';
// GENERIC STATUS
export const LOADING_PDB_QUERY = 'PDB_QUERY_LOADING';
export const PDB_QUERY_FAILED = 'PDB_QUERY_FAILED';
export const SWITCH_AACLASH_QUERY_MODE = 'SWITCH_AACLASH_QUERY_MODE';
export const RESET_REDUX_APP_STATE = 'RESET_REDUX_APP_STATE'; 

// RCSB GraphQL component for info fetching
export const ADD_INDP_RCSB_PDB_ID_QUERY = 'ADD_INDP_RCSB_PDB_ID_QUERY';
export const DELETE_INDP_RCSB_ID_QUERY = 'DELETE_INDP_RCSB_ID_QUERY';
export const SELECT_RCSB_PDB_ID = 'SELECT_RCSB_PDB_ID';
// JSmol visualization
export const SET_MOL_PDB_ID = 'SET_MOL_PDB_ID';
export const SET_MOL_AA_SUB = 'SET_MOL_AA_SUB';
// For both RCSB_GraphQL and Mol Visualization
export const SWITCH_LIST_DISPLAY_MODE = 'SWITCH_LIST_DISPLAY_MODE';

