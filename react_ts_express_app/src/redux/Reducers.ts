import * as ActionTypes from './ActionTypes';

const initialAaClashState: AaClashQueryState = {
  queries: [],
  isLoading: true,
  errMsg: null,
};

export const AaClashQueryReducer = (state = initialAaClashState, 
    action: ReturnType<ReduxAction>): AaClashQueryState => {
  switch (action.type) {
    case ActionTypes.ADD_PDB_QUERY:
        return { ...state, queries: action.payload, isLoading: false };
    case ActionTypes.LOADING_PDB_QUERY:
        return { ...state, isLoading: true, errMsg: null };
    case ActionTypes.PDB_QUERY_FAILED:
        return { ...state, isLoading: false, errMsg: action.payload }
    default: return state;
  }
};