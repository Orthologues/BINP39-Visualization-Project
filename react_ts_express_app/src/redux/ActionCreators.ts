import * as ActionTypes from './ActionTypes';
import axios from 'axios';
import { srvUrlPrefix } from '../shared/sharedConsts';


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

export const fetchAaClashPred = () => async (dispatch: DispatchReduxAction) => {
    dispatch(loadingPdbQuery);
}

