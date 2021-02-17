import React, { FC, useState, useEffect, useLayoutEffect } from 'react';
import $ from 'jquery';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, NavbarBrand, CardTitle } from 'reactstrap';
import {
  appendAsyncScript,
  removeAsyncScriptBySrc,
  processedPdbId,
} from '../../shared/Funcs';
import { AA_1_TO_3, AA_3_TO_1 } from '../../shared/Consts';
import { FRONTEND_PREFIX } from '../../shared/Consts';

type AaPos = Omit<AaSub, 'target' | 'oldAa'>;

const Mol3D: FC<SubMolProps> = (props) => {
  const aaPreds = props.aaPreds;
  const dispatch = useDispatch<Dispatch<PayloadAction>>();
  const zoomedInAa = useSelector<AppReduxState, AaPos | undefined>(
    (state) => state.molVis.mol3DPdbAa.zoomedInAa
  );
  const aaSubList = useSelector<AppReduxState, Array<AaPos>>(
    (state) => state.molVis.mol3DPdbAa.aaPoses
  );
  const [molState, setMolState] = useState<MolDisplayState>({
    divHidden: true,
  });
  const [displayOptions, setDisplayOptions] = useState<
    Partial<JmolDisplayOptions>
  >({
    highLightSelected: false,
    selectedChain: '',
  });

  const divToggle = () => {
    setMolState((prevState) => {
      return {
        ...prevState,
        divHidden: !prevState.divHidden,
      };
    });
  };
  const view3Dmol = (element: JQuery<HTMLElement>, config: object) => {
    let viewer: $3Dmol.GLViewer = $3Dmol.createViewer(element, config);
    $3Dmol.download(
      `pdb:${processedPdbId(props.pdbId)}`,
      viewer,
      { onemol: true, multimodel: true },
      (model) => {
        model.setStyle({}, { stick: {} });
        viewer.setStyle({chain: "A", resi:["91-92"]}, {stick:{radius:0.15},cartoon:{color: 'green'}});
        viewer.render();
        viewer.zoomTo({chain: "A", resi:["91-92"]}, 1000);
        viewer.addLabel('Aromatic', {
          position: { x: -6.89, y: 0.75, z: 0.35 },
          backgroundColor: 0x800080,
          backgroundOpacity: 0.8,
        });
        viewer.setStyle({ chain: 'A' }, { cross: { hidden: true } });
        viewer.setStyle(
          { chain: 'B' },
          {
            cross: {
              hidden: false,
              linewidth: 1.0,
              colorscheme: 'greenCarbon',
            },
          }
        );
        viewer.setStyle(
          { chain: 'C' },
          { cross: { hidden: false, linewidth: 1.0, radius: 0.5 } }
        );
        viewer.setStyle(
          { chain: 'D' },
          { cross: { hidden: false, linewidth: 10.0 } }
        );
        viewer.setStyle(
          { chain: 'E' },
          { cross: { hidden: false, linewidth: 1.0, color: 'black' } }
        );
      }
    );
  };

  useLayoutEffect(() => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/3Dmol-min.js`);
    return () => {
      removeAsyncScriptBySrc(`${FRONTEND_PREFIX}/assets/3Dmol-min.js`);
    };
  }, []);
  useEffect(() => {
    props.pdbId === ''
      ? setTimeout(() => setMolState({ divHidden: true }), 50)
      : setTimeout(() => {
          setMolState({ divHidden: false });
          setDisplayOptions((prevState) => ({
            ...prevState,
            selectedChain: '',
            highLightSelected: false,
          }));
        }, 50);
  }, [props.pdbId]);
  useEffect(() => {
    if (molState.divHidden === false) {
      const GLViewerElement = $('#mol3D-container');
      let GLViewerConfig = {
        backgroundColor: 0xfff8f9,
      };
      setTimeout(() => view3Dmol(GLViewerElement, GLViewerConfig), 100);
    }
  }, [displayOptions, aaSubList, zoomedInAa]);

  return (
    <div className="mol-wrapper container-fluid row">
      {aaPreds.goodList.length === 0 && aaPreds.badList.length === 0 ? (
        <div className="molIndpOptionsList">
          <ol className="pdb-query-ol"></ol>
        </div>
      ) : (
        <div className="molOptionsList">
          <ol className="pdb-query-ol"></ol>
        </div>
      )}
      <div id="mol3D-div">
        <div className="row">
          <Navbar
            dark
            color="dark"
            style={{
              margin: 0,
              marginLeft: '1rem',
              padding: 0,
              paddingLeft: '1rem',
            }}
          >
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
              : `Hide 3Dmol of pdbID ${processedPdbId(props.pdbId)}`}
          </button>
        </div>
        <div
          className="mol-container"
          id="mol3D-container"
          style={molState.divHidden ? { display: 'none' } : {}}
        ></div>
      </div>
    </div>
  );
};

export default Mol3D;
