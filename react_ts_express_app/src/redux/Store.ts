import { AaClashQueryReducer, PdbInfoSrcReducer } from './Reducers';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

export const createThunkLoggerStore = () => {
  const store = createStore(
    combineReducers({
      aaClashQuery: AaClashQueryReducer,
      pdbInfoSrc: PdbInfoSrcReducer
    }),
    applyMiddleware(thunk, logger)
  );
  return store;
};
