import React from 'react';
// import logo from './logo.svg';
// import JsMol from './jsMol';
import JsMol from './JsMol';
import Mol3D from './Mol3D'
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        {/* <JsMol /> */}
        <div className='mol-div'>
          <JsMol id="100" pdbQuery=" 6vxx " />
          <Mol3D id="200" pdbQuery=" 3cmp  " />
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
