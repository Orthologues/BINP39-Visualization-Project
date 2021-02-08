import React, { FC, useState, useLayoutEffect, useEffect } from 'react';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import $ from 'jquery';
import { Navbar, NavbarBrand, CardTitle } from 'reactstrap';
import { appendAsyncScript, removeAsyncScriptBySrc, processedPdbId } from '../../shared/Funcs';
import { FRONTEND_PREFIX } from '../../shared/Consts';

const JsMol: FC<SubMolProps> = (props) => {
  const [molState, setMolState] = useState<MolDisplayState>({ divHidden: true });
  const dispatch = useDispatch<Dispatch<PayloadAction>>();

  const divToggle = () => {
    setMolState((prevState) => ({
      ...prevState,
      divHidden: !prevState.divHidden,
    }));
  }
  const renderJSmolHTML = (pdbCode: string) => {
    let JmolInfo = {
      width: '100%',
      height: '100%',
      color: '#E2F4F4',
      j2sPath: `${FRONTEND_PREFIX}/assets/JSmol/j2s`,
      serverURL: `${FRONTEND_PREFIX}/assets/JSmol/php/jsmol.php`,
      script: `set zoomlarge false; set antialiasDisplay; load =${pdbCode};
      x = "ARG or GLY"; select @x; set display SELECTED; wireframe only`,
      use: 'html5',
    };
    $('#jsmol-container').html(Jmol.getAppletHtml('html5Jmol', JmolInfo));
  }

  useLayoutEffect(() => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    return () => {
      removeAsyncScriptBySrc(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    };
  }, []);
  useEffect(() => {
    if (molState.divHidden === false) {
      renderJSmolHTML(props.pdbId);
    }
  }, [props.pdbId, molState]);

  return (
    <div className='mol-wrapper container-fluid row'>
      <div className='aaPosSubList'>
        <CardTitle tag="h6" style={{ marginTop: '12px' }}>Visualization Options</CardTitle>
        <ol className='pdb-query-ol'>
        {
          props.goodAcids.length > 0 && props.goodAcids.map((item, ind) => 
            <li key={`${props.pdbId}_good_acid_${ind}`}>
              {item.chain}
            </li>
          )
        }
        </ol>
      </div>
      <div id="jsmol-div">  
        <div className='row'>
          <Navbar dark color="dark" 
          style={{ margin: 0,  marginLeft: '1rem', padding: 0, paddingLeft: '1rem'}}>
            <NavbarBrand href="http://jmol.sourceforge.net/" target="_blank" className="jsmolNav">
              See official doc of Jmol
            </NavbarBrand>
          </Navbar>
          <button className="btn btn-sm btn-warning" onClick={divToggle}> 
          { molState.divHidden
             ? `Show JSmol of pdbID ${processedPdbId(props.pdbId)}`
             : `Hide JSmol of pdbID ${processedPdbId(props.pdbId)}`
          } 
          </button> 
        </div>
        <div className="mol-container" id="jsmol-container" 
          style={molState.divHidden ? { display: 'none' } : {}} >
        </div>
      </div>
    </div>
  );
}

export default JsMol;
