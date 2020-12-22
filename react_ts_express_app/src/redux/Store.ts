import { AaClashQueryReducer } from './Reducers';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

export const createThunkLoggerStore = () => {
  const thunk_logger_store = createStore(
    combineReducers({
      aaClash: AaClashQueryReducer,
    }),
    applyMiddleware(thunk, logger)
  );

  return thunk_logger_store;
};
