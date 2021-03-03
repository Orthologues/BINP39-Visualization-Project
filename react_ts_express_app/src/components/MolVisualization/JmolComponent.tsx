import React, { FC, useState, useLayoutEffect, useEffect } from 'react';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import $ from 'jquery';
import * as ReduxActions from '../../redux/ActionCreators';
import {
  Navbar,
  NavbarBrand,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput,
  Row,
  Col
} from 'reactstrap';
import {
  appendAsyncScript,
  removeAsyncScriptBySrc,
  processedPdbId,
} from '../../shared/Funcs';
import { AA_1_TO_3 } from '../../shared/Consts';
import { FRONTEND_PREFIX } from '../../shared/Consts';
import { isNumber } from 'lodash';

const JsMol: FC<SubMolProps> = (props) => {
  const aaPreds = props.aaPreds;
  const [molState, setMolState] = useState<MolDisplayState>({
    divHidden: true,
  });
  const [displayOptions, setDisplayOptions] = useState<JmolDisplayOptions>({
    backboneOnly: false,
    alphaCbOnly: false,
    highLightSelected: false,
    wireFrameOnly: false,
    selectedChain: '',
    angstromsRestrictionVal: -1,
    ifOpenAngstromsRestriction: false 
  });
  const backboneOnly = displayOptions.backboneOnly;
  const alphaCbOnly = displayOptions.alphaCbOnly;
  const highLightSelected = displayOptions.highLightSelected;
  const wireFrameOnly = displayOptions.wireFrameOnly;
  const selectedChain = displayOptions.selectedChain;
  // adding ribbon/balls-sticks mode switching later
  const indpJmolQueries = useSelector<AppReduxState, JmolPdbAaSubs[]>(
    (state) => state.molVis.indpPdbIdQueries.jmol
  );
  const aaSubList = useSelector<AppReduxState, (AaSub | AaSubDetailed)[]>(
    (state) => state.molVis.jmolPdbAaSubs.aaSubs
  );
  const zoomedInAa = useSelector<
    AppReduxState,
    AaSub | AaSubDetailed | undefined
  >((state) => state.molVis.jmolPdbAaSubs.zoomedInAa);
  const dispatch = useDispatch<Dispatch<PayloadAction>>();

  const processMutateAll = (rawAaSubs: Array<AaSub | AaSubDetailed>) => {
    let aaSubsToDispatch: Array<AaSubDetailed | AaSub> = [];
    const chainPosPairSet = [
      ...new Set(rawAaSubs.map((aaSub) => `${aaSub.chain}_${aaSub.pos}`)),
    ];
    chainPosPairSet.map((chain_pos) => {
      const matchedMuts = rawAaSubs.filter(
        (aaSub) => `${aaSub.chain}_${aaSub.pos}` === chain_pos
      );
      matchedMuts.length > 0 && aaSubsToDispatch.push(matchedMuts[0]);
    });
    return aaSubsToDispatch;
  };
  const processSingleMutation = (
    newAaSub: AaSub | AaSubDetailed,
    rawAaSubs: Array<AaSub | AaSubDetailed>
  ) => {
    if (Object.keys(newAaSub).includes('pred')) {
      //type='AaSubDetailed', mode='aaClashPred'
      let aaSubsToDispatch: AaSubDetailed[] = [];
      aaSubsToDispatch = (aaSubList as AaSubDetailed[]).filter(
        (aaSub) =>
          !(
            aaSub.chain === (newAaSub as AaSubDetailed).chain &&
            aaSub.pos === (newAaSub as AaSubDetailed).pos
          )
      );
      aaSubsToDispatch.push(newAaSub as AaSubDetailed);
      return aaSubsToDispatch;
    } else {
      //type='AaSub', mode='extra'
      let aaSubsToDispatch: AaSub[] = [];
      aaSubsToDispatch = (aaSubList as AaSub[]).filter(
        (aaSub) =>
          !(
            aaSub.chain === (newAaSub as AaSub).chain &&
            aaSub.pos === (newAaSub as AaSub).pos
          )
      );
      aaSubsToDispatch.push(newAaSub as AaSub);
      return aaSubsToDispatch;
    }
  };
  // Jmol Commmands, get updated by useSelector/useState hooks
  const wireFrameCmd = () => (wireFrameOnly ? 'wireframe only;' : '');
  const highlightSelectedCmd = () =>
    highLightSelected ? 'set display SELECTED;' : '';
  const backboneOnlyCmd = () =>
    backboneOnly ? 'backbone only; color black;' : '';
  const chainSelCmd = () => {
    let cmd = '';
    if (!zoomedInAa && selectedChain !== '') {
      cmd = `select chain="${selectedChain}";`;
    }
    return cmd;
  };
  const mutationCmd = () => { // Unfortunately it's impossible to select specific chains with 'mutate' cmd
    let cmd = '';
    if (aaSubList.length > 0) {
      if (Object.keys(aaSubList[0]).includes('pred')) {
        // AA-clash pred mode instead of extra-query mode
        aaSubList.map((aaSub) => {
          let pos = (aaSub as AaSubDetailed).pos;
          let newAa = AA_1_TO_3[(aaSub as AaSubDetailed).newAa];
          cmd = `${cmd} mutate ${pos} ${newAa};`;
        });
      } else {
        aaSubList.map((aaSub) => {
          let pos = (aaSub as AaSub).pos;
          let newAa = AA_1_TO_3[(aaSub as AaSub).target];
          cmd = `${cmd} mutate ${pos} ${newAa};`;
        });
      }
    }
    return cmd;
  };
  const mutationSelCmd = () => { 
    let cmd = '', selList = '';
    if (!zoomedInAa && aaSubList.length > 0 && selectedChain === '') {
      aaSubList.map((aaSub, ind) => {
        selList = `${selList}${ind > 0 ? ' or ' : ''}${aaSub.pos}:${aaSub.chain}${alphaCbOnly ? '.CA' : ''}`
      });
      cmd = `select "${selList}"`;
    }
    return cmd;
  };
  const zoomInCmd = () => {
    let cmd = '';
    if (zoomedInAa) {
      cmd = `select ${zoomedInAa.pos}:${zoomedInAa.chain}${alphaCbOnly ? '.CA' : ''}; 
      center SELECTED; zoom 2500; color white; `;
    }
    return cmd;
  };
  const restrictCmd = () => { // hides everything not in expression, to be used together with 'within' cmd
    if (zoomedInAa && displayOptions.angstromsRestrictionVal > 0 && displayOptions.ifOpenAngstromsRestriction) {
      const distance = displayOptions.angstromsRestrictionVal.toFixed(2);
      return `restrict within(${distance}, SELECTED); `
    }
  }
  const slabCmd = () => {

  }

  const divToggle = () => setMolState({divHidden: !molState.divHidden});

  const renderJSmolHTML = (pdbCode: string) => {
    let JmolInfo = {
      width: '100%',
      height: '100%',
      color: '#fff8f9',
      j2sPath: `${FRONTEND_PREFIX}/assets/JSmol/j2s`,
      serverURL: `${FRONTEND_PREFIX}/assets/JSmol/php/jsmol.php`,
      script: `
      set antialiasDisplay; set hoverDelay 0.1; load =${pdbCode};
      ${mutationCmd()} ${mutationSelCmd()} ${chainSelCmd()} 
      ${wireFrameCmd()} ${backboneOnlyCmd()} ${zoomInCmd()} ${highlightSelectedCmd()} 
      ${zoomInCmd() === '' && mutationSelCmd() === '' ? '' 
        : zoomInCmd() === '' 
          ? 'selectionHalos;'
          : 'label %[covalentRadius]; color labels green; selectionHalos;' }
      ${restrictCmd()}
      `,
      use: 'html5',
    };
    $('#jsmol-container').html(Jmol.getAppletHtml('html5Jmol', JmolInfo));
  };

  useLayoutEffect(() => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    return () => {
      removeAsyncScriptBySrc(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    };
  }, []);
  useEffect(() => {
    props.pdbId === ''
      ? setTimeout(() => setMolState({ divHidden: true }), 50)
      : setTimeout(() => { 
        setMolState({ divHidden: false });
        setDisplayOptions((prevState) => ({ ...prevState, selectedChain: '', highLightSelected: false }));
      }, 50);
  }, [props.pdbId]);
  useEffect(() => {
    molState.divHidden === false &&
      setTimeout(() => renderJSmolHTML(props.pdbId), 50);
  }, [displayOptions, aaSubList, zoomedInAa]);

  return (
    <div className="mol-wrapper container-fluid row">
      {aaPreds.goodList.length === 0 && aaPreds.badList.length === 0 ? (
      <div className="molIndpOptionsList">
        <CardTitle tag="h5" style={{ marginTop: '10px' }}>
          Visualization Options
        </CardTitle>
        <ol className="pdb-query-ol" style={{ marginBottom: 24 }}>
          <Form style={{ textAlign: 'left', paddingLeft: 10 }}>
            <FormGroup check inline>
              <Label style={{ marginRight: 2 }} check>
                set wireframe-only
              </Label>
              <Input
                type="checkbox"
                checked={wireFrameOnly}
                onChange={(e) =>
                  setDisplayOptions((prev) => ({ ...prev, wireFrameOnly: !wireFrameOnly }))
                }
              />
            </FormGroup>
            <FormGroup check inline>
              <Label style={{ marginRight: 2 }} check>
                highlight selected AA(s)/chain
              </Label>
              <Input
                type="checkbox"
                checked={highLightSelected}
                onChange={(e) =>
                  setDisplayOptions((prev) => ({ ...prev, highLightSelected: !highLightSelected }))
                }
              />
            </FormGroup>
            <FormGroup check inline>
              <Label style={{ marginRight: 2 }} check>
                α-carbon only in mutated AAs
              </Label>
              <Input
                type="checkbox"
                checked={alphaCbOnly}
                onChange={(e) => setDisplayOptions((prev) => ({...prev, alphaCbOnly: !alphaCbOnly}))
                }
              />
            </FormGroup>
            <FormGroup check inline>
              <Label style={{ marginRight: 2 }} check>
                α-carbon backbone only
              </Label>
              <Input
                type="checkbox"
                checked={backboneOnly}
                onChange={(e) => setDisplayOptions((prev) => ({ ...prev, backboneOnly: !backboneOnly }))}
              />
            </FormGroup>
            <FormGroup check inline>
              <Label style={{ marginRight: 2 }}>highlight a chain</Label>
              <CustomInput
                type="select"
                id={`${props.pdbId}_chains`}
                name="extraChainSelection"
                value={selectedChain}
                onChange={(e) => {
                  zoomedInAa && dispatch(ReduxActions.setJmolZoomedInAa(undefined));
                  !(wireFrameOnly || backboneOnly || highLightSelected)
                  ? setDisplayOptions((prev) => ({ ...prev, highLightSelected: true, 
                    selectedChain: e.target.value }))
                  : (wireFrameOnly || backboneOnly) && highLightSelected 
                  ? setDisplayOptions((prev) => ({ ...prev, highLightSelected: false, 
                      selectedChain: e.target.value }))
                  : setDisplayOptions((prev) => ({ ...prev, selectedChain: e.target.value }));
                }}
                style={{ padding: 0, paddingLeft: 2, height: 28, width: 64 }}
              >
                <option value="">None</option>
                {indpJmolQueries.map(
                  (query) =>
                    query.pdbToLoad === props.pdbId &&
                    query.chainList?.map((chain) => (
                      <option
                        key={`${props.pdbId}_chain_${chain}_option`}
                        value={chain}
                      >
                        {chain}
                      </option>
                    ))
                )}
              </CustomInput>
            </FormGroup>
            <FormGroup style={{ marginBottom: 3 }} check inline>
              <Label style={{ marginRight: 2 }} check>
                mutate all positions
              </Label>
              <Input
                type="checkbox"
                onChange={(e) => {
                  const targetQuery = indpJmolQueries.filter(
                    (query) => query.pdbToLoad === props.pdbId
                  )[0];
                  if (targetQuery) {
                    !e.target.checked 
                    ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, []))
                    : targetQuery && 
                      dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processMutateAll(targetQuery.aaSubs)));
                  }
                }}
              />
            </FormGroup>
          {
            zoomedInAa &&
            <FormGroup style={{ marginBottom: 3, textAlign: 'left' }} check inline>
              <Col lg={{ size: 4 }} style={{ padding: 0 }}>
                <Input id='angstroms-restriction-input' 
                  placeholder='Type in N'
                  style={{width: '6rem' }}>
                </Input>
              </Col>
              <Col lg={{ size: 8 }} style={{ padding: 0, marginLeft: 10 }}>
                <CustomInput inline id="if-angstroms-restriction"
                  type='switch' checked={displayOptions.ifOpenAngstromsRestriction} 
                  onChange={ e => {
                    const angsInputEl = document.getElementById('angstroms-restriction-input') as HTMLInputElement;
                    const angsInputVal = angsInputEl.value;
                    const numVal = parseFloat(angsInputVal);
                    isNumber(numVal) && numVal > 0 &&
                    setDisplayOptions(prev => (
                      prev.ifOpenAngstromsRestriction === false
                        ? { ...prev, ifOpenAngstromsRestriction: true, angstromsRestrictionVal: numVal }
                        : { ...prev, ifOpenAngstromsRestriction: false, angstromsRestrictionVal: numVal }
                    ))
                  }}
                  label={`Display only N
                  (${displayOptions.angstromsRestrictionVal.toFixed(2)}) X Å around zoomed-in residue`}/>
              </Col>
            </FormGroup> 
          }
            <CardText
              style={{
                color: '#FFFF33',
                textAlign: 'left',
                marginBottom: 5,
                marginRight: 5,
              }}
            >
              Click checkbox of an item for adding halos to/mutating its residue in Jmol, 
              yellow text indicates that an item's residue is mutated. Switch on for
              zooming to its position. If there're multiple AA-subs at one
              position, 'mutate all' would choose the first AA-sub on list.
              Green label of a selected atom implies its covalent bonding
              radius(0.4 unit = 0.001 Å).
            </CardText>
          </Form>
          <p style={{ marginBottom: 5 }}>AA-Subs without prediction</p>
        { indpJmolQueries.map(query =>
            query.pdbToLoad === props.pdbId &&
            query.aaSubs
            .sort((a, b) => parseInt(a.pos.toString()) > parseInt(b.pos.toString()) ? 1 : -1)
            .map((aaSub, ind) =>
              <li key={`indp_${props.pdbId}_acid_${ind}`} className={
                aaSubList.some(el => JSON.stringify({...el, chain: ''}) === JSON.stringify({...aaSub, chain: ''})) ?
                "aaPosSubMutatedItem" :
                "aaPosSubIndpItem"
                }>
                <Row style={{ marginLeft: '2rem' }}>
                  <FormGroup check inline>
                    <Input
                      type="checkbox"
                      checked={aaSubList.some(item => 
                        JSON.stringify(aaSub) === JSON.stringify(item))}
                      onChange={ e => {
                        !e.target.checked 
                        ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, aaSubList.filter(item =>
                            JSON.stringify({...item, chain: '', oldAa: ''}) !== 
                            JSON.stringify({...aaSub, chain: '', oldAa: ''}) 
                          ))) 
                        : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, 
                          processSingleMutation(aaSub, aaSubList))) 
                      }}
                      style={{ marginRight: 24 }}
                    />
                    <CustomInput
                      inline
                      type="switch"
                      id={`zoom_to_indp_${aaSub.chain}_${aaSub.pos}${
                        (aaSub as AaSub).target
                      }`}
                      label={`${aaSub.chain}: ${aaSub.pos}${
                        (aaSub as AaSub).target
                      }(${AA_1_TO_3[(aaSub as AaSub).target]})`}
                      checked={JSON.stringify(zoomedInAa) === JSON.stringify(aaSub)}
                      onChange={ e => {
                        !e.target.checked 
                        ? dispatch(ReduxActions.setJmolZoomedInAa(undefined)) 
                        : dispatch(ReduxActions.setJmolZoomedInAa(aaSub)) 
                      }}
                    />
                  </FormGroup>
                </Row>
              </li>
            ) 
          )
        } 
        </ol>
      </div>
      ): (
      <div className="molOptionsList">
        <CardTitle tag="h5" style={{ marginTop: '10px' }}>
          Visualization Options
        </CardTitle>
        <ol className="pdb-query-ol" style={{ marginBottom: 5 }}>
          <Form>
            <FormGroup check inline>
              <Label style={{ marginLeft: 6, marginRight: 2 }} check>
                set wireframe-only
              </Label>
              <Input
                type="checkbox"
                checked={wireFrameOnly}
                onChange={(e) =>
                  setDisplayOptions((prev) => ({ ...prev, wireFrameOnly: !wireFrameOnly }))
                }
              />
            </FormGroup>
            <FormGroup style={{ marginBottom: 2 }} check inline>
              <Label style={{ marginRight: 2 }} check>
                α-carbon backbone only
              </Label>
              <Input
                type="checkbox"
                checked={backboneOnly}
                onChange={(e) =>
                  setDisplayOptions((prev) => ({ ...prev, backboneOnly: !backboneOnly }))
                }
              />
            </FormGroup>
            <FormGroup check inline>
              <Label style={{ marginRight: 2, marginBottom: 2 }} check>
                α-carbon only in mutated AAs
              </Label>
              <Input
                type="checkbox"
                checked={alphaCbOnly}
                onChange={(e) =>
                  setDisplayOptions((prev) => ({ ...prev, alphaCbOnly: !alphaCbOnly }))
                }
              />
            </FormGroup>
            <FormGroup check inline>
              <Label style={{ marginLeft: 6, marginRight: 2, marginBottom: 2 }} check>
                highlight selected AA(s)/chain
              </Label>
              <Input
                type="checkbox"
                checked={highLightSelected}
                onChange={(e) =>
                  setDisplayOptions((prev) => ({ ...prev, highLightSelected: !highLightSelected }))
                }
              />
            </FormGroup>
            <FormGroup style={{ marginBottom: 2 }} check inline>
              <Label style={{ marginLeft: 6, marginRight: 3 }}>
                highlight a chain
              </Label>
              <CustomInput
                type="select"
                id={`${props.pdbId}_chains`}
                name="chainSelection"
                value={selectedChain}
                onChange={(e) => {
                  zoomedInAa && dispatch(ReduxActions.setJmolZoomedInAa(undefined));
                  !(wireFrameOnly || backboneOnly || highLightSelected)
                  ? setDisplayOptions((prev) => ({ ...prev, highLightSelected: true, 
                    selectedChain: e.target.value }))
                  : (wireFrameOnly || backboneOnly) && highLightSelected 
                  ? setDisplayOptions((prev) => ({ ...prev, highLightSelected: false, 
                      selectedChain: e.target.value }))
                  : setDisplayOptions((prev) => ({ ...prev, selectedChain: e.target.value }));
                }}
                style={{ padding: 0, paddingLeft: 2, height: 28, width: 64 }}
              >
                <option value="">None</option>
                {[
                  ...new Set(aaPreds.goodList.concat(aaPreds.badList).map((item) => item.chain)),
                ].map((chain) => (
                  <option
                    key={`${props.pdbId}_chain_${chain}_option`} value={chain}>
                    {chain}
                  </option>
                ))}
              </CustomInput>
            </FormGroup>
            {
            zoomedInAa &&
            <FormGroup style={{ marginBottom: 3, textAlign: 'left' }} check inline>
              <Col lg={{ size: 4 }}>
                <Input id='angstroms-restriction-input' 
                  placeholder='Type in N'
                  style={{width: '6rem' }}>
                </Input>
              </Col>
              <Col lg={{ size: 8 }} style={{ padding: 0, marginLeft: 0 }}>
                <CustomInput inline id="if-angstroms-restriction"
                  type='switch' checked={displayOptions.ifOpenAngstromsRestriction} 
                  onChange={ e => {
                    const angsInputEl = document.getElementById('angstroms-restriction-input') as HTMLInputElement;
                    const angsInputVal = angsInputEl.value;
                    const numVal = parseFloat(angsInputVal);
                    isNumber(numVal) && numVal > 0 &&
                    setDisplayOptions(prev => (
                      prev.ifOpenAngstromsRestriction === false
                        ? { ...prev, ifOpenAngstromsRestriction: true, angstromsRestrictionVal: numVal }
                        : { ...prev, ifOpenAngstromsRestriction: false, angstromsRestrictionVal: numVal }
                    ))
                  }}
                  label={`Display only N
                  (${displayOptions.angstromsRestrictionVal.toFixed(2)}) X Å around zoomed-in residue`}/>
              </Col>
            </FormGroup> 
          }
          </Form>
          <CardText
            style={{ color: '#FFFF33', textAlign: 'left', marginLeft: 6 }}
          >
            Click checkbox of an item for adding halos to/mutating its residue in Jmol, 
            yellow text indicates that an item's residue is mutated. Switch on for
            zooming to its position. If there're multiple AA-subs at one
            position, 'mutate all' would choose the first AA-sub on list.
            Green label of a selected atom implies its covalent bonding
            radius(0.4 unit = 0.001 Å).
          </CardText>
        </ol>
        <div className="row" style={{ marginBottom: 24 }}>
          <div className="col-12 col-lg-6">
            <ol className="pdb-query-ol">
              <FormGroup style={{ marginBottom: 5 }} check inline>
                <Label style={{ marginRight: 5 }} check>
                  mutate all
                </Label>
                <Input
                  type="checkbox" id="mutate_all_good_checkbox"
                  checked={JSON.stringify(aaSubList) === JSON.stringify(processMutateAll(aaPreds.goodList))}
                  onChange={(e) => {
                    const mutateAllBadEl = document.getElementById('mutate_all_bad_checkbox') as HTMLInputElement;
                    const processedAaSubs = processMutateAll(aaPreds.goodList.
                      concat(aaSubList as AaSubDetailed[]));
                    !e.target.checked 
                      ? (!mutateAllBadEl || !mutateAllBadEl.checked)
                        ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, []))
                        : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processMutateAll(aaPreds.badList)))
                      : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processedAaSubs))
                  }}
                />
              </FormGroup>
              <p style={{ marginBottom: 5 }}>Good AA-Subs</p>
              {aaPreds.goodList.length > 0 &&
                aaPreds.goodList.map((item, ind) => (
                  <li
                    key={`${props.pdbId}_good_acid_${ind}`}
                    className={
                      aaSubList.some(el => JSON.stringify({...el, chain: ''}) === JSON.stringify({...item, chain: ''})) ?
                      "aaPosSubMutatedItem" :
                      "aaPosSubGoodItem" } >
                    <Row style={{ marginLeft: 12 }}>
                      <FormGroup check inline>
                        <Input
                          type="checkbox"
                          style={{ marginRight: 24 }}
                          id={`mutate_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                          checked={aaSubList.some(aaSub => 
                            JSON.stringify(aaSub) === JSON.stringify(item))}
                          onChange={ e => {
                            !e.target.checked 
                            ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, aaSubList.filter(aaSub =>
                                JSON.stringify({...item, chain: '', oldAa: ''}) !== 
                                JSON.stringify({...aaSub, chain: '', oldAa: ''}) 
                              ))) 
                            : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, 
                              processSingleMutation(item, aaSubList))) 
                          }}
                        />
                        <CustomInput
                          type="switch"
                          inline
                          id={`zoom_to_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                          label={`${item.chain}: ${item.oldAa}${item.pos}${item.newAa}`}
                          checked={JSON.stringify(zoomedInAa) === JSON.stringify(item)}
                          onChange={ e => {
                            !e.target.checked 
                            ? dispatch(ReduxActions.setJmolZoomedInAa(undefined)) 
                            : dispatch(ReduxActions.setJmolZoomedInAa(item)) 
                          }}
                        />
                      </FormGroup>
                    </Row>
                  </li>
                ))}
            </ol>
          </div>
          <div className="col-12 col-lg-6">
            <ol className="pdb-query-ol">
              <FormGroup style={{ marginBottom: 5 }} check inline>
                <Label style={{ marginRight: 5 }} check>
                  mutate all
                </Label>
                <Input
                  type="checkbox" id="mutate_all_bad_checkbox"
                  checked={JSON.stringify(aaSubList) === JSON.stringify(processMutateAll(aaPreds.badList))}
                  onChange={(e) => {
                    const mutateAllGoodEl = document.getElementById('mutate_all_good_checkbox') as HTMLInputElement;
                    const processedAaSubs = processMutateAll(aaPreds.badList.
                      concat(aaSubList as AaSubDetailed[]));
                    !e.target.checked 
                      ? (!mutateAllGoodEl || !mutateAllGoodEl.checked)
                        ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, []))
                        : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processMutateAll(aaPreds.goodList)))
                      : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processedAaSubs))
                  }}
                />
              </FormGroup>
              <p style={{ marginBottom: 5 }}>Bad AA-Subs</p>
              {aaPreds.badList.length > 0 &&
                aaPreds.badList.map((item, ind) => (
                  <li
                    key={`${props.pdbId}_bad_acid_${ind}`}
                    className={
                      aaSubList.some(el => JSON.stringify({...el, chain: ''}) === JSON.stringify({...item, chain: ''})) ?
                      "aaPosSubMutatedItem" :
                      "aaPosSubBadItem" } >
                    <Row style={{ marginLeft: 12 }}>
                      <FormGroup check inline>
                        <Input
                          type="checkbox"
                          style={{ marginRight: 24 }}
                          id={`mutate_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                          checked={aaSubList.some(aaSub => 
                            JSON.stringify({...aaSub, chain: ''}) === JSON.stringify({...item, chain: ''}))}
                          onChange={ e => {
                            !e.target.checked 
                            ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, aaSubList.filter(aaSub =>
                                JSON.stringify({...item, chain: '', oldAa: ''}) !== 
                                JSON.stringify({...aaSub, chain: '', oldAa: ''}) 
                              ))) 
                            : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, 
                              processSingleMutation(item, aaSubList))) 
                          }}
                        />
                        <CustomInput
                          type="switch"
                          inline
                          id={`zoom_to_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                          label={`${item.chain}: ${item.oldAa}${item.pos}${item.newAa}`}
                          checked={JSON.stringify(zoomedInAa) === JSON.stringify(item)}
                          onChange={ e => {
                            !e.target.checked 
                            ? dispatch(ReduxActions.setJmolZoomedInAa(undefined)) 
                            : dispatch(ReduxActions.setJmolZoomedInAa(item)) 
                          }}
                        />
                      </FormGroup>
                    </Row>
                  </li>
                ))}
            </ol>
          </div>
        </div>
      </div>
      )}
      <div id="jsmol-div">
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
              href="http://jmol.sourceforge.net/"
              target="_blank"
              className="jsmolNav"
            >
              See official doc of Jmol
            </NavbarBrand>
          </Navbar>
          <button className="btn btn-sm btn-warning" onClick={divToggle}>
            {molState.divHidden
              ? `Show JSmol of pdbID ${processedPdbId(props.pdbId)}`
              : `Hide JSmol of pdbID ${processedPdbId(props.pdbId)}`}
          </button>
        </div>
        <div
          className="mol-container"
          id="jsmol-container"
          style={molState.divHidden ? { display: 'none' } : {}}
        ></div>
      </div>
    </div>
  );
};

export default JsMol;
