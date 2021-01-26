import React, { FC, useState, useEffect, useLayoutEffect } from 'react';
import $ from 'jquery';
import { Navbar, NavbarBrand } from 'reactstrap';
import { appendAsyncScript, removeAsyncScriptBySrc, processedPdbId } from '../../shared/Funcs';
import { FRONTEND_PREFIX } from '../../shared/Consts';
import '../../css/Mol3D.css';

const Mol3D: FC<MolProps> = (props) => {
  const [molState, setMolState] = useState<MolDisplayState>({
    divHidden: true,
  });

  const divToggle = () => {
    setMolState((prevState) => {
      return {
        ...prevState,
        divHidden: !prevState.divHidden,
      };
    });
  }
  const default3DmolView = (element: JQuery<HTMLElement>, config: object) => {
    let viewer: $3Dmol.GLViewer = $3Dmol.createViewer(element, config);
    $3Dmol.download(
      `pdb:${processedPdbId(props.pdbQueries[0].pdbId)}`,
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
  }

  useLayoutEffect(() => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/3Dmol-min.js`);
    return () => {
      removeAsyncScriptBySrc(`${FRONTEND_PREFIX}/assets/3Dmol-min.js`);
    };
  }, []);
  useEffect(() => {
    const GLViewerElement = $('#mol3D-container');
    let GLViewerConfig = {
      backgroundColor: 0xe0e0e0,
    };

    if (molState.divHidden === false) {
      default3DmolView(GLViewerElement, GLViewerConfig);
    }
    // eslint-disable-next-line
  }, [props.pdbQueries[0].pdbId, molState]);

  return (
    <div id="Mol3D-div">
      <Navbar dark color="dark">
        <div style={{ margin: '0 auto' }}>
          <NavbarBrand
            href="https://3dmol.csb.pitt.edu"
            target="_blank"
            className="mol3dNav"
          >
            See official doc of 3Dmol
          </NavbarBrand>
        </div>
      </Navbar>
      <button className="btn btn-warning btn-sm molBtn" onClick={divToggle}>
        {molState.divHidden
          ? `Show 3Dmol of pdbID ${processedPdbId(props.pdbQueries[0].pdbId)}`
          : `Hide 3Dmol of pdbID ${processedPdbId(props.pdbQueries[0].pdbId)} above`}
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
