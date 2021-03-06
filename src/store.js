import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { routerMiddleware } from 'react-router-redux';
import { createLogicMiddleware } from 'redux-logic';
// import createSagaMiddleware from 'redux-saga';

import createReducer from './reducers';
import { auth } from './Firebase';
import createLogic from './logic';

export default function configureStore(initialState, history) {

  const logicDeps = { // optional injected dependencies for logic
  // anything you need to have available in your logic
    auth: auth,
  };

  const logicMiddleware = createLogicMiddleware(createLogic, logicDeps);

  // Create the store with two middlewares
  // 1. logic Middleware
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    logicMiddleware,
    routerMiddleware(history),
  ];

  const enhancers = [
    applyMiddleware(...middlewares),
  ];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // TODO Try to remove when `react-router-redux` is out of beta, LOCATION_CHANGE should not be fired more than once after hot reloading
      // Prevent recomputing reducers for `replaceReducer`
      shouldHotReload: false,
    }) :
    compose;
  /* eslint-enable */

  const store = createStore(
    createReducer(),
    fromJS(initialState),
    composeEnhancers(...enhancers)
  );

  // Extensions
  // store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {}; // Reducer registry
  // store.injectedSagas = {}; // Saga registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }

  return store;
}
