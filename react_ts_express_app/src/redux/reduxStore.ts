import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { Dishes } from './reducers/dishes';
// import { createForms } from 'react-redux-form';

const Store = createStore(
  combineReducers({
    dishes: Dishes,
  }),
  applyMiddleware(thunk, logger)
);

export default Store;