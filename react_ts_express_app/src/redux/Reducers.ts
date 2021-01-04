import * as ActionTypes from './ActionTypes';


export const AaClashQueryReducer = (
  state: AaClashQueryState = {
    queries: [{ pdbId: '', aaSubs: [] }],
    isLoading: false,
    errMsg: null,
  },
  action: PayloadAction
): AaClashQueryState => {
  switch (action.type) {
    case ActionTypes.ADD_PDB_CODE_QUERY:
      return { ...state, queries: action.payload, isLoading: false };
    case ActionTypes.LOADING_PDB_QUERY:
      return { ...state, isLoading: true, errMsg: null };
    case ActionTypes.PDB_QUERY_FAILED:
      return { ...state, isLoading: false, errMsg: action.payload };
    default:
      return state;
  }
};

export const PdbInfoSrcReducer = (
  state: PdbInfoSrcState = { pdbInfoSrc: 'rcsb' },
  action: PayloadAction
): PdbInfoSrcState => {
  switch (action.type) {
    case ActionTypes.SWITCH_PDB_INFO_SRC:
      if (action.payload === 'pdbe') {
        return { pdbInfoSrc: 'pdbe' }
      } else if (action.payload === 'rcsb') {
        return { pdbInfoSrc: 'rcsb' }
      } else {
        return state 
      }
    default:
      return state;
  }
};
