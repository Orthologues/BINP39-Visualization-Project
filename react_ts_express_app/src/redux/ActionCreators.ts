// this module defines redux-actions (default actions which return to 'object' //
// & non-default thunk actions which return to 'void' ) //

import * as ActionTypes from './ActionTypes';
import axios from 'axios';
import { SRV_URL_PREFIX } from '../shared/Consts';
import { AACLASH_API_AXIOS_AUTH } from '../shared/Secrets';
import { AXIOS_POST_OPTION } from '../shared/Funcs';
import { ThunkAction } from 'redux-thunk';

// actions that return to objects (don't require redux-thunk)
export const addPdbQuery = (queries: PdbIdAaQuery[]): PayloadAction => ({
  type: ActionTypes.ADD_PDB_QUERY,
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
  await axios(
    AXIOS_POST_OPTION(`${SRV_URL_PREFIX}/pon-sc`, { queries: queries }, AACLASH_API_AXIOS_AUTH)
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
    }).then((response) => dispatch(addPdbQuery(response.data.aaclash)))
    .catch((error: Error) => dispatch(pdbQueryFailed(error.message)));
};

export const switchPdbInfoSrc = (newSrc: 'pdbe' | 'rcsb'): PayloadAction => ({
  type: ActionTypes.SWITCH_PDB_INFO_SRC,
  payload: newSrc
});