import * as ActionTypes from './ActionTypes';

const initialAaClashState: AaClashQueryState = {
  queries: [],
  isLoading: true,
  errMsg: null,
};

const initialPdbSrcState: PdbInfoSrcState = {
  pdbDataSrc: 'rcsb',
};

export const AaClashQueryReducer = (
  state = initialAaClashState,
  action: ReturnType<PayloadAction>
): AaClashQueryState => {
  switch (action.type) {
    case ActionTypes.ADD_PDB_QUERY:
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
  state = initialPdbSrcState,
  action: ReturnType<PayloadAction>
): PdbInfoSrcState => {
  switch (action.type) {
    case ActionTypes.SWITCH_PDB_INFO_SRC:
      if (state.pdbDataSrc === 'rcsb') return { ...state, pdbDataSrc: 'pdbe' };
      return { ...state, pdbDataSrc: 'rcsb' };
    default:
      return state;
  }
};
