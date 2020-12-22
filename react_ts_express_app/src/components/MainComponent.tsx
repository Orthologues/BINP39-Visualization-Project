import React, { useState } from 'react';
import JsMol from './JmolComponent';
import Mol3D from './Mol3dComponent';
import Footer from './FooterComponent';

function MainComponent() {
  // const [pdbInput, setPdbInput] = useState<string>('');
  const [pdbQuery, setPdbQuery] = useState<string>('');
  // const changePdbInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
  //   setPdbInput(evt.target.value);
  // }

  const submitPdbQuery = (evt: React.MouseEvent<HTMLButtonElement>) => {
    setPdbQuery(
      (document.getElementById('pdb-input') as HTMLInputElement).value
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {/* onChange={changePdbInput} */}
          <input
            type="text"
            id="pdb-input"
            placeholder="pdb code. For example: 3cmp"
          />
          <button
            className="btn btn-light"
            id="pdb-submit"
            onClick={submitPdbQuery}
          >
            See results!
          </button>
        </div>
        <div className="mol-div">
          <JsMol key={`mol_js_${pdbQuery}`} pdbQuery={pdbQuery} />
          <Mol3D key={`mol_3d_${pdbQuery}`} pdbQuery={pdbQuery} />
        </div>
      </header>
      <Footer />
    </div>
  );
}

export default MainComponent;