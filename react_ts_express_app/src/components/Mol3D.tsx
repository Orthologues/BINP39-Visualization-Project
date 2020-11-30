import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { molProps, molDisplayState } from '../shared_types_interfaces/sharedTypes'


function Mol3D(props: molProps): JSX.Element {

  const [molState, setMolState] = useState<molDisplayState>({ divHidden: true });
  const [GLviewer, setGLviewer] = useState($3Dmol.createViewer($("#mol3D-container"), {}));

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

  // Initiate a $3Dmol.GLViewer when this React.FC mounts
  // remove any models from $3Dmol.GLViewer when this React.FC unmounts
  useEffect(() => {
    return () => {
      GLviewer.removeAllModels();
    }
  }, []);

  useEffect((): void => {

    if (molState.divHidden === false) {

      setGLviewer($3Dmol.createViewer($("#mol3D-container"), {
        backgroundColor: 0xD9D9D9
      }));

      // let element = $("#mol3D-container");
      // let config: Object = {
      //   backgroundColor: 0xD3D3D3
      // };
      // let viewer: $3Dmol.GLViewer = $3Dmol.createViewer(element, config);
      $3Dmol.download(`pdb:${processedPdbQuery(props.pdbQuery)}`,
        GLviewer,
        {
          onemol: true,
          multimodel: true
        },
        (model) => {
          model.setStyle({}, { stick: {} });
          GLviewer.zoomTo();
          GLviewer.render();
          GLviewer.zoom(1, 2000);
        });
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
