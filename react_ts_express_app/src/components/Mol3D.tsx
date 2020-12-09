import React, { useState, useEffect, useLayoutEffect } from 'react';
import $ from 'jquery';
import { Navbar, NavbarBrand } from 'reactstrap';
import { molProps, molDisplayState } from '../shared/sharedTypes';
import {
  appendAsyncScript,
  removeAsyncScriptBySrc,
} from '../shared/sharedUtils';

function Mol3D(props: molProps): JSX.Element {
  const [molState, setMolState] = useState<molDisplayState>({
    divHidden: true,
  });

  function divToggle(): void {
    setMolState((prevState) => {
      return {
        ...prevState,
        divHidden: !prevState.divHidden,
      };
    });
  }

  function processedPdbQuery(pdbQuery: string): string {
    return pdbQuery.replace(/^\s+|\s+$/g, '').toUpperCase();
  }

  function default3DmolView(
    element: JQuery<HTMLElement>,
    config: object
  ): void {
    let viewer: $3Dmol.GLViewer = $3Dmol.createViewer(element, config);
    $3Dmol.download(
      `pdb:${processedPdbQuery(props.pdbQuery)}`,
      viewer,
      {
        onemol: true,
        multimodel: true,
      },
      (model) => {
        model.setStyle({}, { stick: {} });
        viewer.zoomTo();
        viewer.render();
      }
    );
    viewer.zoom(0.9, 1000);
    /* testing $3Dmol.GLViewer.removeAllModels() && removeAsyncScriptBySrc(src: string)
    setTimeout(() => {
      viewer.removeAllModels();
    }, 3000);
    setTimeout(() => {
      removeAsyncScriptBySrc("http://localhost:3000/assets/3Dmol-min.js");
    }, 10000);
    // **/
  }

  useLayoutEffect((): void => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript('http://localhost:3000/assets/3Dmol-min.js');
  }, []);

  useEffect(() => {
    return () => {
      removeAsyncScriptBySrc('http://localhost:3000/assets/3Dmol-min.js');
    };
  }, []);

  useEffect((): void => {
    const GLViewerElement = $('#mol3D-container');
    let GLViewerConfig: Object = {
      backgroundColor: 0xe0e0e0,
    };

    if (molState.divHidden === false) {
      default3DmolView(GLViewerElement, GLViewerConfig);
    }
    // eslint-disable-next-line
  }, [props.pdbQuery, molState]);

  return (
    <div id="Mol3D-div">
      <Navbar dark color="dark">
        <div style={{ margin: '0 auto' }}>
          <NavbarBrand href="https://3dmol.csb.pitt.edu">
            See official doc of 3Dmol
          </NavbarBrand>
        </div>
      </Navbar>
      <button className="btn btn-warning btn-sm molBtn" onClick={divToggle}>
        {molState.divHidden
          ? `Show 3Dmol of pdbID ${processedPdbQuery(props.pdbQuery)}`
          : `Hide 3Dmol of pdbID ${processedPdbQuery(props.pdbQuery)} above`}
      </button>
      <div
        className="mol-container"
        id="mol3D-container"
        style={molState.divHidden ? { display: 'none' } : {}}
      ></div>
    </div>
  );
}

export default Mol3D;
