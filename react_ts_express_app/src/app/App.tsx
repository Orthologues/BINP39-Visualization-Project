// External ApolloClient(for GraphQL) and external Redux-Store shall be added here

import React, { Component } from 'react';
import Main from '../components/MainComponent';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import { Provider as ReduxProvider } from 'react-redux';
import { createThunkLoggerStore } from '../redux/Store';
import '../css/App.css';

const rcsbClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'https://data.rcsb.org/graphql',
});

const Store = createThunkLoggerStore();

class App extends Component<any, any> {
  render() {
    return (
      <ApolloProvider client={rcsbClient}>
        <ApolloHooksProvider client={rcsbClient}>
          <ReduxProvider store={Store}>
            <div className="App">
              <Main />
            </div>
          </ReduxProvider>
        </ApolloHooksProvider>
      </ApolloProvider>
    );
  }
}

export default App;
