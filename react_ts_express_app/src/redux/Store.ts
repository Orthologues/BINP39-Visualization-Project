import { AaClashQueryReducer, RcsbGqlReducer } from './Reducers';
import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

const rootConfig = {
  key: 'root',
  storage: storage,
  debug: true,
  blacklist: ['aaClashQuery']
}

const aaClashQueryConfig = {
  key: 'aaClashQuery',
  storage: storage,
  blacklist: ['queryMode', 'errMsg']
}

const persistentThunkLoggerStore = () => {
  const store = createStore(
    persistCombineReducers(rootConfig, {
      aaClashQuery: persistReducer(aaClashQueryConfig, AaClashQueryReducer),
      rcsbGraphQl: RcsbGqlReducer
    }),
    applyMiddleware(thunk, logger)
  );
  const persister = persistStore(store)
  return { persister, store };
};

export default persistentThunkLoggerStore;