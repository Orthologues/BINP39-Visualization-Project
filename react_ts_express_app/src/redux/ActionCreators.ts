import * as ActionTypes from './ActionTypes';
import axios from 'axios';
import { SRV_URL_PREFIX } from '../shared/Consts';
import { AXIOS_POST_OPTION } from '../shared/Funcs';


// actions that return to objects (don't require redux-thunk)
export const addPdbQuery: ReduxAction = (queries: PdbIdAaQuery[]) => ({
    type: ActionTypes.ADD_PDB_QUERY,
    payload: queries
});

export const loadingPdbQuery: ReduxAction = () => ({
    type: ActionTypes.LOADING_PDB_QUERY
});

export const pdbQueryFailed: ReduxAction = (errMsg: string) => ({
    type: ActionTypes.PDB_QUERY_FAILED,
    payload: errMsg
});

export const postPdbAaQuery = (queries: PdbIdAaQuery[]) => async (dispatch: DispatchReduxAction) => {
    dispatch(loadingPdbQuery);
    await axios(AXIOS_POST_OPTION(`${SRV_URL_PREFIX}/pon-sc`, queries)).then(

    )
}

