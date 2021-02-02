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
        fileQueryHistory: state.fileQueryHistory.concat([(<AaClashFilePayload>action.payload).query]),
        filePredResultHistory: state.filePredResultHistory.concat([(<AaClashFilePayload>action.payload).predResult]),
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
  selectedPdbId: undefined,
  indpPdbIdQueries: []
}
export const RcsbGqlReducer = (state: RcsbGraphQlState = initialRcsbGqlState, 
  action: PayloadAction): RcsbGraphQlState => {
    switch (action.type) {
      case ActionTypes.RESET_REDUX_APP_STATE:
        return initialRcsbGqlState;
      case ActionTypes.SELECT_RCSB_PDB_ID:
        return { ...state, selectedPdbId: action.payload }
      case ActionTypes.SWITCH_RCSB_LIST_DISPLAY_MODE:
        if (action.payload === 'latest') {
          return { ...state, displayMode: action.payload }
        } else if (action.payload === 'history') {
          return { ...state, displayMode: action.payload }
        } else {
          return state;
        }
      case ActionTypes.ADD_INDP_RCSB_PDB_ID_QUERY: 
        return { ...state, indpPdbIdQueries: action.payload as Array<string> }
      case ActionTypes.DELETE_INDP_RCSB_ID_QUERY:
        return { ...state, indpPdbIdQueries: state.indpPdbIdQueries.filter(query => query !== <string>action.payload) }
      default:
        return state;
    }
}

const initialMolVisState: MolComponentState = {
  displayMode: 'latest',
  molVisChoice: 'Jmol',
  jmolPdbAaSubs: { pdbToLoad: '', aaSubs: [] },
  ifJmolWireframeOnly: false,
  ifJmolDelayHover: false,
  mol3DPdbAa: { pdbToLoad: '' },
  indpPdbIdQueries: []
}
export const MolVisReducer = (state: MolComponentState = initialMolVisState, 
  action: PayloadAction): MolComponentState => {
  switch (action.type) {
    case ActionTypes.RESET_REDUX_APP_STATE:
      return initialMolVisState;
    case ActionTypes.SWITCH_MOL_LIST_DISPLAY_MODE:
      if (action.payload === 'latest') {
        return { ...state, displayMode: 'latest' }
      } else if (action.payload === 'history') {
        return { ...state, displayMode: 'history' }
      } else {
        return state;
      }
    case ActionTypes.SWITCH_MOL_VIS_CHOICE:
      if (action.payload === 'Jmol') {
        return { ...state, molVisChoice: 'Jmol' }
      } else if (action.payload === '3Dmol') {
        return { ...state, molVisChoice: '3Dmol' }
      } else {
        return state;
      }
    case ActionTypes.SET_JMOL_PDB_ID:
      return { ...state, jmolPdbAaSubs: { pdbToLoad: action.payload, aaSubs: [] } }
    case ActionTypes.SET_JMOL_AA_SUB_LIST:
      return { ...state, jmolPdbAaSubs: { 
        ...state.jmolPdbAaSubs, 
        pdbToLoad: (action.payload as JmolPdbAaSubs).pdbToLoad, 
        aaSubs: (action.payload as JmolPdbAaSubs).aaSubs 
      } }
    case ActionTypes.SET_JMOL_ZOOMED_IN_AA:
      return { ...state, jmolPdbAaSubs: { ...state.jmolPdbAaSubs, zoomedInAa: action.payload } }
    case ActionTypes.IF_JMOL_DELAY_HOVER:
      return { ...state, ifJmolDelayHover: action.payload }
    case ActionTypes.IF_JMOL_WIREFRAME_ONLY:
      return { ...state, ifJmolWireframeOnly: action.payload }
    case ActionTypes.ADD_INDP_MOL_PDB_ID_QUERY:
      return { ...state, indpPdbIdQueries: action.payload as Array<string> }
    case ActionTypes.DEL_INDP_MOL_PDB_ID_QUERY:
      return { ...state, indpPdbIdQueries: state.indpPdbIdQueries.filter(query => query !== <string>action.payload) }
    case ActionTypes.SET_3DMOL_PDB_ID:
      return { ...state, mol3DPdbAa: { pdbToLoad: action.payload } }
    case ActionTypes.SET_3DMOL_ZOOMED_IN_AA:
      return { ...state, mol3DPdbAa: { ...state.mol3DPdbAa, zoomedInAa: action.payload } }
    default:
      return state;
  }
}