import React, { Component } from 'react'
import Main from '../components/MainComponent'
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import Store from '../redux/reduxStore';
import '../css/App.css'; // use my own inline styles instead

const rcsbClient = new ApolloClient({
  uri: 'https://data.rcsb.org/graphql/'
});


class App extends Component<any, any> {

    render() {
        return (
          <ApolloProvider client={rcsbClient}>
            <ApolloHooksProvider client={rcsbClient}>
              <ReduxProvider store={Store}>
                <Router>
                  <div className="App">
                    <Main />
                  </div>
                </Router>
              </ReduxProvider>
            </ApolloHooksProvider>
          </ApolloProvider>
        );
    }
}

export default App;
