// this module defines redux-actions (default actions which return to 'object' //
// & non-default thunk actions which return to 'void' ) //

import * as ActionTypes from './ActionTypes';
import axios from 'axios';
import { SRV_URL_PREFIX } from '../shared/Consts';
import { ThunkAction } from 'redux-thunk';

// actions that return to objects (don't require redux-thunk)
export const resetAppReduxState = (): PayloadAction => ({
  type: ActionTypes.RESET_REDUX_APP_STATE
});

export const handleCodeQueryInput = (inputValue: string): PayloadAction => ({
  type: ActionTypes.HANDLE_CODE_QUERY_INPUT, payload: inputValue });
export const handleFileQueryInput = (inputValue: string): PayloadAction => ({
  type: ActionTypes.HANDLE_FILE_QUERY_INPUT, payload: inputValue }); 

export const addCodeQuery = (queries: PdbIdAaQuery[], predResults: AaClashPredData[]): PayloadAction => ({
  type: ActionTypes.ADD_PDB_CODE_QUERY, payload: { queries: queries, predResults: predResults }
});
export const addFileQuery= (query: PdbFileQueryStore, predResult: AaClashPredData): PayloadAction => ({
  type: ActionTypes.ADD_PDB_FILE_QUERY, payload: { query: query, predResult: predResult }
});

export const deleteCodeQuery = (query: PdbIdAaQuery): PayloadAction => ({
  type: ActionTypes.DELETE_PDB_CODE_QUERY, payload: query
});
export const deleteFileQuery= (query: PdbFileQueryStore): PayloadAction => ({
  type: ActionTypes.DELETE_PDB_FILE_QUERY, payload: query
});

export const appendCodeQuery = (queries: PdbIdAaQuery[], predResults: AaClashPredData[]): PayloadAction => ({
  type: ActionTypes.APPEND_PDB_CODE_QUERY_HISTORY, payload: { queries: queries, predResults: predResults }
});
export const appendFileQuery = (query: PdbFileQueryStore, predResult: AaClashPredData): PayloadAction => ({
  type: ActionTypes.APPEND_PDB_FILE_QUERY_HISTORY, payload: { query: query, predResult: predResult }
});

export const eraseCodeQueryHistory = (): PayloadAction => ({
  type: ActionTypes.ERASE_PDB_CODE_QUERY_HISTORY
});
export const eraseFileQueryHistory = (): PayloadAction => ({
  type: ActionTypes.ERASE_PDB_FILE_QUERY_HISTORY
});

export const switchAaClashQueryMode = (newMode: 'PDB-CODE' | 'FILE'): PayloadAction => ({
  type: ActionTypes.SWITCH_AACLASH_QUERY_MODE, payload: newMode
});
export const loadingPdbQuery = (): PayloadAction => ({
  type: ActionTypes.LOADING_PDB_QUERY
});
export const pdbQueryFailed = (errMsg: string | Array<string>): PayloadAction => ({
  type: ActionTypes.PDB_QUERY_FAILED, payload: errMsg,
});


export const postCodeQuery = (
  queries: PdbIdAaQuery[]
): ThunkAction<Promise<void>, AaClashQueryState, undefined, PayloadAction> => async dispatch => {
  dispatch(loadingPdbQuery());
  // dispatch(addPdbQuery(queries)); // just for test
  axios.post(`${SRV_URL_PREFIX}/pon-scp/pred/code`, JSON.stringify({ queries: queries }), 
  { headers: { 'Content-Type': 'application/json' } }
  ).then((response) => {
      if (response.statusText === 'OK' || response.status === 200) {
        return response;
      } else {
        let nonOkError = new Error(
          `Could not fetch aa-clash prediction from API server! 
          Error${response.status}: ${response.statusText}`
        );
        throw nonOkError;
      }
    }).then((response) => {
      const aaClashData: AaClashDataToClient = response.data;
      let predResults = aaClashData.aaClash; 
      const pyRunInfo: PyScriptResponse = aaClashData.pyRunInfo;
      pyRunInfo.code === 0 ?
      dispatch(addCodeQuery(queries, <Array<AaClashPredData>>predResults)) && 
      dispatch(appendCodeQuery(queries, <Array<AaClashPredData>>predResults)) :
      dispatch(pdbQueryFailed([`Error while running the python scripts for AA steric-clash on our server!`,
      `Exit code: ${pyRunInfo.code}`,
      `Stderr: ${pyRunInfo.finalText}`]));
    })
    .catch((error: Error) => dispatch(pdbQueryFailed(error.message)));
}

export const postFileQuery = (formData: PdbQueryFormData, query: PdbFileQueryStore): 
ThunkAction<Promise<void>, AaClashQueryState, undefined, PayloadAction> => async dispatch => {
  dispatch(loadingPdbQuery());
  axios.post(`${SRV_URL_PREFIX}/pon-scp/pred/file`, formData, 
  { headers: { 'Content-Type': 'multipart/form-data' } } 
  ).then((response) => {
      if (response.statusText === 'OK' || response.status === 200) {
        return response;
      } else {
        let nonOkError = new Error(
          `Could not fetch aa-clash prediction from API server! 
          Error${response.status}: ${response.statusText}`
        );
        throw nonOkError;
      }
    }).then((response) => {
      const aaClashData: AaClashDataToClient = response.data;
      let predResult = aaClashData.aaClash; 
      const pyRunInfo: PyScriptResponse = aaClashData.pyRunInfo;
      pyRunInfo.code === 0 && JSON.stringify(predResult).match(`.+goodAcids.+`) ?
      dispatch(addFileQuery(query, <AaClashPredData>predResult)) && 
      dispatch(appendFileQuery(query, <AaClashPredData>predResult)) :
      dispatch(pdbQueryFailed([`Error while running the python scripts for AA steric-clash on our server!`,
      `Exit code: ${pyRunInfo.code}`,
      pyRunInfo.code === 0 ? `The '.pdb' file which you uploaded couldn't be parsed correctly!` :
      `Stderr: ${pyRunInfo.finalText}`]));
    })
    .catch((error: Error) => dispatch(pdbQueryFailed(error.message)));
}

// actions for RCSB_PDB GraphQL API
export const switchGqlListMode = (newMode: 'latest' | 'history'): PayloadAction => ({
  type: ActionTypes.SWITCH_RCSB_LIST_DISPLAY_MODE,
  payload: newMode
})
export const selectGqlPdbId = (clickedPdbId: string): PayloadAction => ({
  type: ActionTypes.SELECT_RCSB_PDB_ID,
  payload: clickedPdbId
})
export const addIndpRcsbPdbIdQuery = (pdbIds: Array<string>): PayloadAction => ({
  type: ActionTypes.ADD_INDP_RCSB_PDB_ID_QUERY,
  payload: pdbIds
})
export const deleteIndpRcsbPdbIdQuery = (pdbId: string): PayloadAction => ({
  type: ActionTypes.DELETE_INDP_RCSB_ID_QUERY,
  payload: pdbId
})

//MolComponent Actions
export const switchMolListDisplayMode = (newMode: 'latest' | 'history'): PayloadAction => ({
  type: ActionTypes.SWITCH_MOL_LIST_DISPLAY_MODE,
  payload: newMode
})
export const switchMolVisChoice = (newChoice: 'Jmol' | '3Dmol'): PayloadAction => ({
  type: ActionTypes.SWITCH_MOL_VIS_CHOICE,
  payload: newChoice
})
export const addIndpMolPdbIdQuery = (pdbIds: Array<string>): PayloadAction => ({
  type: ActionTypes.ADD_INDP_MOL_PDB_ID_QUERY,
  payload: pdbIds
}) 
export const delIndpMolPdbIdQuery = (pdbId: string): PayloadAction => ({
  type: ActionTypes.DEL_INDP_MOL_PDB_ID_QUERY,
  payload: pdbId
})
// Actions for Jmol
export const setJmolPdbId = (selectedPdbId: string): PayloadAction => ({
  type: ActionTypes.SET_JMOL_PDB_ID,
  payload: selectedPdbId
})
// type 'PdbIdAaQuery' is for AA-Clash Queries, 'string' is for independent queries
export const setJmolAaSubList = (pdbIdQuery: PdbIdAaQuery|string, aaSubs: Array<AaSub>): PayloadAction => ({
  type: ActionTypes.SET_JMOL_AA_SUB_LIST,
  payload: {pdbToLoad: pdbIdQuery, aaSubs: aaSubs} as JmolPdbAaSubs
}) 
export const setJmolZoomedInAa = (aaToZoomIn: string|number): PayloadAction => ({
  type: ActionTypes.SET_JMOL_ZOOMED_IN_AA,
  payload: aaToZoomIn
})
export const ifJmolWireframeOnly = (newVal: boolean): PayloadAction => ({
  type: ActionTypes.IF_JMOL_WIREFRAME_ONLY,
  payload: newVal
})
export const ifJmolDelayHover = (newVal: boolean): PayloadAction => ({
  type: ActionTypes.IF_JMOL_DELAY_HOVER,
  payload: newVal
})
// Actions for 3Dmol
export const set3DmolPdbId = (selectedPdbId: string): PayloadAction => ({
  type: ActionTypes.SET_3DMOL_PDB_ID,
  payload: selectedPdbId
})
export const set3DmolZoomedInAa = (aaToZoomIn: string|number): PayloadAction => ({
  type: ActionTypes.SET_3DMOL_ZOOMED_IN_AA,
  payload: aaToZoomIn
}) 