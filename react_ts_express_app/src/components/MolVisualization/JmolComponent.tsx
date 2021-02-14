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
} from 'reactstrap';
import {
  appendAsyncScript,
  removeAsyncScriptBySrc,
  processedPdbId,
} from '../../shared/Funcs';
import { AA_1_TO_3, AMINO_ACIDS } from '../../shared/Consts';
import { FRONTEND_PREFIX } from '../../shared/Consts';

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
  });
  const backboneOnly = displayOptions.backboneOnly;
  const alphaCbOnly = displayOptions.alphaCbOnly;
  const highLightSelected = displayOptions.highLightSelected;
  const wireFrameOnly = displayOptions.wireFrameOnly;
  const selectedChain = displayOptions.selectedChain;
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
  const mutationHighlightCmd = () => {
    let cmd = '';
    if (!zoomedInAa) {
    }
    return cmd;
  };
  const chainSelCmd = () => {
    let cmd = '';
    if (!zoomedInAa && selectedChain !== '') {
      cmd = `select chain="${selectedChain}";`;
    }
    return cmd;
  };
  const highlightSelectedCmd = () =>
    highLightSelected ? 'set display SELECTED;' : '';
  const backboneOnlyCmd = () =>
    backboneOnly ? 'backbone only; color black;' : '';
  const mutationCmd = () => {
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
          if ((aaSub as AaSub).target !== '') {
            let newAa = AA_1_TO_3[(aaSub as AaSub).target];
            cmd = `${cmd} mutate ${pos} ${newAa};`;
          } else {
            cmd = `${cmd} mutate ${pos} ALA;`;
          }
        });
      }
    }
    return cmd;
  };
  const zoomInCmd = () => {
    let cmd = '';
    if (zoomedInAa && !highLightSelected) {
      setDisplayOptions((prev) => ({ ...prev, highLightSelected: true }));
      cmd = `select ${zoomedInAa.pos}:${zoomedInAa.chain}${alphaCbOnly ? '.CA' : ''}; 
      center SELECTED; zoom ${mutationCmd() === '' ? '3000' : '8000'}; zoomto; color white; 
      label %[covalentRadius]; color labels green;`;
    }
    return cmd;
  };

  const divToggle = () => setMolState({divHidden: !molState.divHidden});

  const renderJSmolHTML = (pdbCode: string) => {
    let JmolInfo = {
      width: '100%',
      height: '100%',
      color: '#E2F4F4',
      j2sPath: `${FRONTEND_PREFIX}/assets/JSmol/j2s`,
      serverURL: `${FRONTEND_PREFIX}/assets/JSmol/php/jsmol.php`,
      script: `
      set antialiasDisplay; set hoverDelay 0.1; load =${pdbCode};
      ${chainSelCmd()} ${mutationCmd()} ${mutationHighlightCmd()}
      ${wireFrameCmd()} ${backboneOnlyCmd()} ${zoomInCmd()} ${highlightSelectedCmd()} 
      `,
      use: 'html5',
    };
    $('#jsmol-container').html(Jmol.getAppletHtml('html5Jmol', JmolInfo));
  };

  useLayoutEffect(() => {
    //this function loads synchronously right after any DOM mutation
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    props.pdbId !== '' &&
      setTimeout(() => setMolState({ divHidden: false }), 100);
    return () => {
      removeAsyncScriptBySrc(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
    };
  }, []);
  useEffect(() => {
    molState.divHidden === false &&
      setTimeout(() => renderJSmolHTML(props.pdbId), 100);
  }, [molState, displayOptions]);
  useEffect(() => {
    setDisplayOptions((prevState) => ({ ...prevState, selectedChain: '', highLightSelected: false }));
    props.pdbId === ''
      ? setTimeout(() => setMolState({ divHidden: true }), 100)
      : setTimeout(() => setMolState({ divHidden: false }), 100);
    molState.divHidden === false &&
      setTimeout(() => renderJSmolHTML(props.pdbId), 100);
  }, [props.pdbId, aaSubList, zoomedInAa]);

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
                    !e.target.checked 
                      ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, []))
                      : targetQuery && 
                        dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processMutateAll(targetQuery.aaSubs)))
                  }}
                />
              </FormGroup>
              <CardText
                style={{
                  color: '#FFFF33',
                  textAlign: 'left',
                  marginBottom: 5,
                  marginRight: 5,
                }}
              >
                Click checkbox of an AA-sub to mutate in Jmol, switch on for
                zooming to its position. If there're multiple AA-subs at one
                position, 'mutate all' would choose the first AA-sub on list.
                Green label of a selected atom implies its covalent bonding
                radius(0.4 unit = 0.001 Å).
              </CardText>
            </Form>
            <p style={{ marginBottom: 5 }}>AA-Subs without prediction</p>
            {indpJmolQueries.map(
              (query) =>
                query.pdbToLoad === props.pdbId &&
                query.aaSubs
                  .sort((a, b) =>
                    parseInt(a.pos.toString()) > parseInt(b.pos.toString())
                      ? 1
                      : -1
                  )
                  .map((aaSub, ind) =>
                    (aaSub as AaSub).target.length === 0 ? (
                      AMINO_ACIDS.map((AA) => (
                        <li
                          key={`indp_${props.pdbId}_acid_${ind}_${AA}`}
                          className="aaPosSubIndpItem"
                        >
                          <Row style={{ marginLeft: '2rem' }}>
                            <FormGroup check inline>
                              <Input
                                type="checkbox"
                                checked={aaSubList.includes(aaSub as AaSub)}
                                style={{ marginRight: 24 }}
                              />
                              <CustomInput
                                inline
                                type="switch"
                                id={`zoom_to_indp_${aaSub.pos}${AA}`}
                                label={`${aaSub.chain}: ${aaSub.pos}${AA}(${AA_1_TO_3[AA]})`}
                              />
                            </FormGroup>
                          </Row>
                        </li>
                      ))
                    ) : (
                      <li
                        key={`indp_${props.pdbId}_acid_${ind}`}
                        className="aaPosSubIndpItem"
                      >
                        <Row style={{ marginLeft: '2rem' }}>
                          <FormGroup check inline>
                            <Input
                              type="checkbox"
                              checked={aaSubList.includes(aaSub as AaSub)}
                              style={{ marginRight: 24 }}
                            />
                            <CustomInput
                              inline
                              type="switch"
                              id={`zoom_to_indp_${aaSub.pos}${
                                (aaSub as AaSub).target
                              }`}
                              label={`${aaSub.chain}: ${aaSub.pos}${
                                (aaSub as AaSub).target
                              }(${AA_1_TO_3[(aaSub as AaSub).target]})`}
                            />
                          </FormGroup>
                        </Row>
                      </li>
                    )
                  )
            )}
          </ol>
        </div>
      ) : (
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
            </Form>
            <CardText
              style={{ color: '#FFFF33', textAlign: 'left', marginLeft: 6 }}
            >
              Click checkbox of an AA-sub to mutate in Jmol, switch on for
              zooming to its position. If there are multiple AA-subs at one
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
                    onChange={(e) => {
                      const mutateAllBadEl = document.getElementById('mutate_all_bad_checkbox') as HTMLInputElement;
                      const processedAaSubs = processMutateAll(aaPreds.goodList.
                        concat(aaSubList as AaSubDetailed[]));
                      !e.target.checked 
                        ? (!mutateAllBadEl || !mutateAllBadEl.checked)
                          ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, []))
                          : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processMutateAll(aaPreds.badList)))
                        : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processedAaSubs));
                    }}
                  />
                </FormGroup>
                <p style={{ marginBottom: 5 }}>Good AA-Subs</p>
                {aaPreds.goodList.length > 0 &&
                  aaPreds.goodList.map((item, ind) => (
                    <li
                      key={`${props.pdbId}_good_acid_${ind}`}
                      className="aaPosSubGoodItem"
                    >
                      <Row style={{ marginLeft: 12 }}>
                        <FormGroup check inline>
                          <Input
                            type="checkbox"
                            style={{ marginRight: 24 }}
                            id={`mutate_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                            checked={aaSubList.includes(item as AaSubDetailed)}
                          />
                          <CustomInput
                            type="switch"
                            inline
                            id={`zoom_to_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                            label={`${item.chain}: ${item.oldAa}${item.pos}${item.newAa}`}
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
                    onChange={(e) => {
                      const mutateAllGoodEl = document.getElementById('mutate_all_good_checkbox') as HTMLInputElement;
                      const processedAaSubs = processMutateAll(aaPreds.badList.
                        concat(aaSubList as AaSubDetailed[]));
                      !e.target.checked 
                        ? (!mutateAllGoodEl || !mutateAllGoodEl.checked)
                          ? dispatch(ReduxActions.setJmolAaSubList(props.pdbId, []))
                          : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processMutateAll(aaPreds.goodList)))
                        : dispatch(ReduxActions.setJmolAaSubList(props.pdbId, processedAaSubs));
                    }}
                  />
                </FormGroup>
                <p style={{ marginBottom: 5 }}>Bad AA-Subs</p>
                {aaPreds.badList.length > 0 &&
                  aaPreds.badList.map((item, ind) => (
                    <li
                      key={`${props.pdbId}_bad_acid_${ind}`}
                      className="aaPosSubBadItem"
                    >
                      <Row style={{ marginLeft: 12 }}>
                        <FormGroup check inline>
                          <Input
                            type="checkbox"
                            style={{ marginRight: 24 }}
                            id={`mutate_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                            checked={aaSubList.includes(item as AaSubDetailed)}
                          />
                          <CustomInput
                            type="switch"
                            inline
                            id={`zoom_to_${item.chain}_${item.oldAa}${item.pos}${item.newAa}`}
                            label={`${item.chain}: ${item.oldAa}${item.pos}${item.newAa}`}
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
