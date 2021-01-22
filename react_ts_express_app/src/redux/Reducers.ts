import * as ActionTypes from './ActionTypes';

const initialAAClashState: AaClashQueryState = {
    queryMode: 'PDB-CODE',
    queries: [],
    fileQuery: null,
    queryHistory: [],
    fileQueryHistory: [],
    codePredResults: [],
    filePredResult: null,
    codePredResultHistory: [],
    filePredResultHistory: [],
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
    case ActionTypes.RESET_REDUX_APP_STATE:
      return initialAAClashState;
    case ActionTypes.HANDLE_CODE_QUERY_INPUT:
      return { ...state, codeQueryFormValue: action.payload };
    case ActionTypes.HANDLE_FILE_QUERY_INPUT:
      return { ...state, fileQueryFormValue: action.payload };
    case ActionTypes.ADD_PDB_CODE_QUERY:
      return { ...state, queries: (<AaClashCodePayload>action.payload).queries, 
        codePredResults: (<AaClashCodePayload>action.payload).predResults,
        isLoading: false };
    case ActionTypes.ADD_PDB_FILE_QUERY: 
      return { ...state, fileQuery: (<AaClashFilePayload>action.payload).query, 
        filePredResult: (<AaClashFilePayload>action.payload).predResult,
        isLoading: false };
    case ActionTypes.DELETE_PDB_CODE_QUERY:
      return { ...state, 
        queries: state.queries.filter((query: PdbIdAaQuery) => 
        query.queryId !== (<PdbIdAaQuery>action.payload).queryId ),
        queryHistory: state.queryHistory.filter((query: PdbIdAaQuery) => 
        query.queryId !== (<PdbIdAaQuery>action.payload).queryId ),
        codePredResults: state.codePredResults.filter((record: AaClashPredData) => 
        record.queryId !== (<PdbIdAaQuery>action.payload).queryId ),
        codePredResultHistory: state.codePredResultHistory.filter((record: AaClashPredData) => 
        record.queryId !== (<PdbIdAaQuery>action.payload).queryId ),
        isLoading: false }
    case ActionTypes.DELETE_PDB_FILE_QUERY:
      return { ...state, 
        fileQuery: state.fileQuery?.queryId === (<PdbFileQueryStore>action.payload).queryId ?
        { fileName: '', queryId: '', aaSubs: [] }: state.fileQuery,
        fileQueryHistory: state.fileQueryHistory.filter((query: PdbFileQueryStore) => 
        query.queryId !== (<PdbFileQueryStore>action.payload).queryId ),
        filePredResult: state.filePredResult?.queryId === (<PdbFileQueryStore>action.payload).queryId ?
        null: state.filePredResult,
        filePredResultHistory: state.filePredResultHistory.filter((record: AaClashPredData) => 
        record.queryId !== (<PdbFileQueryStore>action.payload).queryId ),
        isLoading: false }
    case ActionTypes.APPEND_PDB_CODE_QUERY_HISTORY:
      return { ...state, 
        queryHistory: state.queryHistory.concat((<AaClashCodePayload>action.payload).queries), 
        codePredResultHistory: state.codePredResultHistory.concat((<AaClashCodePayload>action.payload).predResults),
        isLoading: false };
    case ActionTypes.APPEND_PDB_FILE_QUERY_HISTORY:
      return { ...state,
        fileQueryHistory: state.fileQueryHistory.concat((<AaClashFilePayload>action.payload).query),
        filePredResultHistory: state.filePredResultHistory.concat((<AaClashFilePayload>action.payload).predResult),
        isLoading: false }
    case ActionTypes.ERASE_PDB_CODE_QUERY_HISTORY: 
      return { ...state, queries: [], queryHistory: [], isLoading: false, errMsg: null };
    case ActionTypes.ERASE_PDB_FILE_QUERY_HISTORY: 
      return { ...state, 
        fileQuery: { fileName: '', queryId: '', aaSubs: [] }, 
        fileQueryHistory: [], isLoading: false, errMsg: null };
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
}

const initialRcsbGqlState: RcsbGraphQlState = {
  displayMode: 'latest',
  selectedPdbId: undefined
}
export const RcsbGqlReducer = (state: RcsbGraphQlState = initialRcsbGqlState, 
  action: PayloadAction): RcsbGraphQlState => {
    switch (action.type) {
      case ActionTypes.RESET_REDUX_APP_STATE:
        return initialRcsbGqlState;
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