import React, { Component } from 'react'
import Main from '../components/MainComponent'
import { Provider } from 'react-redux';
import Store from '../redux/reduxStore';
import '../css/App.css'; // use my own inline styles instead


class App extends Component<any, any> {

    render() {
        return (
            <Provider store={Store}>
              <div className="App">
                <Main />
              </div>
            </Provider>
        );
    }
}

export default App;
