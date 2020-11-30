import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { molProps, molDisplayState } from '../shared_types_interfaces/sharedTypes'

function Mol3D(props: molProps): JSX.Element {

  const [molState, setMolState] = useState<molDisplayState>({ divHidden: true });

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

  function create3DmolViewer(element: JQuery<HTMLElement>, config: Object): void {
    let viewer: $3Dmol.GLViewer = $3Dmol.createViewer(element, config);
    $3Dmol.download(`pdb:${processedPdbQuery(props.pdbQuery)}`, viewer, {
      onemol: true,
      multimodel: true
    }, (model) => {
      model.setStyle({}, { stick: {} });
      viewer.zoomTo();
      viewer.render();
    });
    viewer.zoom(1, 2000);
    setTimeout(() => {
      viewer.removeAllModels();
    }, 5000);
  }

  useEffect((): void => {

    const GLViewerElement = $("#mol3D-container");
    let GLViewerConfig: Object = {
      backgroundColor: 0xE0E0E0
    };

    if (molState.divHidden === false) {
      create3DmolViewer(GLViewerElement, GLViewerConfig);
    }
    // eslint-disable-next-line
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
