import React, { useState, useEffect } from 'react';
// import { render } from 'react-dom';
import $ from 'jquery';

type molProps = {
  id: string;
  pdbQuery: string;
}

type molDisplayState = {
  divHeight: number;
  divHidden: boolean;
}

function Mol3D(props: molProps) {

  const [molState, setMolState] = useState<molDisplayState>({ divHeight: 0, divHidden: true });

  function divToggle(): void {
    setMolState(prevState => {
      return {
        ...prevState,
        divHidden: !prevState.divHidden
      }
    });
  }

  function processedPdbQuery(pdbQuery: string): string {
    return pdbQuery.replace(/^\s+|\s+$/g, '').toUpperCase();
  }

  useEffect((): void => {
    if (molState.divHidden === false) {
      let element = $("#mol3D-container");
      let config: Object = {
        backgroundColor: 0xD3D3D3
      };
      let viewer: $3Dmol.GLViewer = $3Dmol.createViewer(element, config);
      $3Dmol.download(`pdb:${processedPdbQuery(props.pdbQuery)}`, viewer, {
        onemol: true,
        multimodel: true
      }, (m) => {
        m.setStyle({}, { stick: {} });
        viewer.zoomTo();
        viewer.render();
      });
      viewer.zoom(1, 2000);
    }
  }, [props.pdbQuery, molState]);

  return (
    <div id="Mol3D-div">
      <div className="mol-container"
        id="mol3D-container"
        style={molState.divHidden ? { display: 'none' } : {}}
      ></div>
      <button
        className="btn btn-warning btn-sm molBtn"
        onClick={divToggle}>
        {molState.divHidden ? `Show 3Dmol of pdbID ${processedPdbQuery(props.pdbQuery)}` : `Hide 3Dmol of pdbID ${processedPdbQuery(props.pdbQuery)} above`}
      </button>
    </div>
  );
}

export default Mol3D;
