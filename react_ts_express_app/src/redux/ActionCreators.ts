// this module defines redux-actions (default actions which return to 'object' //
// & non-default thunk actions which return to 'void' ) //

import * as ActionTypes from './ActionTypes';
import axios from 'axios';
import { SRV_URL_PREFIX } from '../shared/Consts';
import { ThunkAction } from 'redux-thunk';

// actions that return to objects (don't require redux-thunk)
export const addPdbQuery = (queries: PdbIdAaQuery[], predResults: AaClashPredData): PayloadAction => ({
  type: ActionTypes.ADD_PDB_CODE_QUERY,
  payload: { queries: queries, predResults: predResults }
});

export const appendPdbQuery = (queries: PdbIdAaQuery[], predResults: AaClashPredData): PayloadAction => ({
  type: ActionTypes.APPEND_PDB_CODE_QUERY_HISTORY,
  payload: { queries: queries, predResults: predResults }
});

export const loadingPdbQuery = (): PayloadAction => ({
  type: ActionTypes.LOADING_PDB_QUERY,
});

export const pdbQueryFailed = (errMsg: string | Array<string>): PayloadAction => ({
  type: ActionTypes.PDB_QUERY_FAILED,
  payload: errMsg,
});

export const postPdbAaQuery = (
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
      const aaClashPredResult: AaClashPredData = aaClashData.aaClash; 
      const pyRunInfo: PyScriptResponse = aaClashData.pyRunInfo;
      pyRunInfo.code === 0 ?
      dispatch(addPdbQuery(queries, aaClashPredResult)) && 
      dispatch(appendPdbQuery(queries, aaClashPredResult)) :
      dispatch(pdbQueryFailed([`Error while running the python scripts for AA steric-clash on our server!`,
      `Exit code: ${pyRunInfo.code}`,
      `Stderr: ${pyRunInfo.finalText}`]));
    })
    .catch((error: Error) => dispatch(pdbQueryFailed(error.message)));
};

export const switchAaClashQueryMode = (newMode: 'PDB-CODE' | 'FILE'): PayloadAction => ({
  type: ActionTypes.SWITCH_AACLASH_QUERY_MODE,
  payload: newMode
});