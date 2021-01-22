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
export const appendFileQuery = (query: PdbFileQueryStore, predResults: AaClashPredData): PayloadAction => ({
  type: ActionTypes.APPEND_PDB_FILE_QUERY_HISTORY, payload: { query: query, predResults: predResults }
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
): ThunkAction<Promise<void>, AaClashQueryState, undefined, PayloadAction> => async (dispatch) => {
  dispatch(loadingPdbQuery());
  // dispatch(addPdbQuery(queries)); // just for test
  await axios.post(`${SRV_URL_PREFIX}/pon-scp/pred/code`, JSON.stringify({ queries: queries }), 
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
ThunkAction<Promise<void>, AaClashQueryState, undefined, PayloadAction> => async(dispatch) => {
  dispatch(loadingPdbQuery());
  await axios.post(`${SRV_URL_PREFIX}/pon-scp/pred/file`, formData, 
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
      `The '.pdb' file which you uploaded couldn't be parsed correctly!`]));
    })
    .catch((error: Error) => dispatch(pdbQueryFailed(error.message)));
}

// actions for RCSB_PDB GraphQL API
export const switchGqlListMode = (newMode: 'latest' | 'history'): PayloadAction => ({
  type: ActionTypes.SWITCH_LIST_DISPLAY_MODE,
  payload: newMode
})
export const selectGqlPdbId = (clickedPdbId: string): PayloadAction => ({
  type: ActionTypes.SELECT_RCSB_PDB_ID,
  payload: clickedPdbId
})