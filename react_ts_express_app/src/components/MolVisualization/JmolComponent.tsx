import React, { FC, useState, useLayoutEffect, useEffect } from 'react';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import $ from 'jquery';
import * as ReduxActions from '../../redux/ActionCreators'; 
import { Navbar, NavbarBrand, CardTitle, CardText, Form, FormGroup, Label, Input, CustomInput, Row } from 'reactstrap';
import { appendAsyncScript, removeAsyncScriptBySrc, processedPdbId } from '../../shared/Funcs';
import { AA_1_TO_3, AMINO_ACIDS } from '../../shared/Consts';
import { FRONTEND_PREFIX } from '../../shared/Consts';

const JsMol: FC<SubMolProps> = (props) => {
  const [molState, setMolState] = useState<MolDisplayState>({ divHidden: true });
  const [backboneOnly, setBackboneOnly] = useState<boolean>(false);
  const ifWireframeOnly = useSelector<AppReduxState, boolean>(state => state.molVis.ifJmolWireframeOnly);
  const ifHighLightSelected = useSelector<AppReduxState, boolean>(state => state.molVis.ifJmolHighLightSelected);
  const indpJmolQueries = useSelector<AppReduxState, JmolPdbAaSubs[]>(state => state.molVis.indpPdbIdQueries.jmol);
  const aaSubList = useSelector<AppReduxState, (AaSub|AaSubDetailed)[]>(state => state.molVis.jmolPdbAaSubs.aaSubs);
  const zoomedInAa = useSelector<AppReduxState, AaSub|undefined>(state => state.molVis.jmolPdbAaSubs.zoomedInAa);
  const dispatch = useDispatch<Dispatch<PayloadAction>>();
  const wireFrameCmd = () => ifWireframeOnly ? 'wireframe only' : '';
  const highlightSelectedCmd = () => ifHighLightSelected ? 'set display SELECTED' : '';
  const backboneOnlyCmd = () => backboneOnly ? 'backbone only; color black' : '';
  const mutationCmd = () => {
    let cmd = '';
    if (aaSubList.length > 0)  {
      if (Object.keys(aaSubList[0]).includes('pred')) { // AA-clash pred mode instead of extra-query mode
        aaSubList.map(aaSub => {
          let pos = (aaSub as AaSubDetailed).pos;
          let newAa = AA_1_TO_3[(aaSub as AaSubDetailed).newAa];
          cmd = `${cmd}; mutate ${pos} ${newAa}`
        });
      } 
      else {
        aaSubList.map(aaSub => {
          let pos = (aaSub as AaSub).pos;
          let newAa = AA_1_TO_3[(aaSub as AaSub).target];
          cmd = `${cmd}; mutate ${pos} ${newAa}`
        });
      }
    } 
    return cmd;
  }
  const zoomInCmd = () => 
    zoomedInAa ?
    dispatch(ReduxActions.ifJmolHighLightSelected(true)) && 
    `select ${zoomedInAa.pos}:${zoomedInAa.chain}; center SELECTED; 
    zoom ${mutationCmd() === '' ? '3000' : '8000'}; zoomto; color white`: 
    '';

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
      script: `
      set antialiasDisplay; set hoverDelay 0.1;
      load =${pdbCode};
      x = "A"; select chain=@x; 
      ${wireFrameCmd()}; ${backboneOnlyCmd()};
      ${mutationCmd()}; ${zoomInCmd()};
      ${highlightSelectedCmd()}; 
      `,
      use: 'html5'
    };
    $('#jsmol-container').html(Jmol.getAppletHtml('html5Jmol', JmolInfo));
  }
  // const parseAaSubList = () => {
  //   aaSubList
  // }

  useLayoutEffect(() => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    props.pdbId === '' ? 
    setTimeout(() => setMolState({divHidden: true}), 100) : 
    setTimeout(() => setMolState({divHidden: false}), 200);
    return () => {
      removeAsyncScriptBySrc(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    };
  }, []);
  useEffect(() => {
    props.pdbId === '' && setTimeout(() => setMolState({divHidden: true}), 100);
    if (molState.divHidden === false) {
      renderJSmolHTML(props.pdbId);
    }
  }, 
  [props.pdbId, molState, ifWireframeOnly, ifHighLightSelected, backboneOnly, aaSubList, zoomedInAa]);

  return (
    <div className='mol-wrapper container-fluid row'>
    {
      props.goodAcids.length === 0 && props.badAcids.length === 0 ?
      <div className='molIndpOptionsList'>
        <CardTitle tag="h5" style={{ marginTop: '10px' }}>Visualization Options</CardTitle>
        <ol className='pdb-query-ol' style={{marginBottom: 24}}>
          <Form style={{ textAlign: 'left', paddingLeft: 12}}>
            <FormGroup check inline>
              <Label style={{marginRight: 5}} check>set wireframe-only</Label>
              <Input type="checkbox" checked={ifWireframeOnly}
              onChange={e => dispatch(ReduxActions.ifJmolWireframeOnly(!ifWireframeOnly))}/> 
            </FormGroup>
            <FormGroup check inline>
              <Label style={{marginRight: 5}} check>highlight selected AAs</Label>
              <Input type="checkbox" checked={ifHighLightSelected}
              onChange={e => dispatch(ReduxActions.ifJmolHighLightSelected(!ifHighLightSelected))}/> 
            </FormGroup>
            <FormGroup check inline>
              <Label style={{marginRight: 5}} check>α-carbon backbone only</Label>
              <Input type="checkbox" checked={backboneOnly}
              onChange={e => setBackboneOnly(!backboneOnly)} /> 
            </FormGroup>
            <FormGroup style={{marginBottom: 5}} check inline>
              <Label style={{marginRight: 5}} check>mutate all positions</Label>
              <Input type="checkbox" checked={ifHighLightSelected}
              onChange={e=>{}}/> 
            </FormGroup>
            <CardText style={{ color: '#FFFF33', textAlign: 'left', marginBottom: 5}}>
              Click checkbox of an AA-sub to mutate in Jmol, 
              switch on for zooming to its position. 
              If there are multiple different substitutions at one position, 
              'mutate all' would choose the first AA-sub on list.
            </CardText>
          </Form>
          <p style={{marginBottom: 5}}>AA-Subs without prediction</p>
          {
          indpJmolQueries.map(query =>
            query.pdbToLoad === props.pdbId &&
            query.aaSubs.sort((a, b) => 
              parseInt(a.pos.toString()) > parseInt(b.pos.toString()) ? 1 : -1).map((aaSub, ind) =>
            (aaSub as AaSub).target.length === 0 ?
            AMINO_ACIDS.map(AA => 
            <li key={`indp_${props.pdbId}_acid_${ind}_${AA}`} className='aaPosSubIndpItem'>
              <Row style={{ marginLeft: '2rem' }}> 
                <FormGroup check inline>
                  <Input type="checkbox" style={{ marginRight: 24 }}/>     
                  <CustomInput inline type="switch" 
                    id={`zoom_to_indp_${aaSub.pos}${AA}`} 
                    label={`${aaSub.chain}: ${aaSub.pos}${AA}(${AA_1_TO_3[AA]})`}/>   
                </FormGroup>         
              </Row>
            </li>
            ) :
            <li key={`indp_${props.pdbId}_acid_${ind}`} className='aaPosSubIndpItem'> 
              <Row style={{ marginLeft: '2rem' }}> 
                <FormGroup check inline>
                  <Input type="checkbox" style={{ marginRight: 24 }}/>
                  <CustomInput inline type="switch" 
                    id={`zoom_to_indp_${aaSub.pos}${(aaSub as AaSub).target}`} 
                    label={`${aaSub.chain}: ${aaSub.pos}${(aaSub as AaSub).target}(${AA_1_TO_3[(aaSub as AaSub).target]})`}/> 
                </FormGroup>         
              </Row>         
            </li>
          ))
          }
        </ol>
      </div> :
      <div className='molOptionsList'>
        <CardTitle tag="h5" style={{ marginTop: '10px' }}>Visualization Options</CardTitle>
        <ol className='pdb-query-ol' style={{marginBottom: 10}}>
          <Form>
            <FormGroup check inline>
              <Label style={{marginLeft: 8, marginRight: 5}} check>set wireframe-only</Label>
              <Input type="checkbox" checked={ifWireframeOnly}
              onChange={e => dispatch(ReduxActions.ifJmolWireframeOnly(!ifWireframeOnly))}/> 
            </FormGroup>
            <FormGroup check inline>
              <Label style={{marginRight: 5}} check>highlight selected AAs</Label>
              <Input type="checkbox" checked={ifHighLightSelected}
              onChange={e => dispatch(ReduxActions.ifJmolHighLightSelected(!ifHighLightSelected))}/> 
            </FormGroup>
            <FormGroup style={{marginBottom: 5}} check inline>
              <Label style={{marginRight: 5}} check>α-carbon backbone only</Label>
              <Input type="checkbox" checked={backboneOnly}
              onChange={e => setBackboneOnly(!backboneOnly) } /> 
            </FormGroup>
          </Form>
          <CardText style={{ color: '#FFFF33', textAlign: 'left', marginLeft: 10}}>
            Click checkbox of an AA-sub to mutate in Jmol, 
            switch on for zooming to its position. 
            If there are multiple different substitutions at one position, 
            'mutate all' would choose the first AA-sub on list.
          </CardText>
        </ol>
        <div className='row' style={{marginBottom: 24}}>
          <div className='col-12 col-lg-6'>
            <ol className='pdb-query-ol'>
              <FormGroup style={{marginBottom: 5}} check inline>
                <Label style={{marginRight: 5}} check>mutate all</Label>
                <Input type="checkbox" checked={ifHighLightSelected}
                onChange={e=>{}}/> 
              </FormGroup>
              <p style={{marginBottom: 5}}>Good AA-Subs</p>
          {
            props.goodAcids.length > 0 && props.goodAcids.map((item, ind) => 
              <li key={`${props.pdbId}_good_acid_${ind}`} className='aaPosSubGoodItem'>
                <Row style={{ marginLeft: 12 }}> 
                  <FormGroup check inline>
                    <Input type="checkbox" style={{marginRight: 24}}
                      id={`mutate_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                      checked={aaSubList.includes(
                        { 
                          chain: item.chain, 
                          oldAa: item.oldAa, 
                          pos: item.pos, 
                          newAa: item.newAa, 
                          pred: 'good'
                        }
                      )}/>
                    <CustomInput type="switch" inline
                      id={`zoom_to_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`} 
                      label={`${item.chain}: ${item.oldAa}${item.pos}${item.newAa}`} />  
                  </FormGroup>         
                </Row>
              </li>
            )
          }
            </ol>
          </div>
          <div className='col-12 col-lg-6'>
            <ol className='pdb-query-ol'>
              <FormGroup style={{marginBottom: 5}} check inline>
                <Label style={{marginRight: 5}} check>mutate all</Label>
                <Input type="checkbox" checked={ifHighLightSelected}
                onChange={e=>{}}/> 
              </FormGroup>
              <p style={{marginBottom: 5}}>Bad AA-Subs</p>
          {
            props.badAcids.length > 0 && props.badAcids.map((item, ind) => 
              <li key={`${props.pdbId}_bad_acid_${ind}`} className='aaPosSubBadItem'>
                <Row style={{ marginLeft: 12 }}> 
                  <FormGroup check inline>
                    <Input type="checkbox" style={{marginRight: 24}}
                      id={`mutate_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                      checked={aaSubList.includes(
                        { 
                          chain: item.chain, 
                          oldAa: item.oldAa, 
                          pos: item.pos, 
                          newAa: item.newAa, 
                          pred: 'bad'
                        }
                      )}/>
                    <CustomInput type="switch" inline
                      id={`zoom_to_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`} 
                      label={`${item.chain}: ${item.oldAa}${item.pos}${item.newAa}`} />  
                  </FormGroup>         
                </Row>
              </li>
            )
          }
            </ol>
          </div>
        </div>
      </div>
    }
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
