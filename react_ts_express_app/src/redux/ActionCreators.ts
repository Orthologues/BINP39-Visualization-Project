// this module defines redux-actions (default actions which return to 'object' //
// & non-default thunk actions which return to 'void' ) //

import * as ActionTypes from './ActionTypes';
import axios from 'axios';
import { SRV_URL_PREFIX } from '../shared/Consts';
import { ThunkAction } from 'redux-thunk';

// actions that return to objects (don't require redux-thunk)
export const addPdbQuery = (queries: PdbIdAaQuery[]): PayloadAction => ({
  type: ActionTypes.ADD_PDB_CODE_QUERY,
  payload: queries,
});

export const loadingPdbQuery = (): PayloadAction => ({
  type: ActionTypes.LOADING_PDB_QUERY,
});

export const pdbQueryFailed = (errMsg: string): PayloadAction => ({
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
      console.log(JSON.stringify(aaClashPredResult));
      console.log(JSON.stringify(pyRunInfo));
      // if (! (aaClashPredResult.goodAcids && aaClashPredResult.badAcids)) {
      //   console.log(JSON.stringify(pyRunInfo));
      // }
      dispatch(addPdbQuery(queries))
    })
    .catch((error: Error) => dispatch(pdbQueryFailed(error.message)));
};

export const switchPdbInfoSrc = (newSrc: 'pdbe' | 'rcsb'): PayloadAction => ({
  type: ActionTypes.SWITCH_PDB_INFO_SRC,
  payload: newSrc
});