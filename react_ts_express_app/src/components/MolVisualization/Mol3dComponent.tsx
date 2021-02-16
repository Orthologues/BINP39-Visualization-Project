import React, { FC, useState, useEffect, useLayoutEffect } from 'react';
import $ from 'jquery';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, NavbarBrand, CardTitle } from 'reactstrap';
import { appendAsyncScript, removeAsyncScriptBySrc, processedPdbId } from '../../shared/Funcs';
import { AA_1_TO_3, AA_3_TO_1 } from '../../shared/Consts';
import { FRONTEND_PREFIX } from '../../shared/Consts';

const Mol3D: FC<SubMolProps> = (props) => {
  const aaPreds = props.aaPreds;
  const dispatch = useDispatch<Dispatch<PayloadAction>>();
  const zoomedInAa = useSelector<AppReduxState, Omit<AaSub, 'target'|'oldAa'> | undefined>(
    state => state.molVis.mol3DPdbAa.zoomedInAa
  )
  const [molState, setMolState] = useState<MolDisplayState>({ divHidden: true });

  const divToggle = () => {
    setMolState((prevState) => {
      return {
        ...prevState,
        divHidden: !prevState.divHidden,
      };
    });
  };
  const default3DmolView = (element: JQuery<HTMLElement>, config: object) => {
    let viewer: $3Dmol.GLViewer = $3Dmol.createViewer(element, config);
    $3Dmol.download(`pdb:${processedPdbId(props.pdbId)}`, viewer, { onemol: true, multimodel: true },
      (model) => {
        model.setStyle({}, { stick: {} });
        viewer.zoomTo();
        viewer.render();
      }
    );
    viewer.zoom(0.9, 1000);
  };

  useLayoutEffect(() => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/3Dmol-min.js`);
    setTimeout(() => setMolState({divHidden: false}), 1000);
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
      setTimeout(() => default3DmolView(GLViewerElement, GLViewerConfig), 100);
    }
    // eslint-disable-next-line
  }, [props.pdbId, molState]);

  return (
    <div className='mol-wrapper container-fluid row'>
      <div className='molOptionsList'>
        <CardTitle tag="h6" style={{ marginTop: '12px' }}>Visualization Options</CardTitle>
        <ol className='pdb-query-ol'>
        {
          aaPreds.goodList.length > 0 && aaPreds.goodList.map((item, ind) => 
            <li key={`${props.pdbId}_good_acid_${ind}`} className='aaPosSubGoodItem'>
              {item.chain}: {item.oldAa}{item.pos}{item.newAa}
            </li>
          )
        }
        </ol>
        <ol className='pdb-query-ol'>
        {
          aaPreds.badList.length > 0 && aaPreds.badList.map((item, ind) => 
            <li key={`${props.pdbId}_bad_acid_${ind}`} className='aaPosSubBadItem'>
              {item.chain}: {item.oldAa}{item.pos}{item.newAa}
            </li>
          )
        }
        </ol>
      </div>
      <div id="mol3D-div">
        <div className="row">
          <Navbar dark color="dark" 
          style={{margin: 0, marginLeft: '1rem', padding: 0, paddingLeft: '1rem'}}>
            <NavbarBrand
              href="https://3dmol.csb.pitt.edu"
              target="_blank"
              className="mol3dNav"
            >
              See official doc of 3Dmol
            </NavbarBrand>
          </Navbar>
          <button className="btn btn-warning btn-sm" onClick={divToggle}>
            {molState.divHidden
              ? `Show 3Dmol of pdbID ${processedPdbId(props.pdbId)}`
              : `Hide 3Dmol of pdbID ${processedPdbId(props.pdbId)}`
            }
          </button>
        </div>
        <div
          className="mol-container" id="mol3D-container"
          style={molState.divHidden ? { display: 'none' } : {}}
        ></div>
      </div>
    </div>
  );
};

export default Mol3D;
