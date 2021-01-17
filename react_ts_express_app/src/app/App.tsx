// External ApolloClient(for GraphQL) and external Redux-Store shall be added here
// react-router with different routes and react-transition-group shall be applied here
// Header and Footer shall be applied here

import React, { Component } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks';
import { Provider as ReduxProvider } from 'react-redux';
import { createThunkLoggerStore } from '../redux/Store';
import { BrowserRouter as Router } from 'react-router-dom';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import Header from '../components/HeaderComponent';
import Footer from '../components/FooterComponent';
import Main from '../components/MainComponent';
import About from '../components/AboutComponent';
import Disclaimer from '../components/DisclaimerComponent';
import RcsbGraphQl from '../components/RcsbPdbGql';
import MolVis from '../components/MolVisualization';
import '../css/App.css';

const rcsbClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'https://data.rcsb.org/graphql',
});

const Store = createThunkLoggerStore();

class App extends Component<any, any> {

  render() {

    const AnimatedRoutes = withRouter(() => {
      return (
          <Switch>
            <Route path='/home' component={Main} />
            <Route exact path='/about' component={About} />
            <Route exact path='/mol-visualization' component={MolVis} />
            <Route exact path='/rcsb-info' component={RcsbGraphQl} />
            <Route exact path='/disclaimer' component={Disclaimer} />
            <Redirect to="/home" />
          </Switch> 
          )  
        });

    return (
      <ApolloProvider client={rcsbClient}>
        <ApolloHooksProvider client={rcsbClient}>
          <ReduxProvider store={Store}>
            <Router>
              <div className="App">
                <Header />
                <AnimatedRoutes />
                <Footer />
              </div>
            </Router>
          </ReduxProvider>
        </ApolloHooksProvider>
      </ApolloProvider>
    );
  }
}

export default App;
