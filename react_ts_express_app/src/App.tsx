import React, { useState } from 'react';
import JsMol from './components/JsMol';
import Mol3D from './components/Mol3D'
import './css/App.css';
// import logo from './svg/logo.svg';

function App(): JSX.Element {

  // const [pdbInput, setPdbInput] = useState<string>('');
  const [pdbQuery, setPdbQuery] = useState<string>('');
  // const changePdbInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
  //   setPdbInput(evt.target.value);
  // }

  const submitPdbQuery = (evt: React.MouseEvent<HTMLButtonElement>) => {
    setPdbQuery((document.getElementById("pdb-input") as HTMLInputElement).value);
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <div>
          {/* onChange={changePdbInput} */}
          <input type="text" id="pdb-input" placeholder="pdb code. For example: 3cmp" />
          <button className="btn btn-light" id="pdb-submit" onClick={submitPdbQuery}>See results!</button>
        </div>
        <div className='mol-div'>
          <JsMol key="100" pdbQuery={pdbQuery} />
          <Mol3D key="200" pdbQuery={pdbQuery} />
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
