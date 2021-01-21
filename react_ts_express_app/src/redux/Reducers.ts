import * as ActionTypes from './ActionTypes';

const initialAAClashState: AaClashQueryState = {
    queryMode: 'PDB-CODE',
    queries: [{ pdbId: '', aaSubs: [], queryId: '' }],
    queryHistory: [],
    predResults: [],
    predResultsHistory: [],
    isLoading: false,
    errMsg: null,
    codeQueryFormValue: '',
    fileQueryFormValue: ''
}

export const AaClashQueryReducer = (
  state: AaClashQueryState = initialAAClashState,
  action: PayloadAction
): AaClashQueryState => {
  switch (action.type) {
    case ActionTypes.HANDLE_CODE_QUERY_INPUT:
      return { ...state, codeQueryFormValue: action.payload };
    case ActionTypes.HANDLE_FILE_QUERY_INPUT:
      return { ...state, fileQueryFormValue: action.payload };
    case ActionTypes.ADD_PDB_CODE_QUERY:
      return { ...state, 
        queries: (action.payload as AaClashCodePayload).queries, 
        predResults: (action.payload as AaClashCodePayload).predResults,
        isLoading: false };
    case ActionTypes.APPEND_PDB_CODE_QUERY_HISTORY:
      return { ...state, 
        queryHistory: state.queryHistory.concat((action.payload as AaClashCodePayload).queries), 
        predResultsHistory: state.predResultsHistory.concat((action.payload as AaClashCodePayload).predResults),
        isLoading: false };
    case ActionTypes.ERASE_PDB_CODE_QUERY_HISTORY: 
      return { ...state, queries: [], queryHistory: [] };
    case ActionTypes.LOADING_PDB_QUERY:
      return { ...state, isLoading: true, errMsg: null };
    case ActionTypes.PDB_QUERY_FAILED:
      return { ...state, isLoading: false, errMsg: action.payload };
    case ActionTypes.SWITCH_AACLASH_QUERY_MODE:
      if (action.payload === 'PDB-CODE') {
        return { ...state, queryMode: 'PDB-CODE' }
      } else if (action.payload === 'FILE') {
        return { ...state, queryMode: 'FILE' }
      } else {
        return state;
      } 
    default:
      return state;
  }
};

const initialRcsbGqlState: RcsbGraphQlState = {
  displayMode: 'latest',
  selectedPdbId: undefined
}

export const RcsbGqlReducer = (state: RcsbGraphQlState = initialRcsbGqlState, 
  action: PayloadAction): RcsbGraphQlState => {
    switch (action.type) {
      case ActionTypes.SELECT_RCSB_PDB_ID:
        return { ...state, selectedPdbId: action.payload }
      case ActionTypes.SWITCH_LIST_DISPLAY_MODE:
        if (action.payload === 'latest') {
          return { ...state, displayMode: action.payload }
        } else if (action.payload === 'history') {
          return { ...state, displayMode: action.payload }
        } else {
          return state;
        }
        default:
          return state;
    }
}