import React, { FC, useState } from 'react';
import JsMol from './JmolComponent';
import axios from 'axios';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { Dictionary } from 'lodash';
import { CardTitle, Button, ButtonGroup, Label, Input, 
  Modal, ModalBody, Col, Form, FormGroup } from 'reactstrap';
import { uniquePdbIds, aaClashPredGoodBad } from '../../shared/Funcs'
import { switchMolListDisplayMode, addIndpMolPdbIdQuery, delIndpMolPdbIdQuery, 
  deleteCodeQuery, eraseCodeQueryHistory, setJmolPdbId } from '../../redux/ActionCreators';
import './Mol.css';
import { AMINO_ACIDS } from '../../shared/Consts';


const MolComponent: FC<any> = () => {
    const ExtraQueryExampleJmol = `Input Example: '>6xs6  50D 60 61G'`;
    const JMOL_ENTRY_REGEX = /^\s*>[1-9]\w{3}(\s+\d+[arndcqeghilkmfpstwyv]{0,1})+/gim;
    const queries = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queries);
    const queryHistory = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queryHistory);
    const preds = useSelector<AppReduxState, AaClashPredData[]>(state => state.aaClashQuery.codePredResults);
    const predHistory = useSelector<AppReduxState, AaClashPredData[]>(state => 
      state.aaClashQuery.codePredResultHistory);
    const molState = useSelector<AppReduxState, MolComponentState>(state => state.molVis);
    const dispatch = useDispatch<Dispatch<PayloadAction>>();
    const [isExtraModalOpen, setExtraModalOpen] = useState<boolean>(false);
    
    const deleteQueriesOfPdbId = (evt: React.MouseEvent<HTMLElement, MouseEvent>, ind: number) => {
      evt.stopPropagation(); 
      if (queryHistory.length > 1) {
        const pdbIdToDelete = document.getElementsByClassName('pdb-id-span')[ind].textContent;
        pdbIdToDelete && queryHistory.map(query => {
          const processedPdbIdToDel = pdbIdToDelete.replace(/^\s+|\s+$/g, '').toUpperCase();
          processedPdbIdToDel === query.pdbId.toUpperCase() && dispatch(deleteCodeQuery(query));
          molState.jmolPdbAaSubs.pdbToLoad.toUpperCase() === processedPdbIdToDel 
          && dispatch(setJmolPdbId('')) 
        })
      } else {
        dispatch(eraseCodeQueryHistory()) && dispatch(setJmolPdbId(''))
      }
    }
    const deleteExtraPdbIdQuery = (evt: React.MouseEvent<HTMLElement, MouseEvent>, ind: number) => {
      evt.stopPropagation(); 
      const pdbIdToDelete = document.getElementsByClassName('extra-pdb-id-span')[ind].textContent;
      pdbIdToDelete && dispatch(delIndpMolPdbIdQuery(pdbIdToDelete)) && dispatch(setJmolPdbId('')) 
    }
    const aggregateAaListForPdbId = (pdbId: string): 
    { goodList: AaSubDetailed[], badList: AaSubDetailed[] } => {
      const processedPdbId = pdbId.replace(/^\s+|\s+$/g, '').toUpperCase();
      let predPdbId = '';
      let allGoodAas = [] as AaSubDetailed[], allBadAas = [] as AaSubDetailed[];
      if (molState.displayMode === 'latest') {
        preds.map(pred => {
          let predPdbIdMatch = pred.queryId.match(/\w{4}(?=_\w+)/i);
          if (predPdbIdMatch) {
            predPdbId = predPdbIdMatch[0].replace(/^\s+|\s+$/g, '').toUpperCase(); 
          }
          if (processedPdbId === predPdbId) {
            const extraJmolPdbIdSet = [ ...new Set(molState.indpPdbIdQueries.jmol.map(query => 
              query.pdbToLoad)) ];
            extraJmolPdbIdSet.includes(predPdbId) && dispatch(delIndpMolPdbIdQuery(predPdbId));
            const goodAas = aaClashPredGoodBad(pred).goodList;
            const badAas = aaClashPredGoodBad(pred).badList;
            allGoodAas = allGoodAas.concat(goodAas); 
            allBadAas = allBadAas.concat(badAas);
          }
        });
        return { 
          goodList: [ ...new Set(allGoodAas) ].sort((a, b) => a.chain > b.chain ? -1 : 1)
          .sort((a, b) => a.pos > b.pos ? 1 : -1), 
          badList: [ ...new Set(allBadAas) ].sort((a, b) => a.chain > b.chain ? -1 : 1)
          .sort((a, b) => a.pos > b.pos ? 1 : -1) 
        }
      } 
      else {
        predHistory.map(pred => {
          let predPdbIdMatch = pred.queryId.match(/\w{4}(?=_\w+)/i);
          if (predPdbIdMatch) {
            predPdbId = predPdbIdMatch[0].replace(/^\s+|\s+$/g, '').toUpperCase(); 
          }
          if (processedPdbId === predPdbId) {
            const extraJmolPdbIdSet = [ ...new Set(molState.indpPdbIdQueries.jmol.map(query => 
              query.pdbToLoad)) ];
            extraJmolPdbIdSet.includes(predPdbId) && dispatch(delIndpMolPdbIdQuery(predPdbId));
            const goodAas = aaClashPredGoodBad(pred).goodList;
            const badAas = aaClashPredGoodBad(pred).badList;
            allGoodAas = allGoodAas.concat(goodAas); 
            allBadAas = allBadAas.concat(badAas);
          }
        });
        return { 
          goodList: [ ...new Set(allGoodAas) ].sort((a, b) => a.chain > b.chain ? -1 : 1)
          .sort((a, b) => a.pos > b.pos ? 1 : -1), 
          badList: [ ...new Set(allBadAas) ].sort((a, b) => a.chain > b.chain ? -1 : 1)
          .sort((a, b) => a.pos > b.pos ? 1 : -1) 
        }
      }
    }
    const filterExtraAaSubs = (pdbId: string, aaSubs: Omit<AaSub, 'chain'>[]): 
    { chainList: string[], aaSubs: AaSub[] } => {
      let entityToChainToLen: Dictionary<Dictionary<string>> = {}; //records maximum residue number of a chain of an entity
      let filteredAaSubs: AaSub[] = [],  jmolAaSubs: AaSub[] = [];
      let chainList = new Array<string>();

      axios.get(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`)
      .then(resp => { 
        if (resp.status === 200 || resp.statusText === 'OK') {
          (resp.data["rcsb_entry_container_identifiers"]["polymer_entity_ids"] as string[]).map(id => {
            entityToChainToLen[id] = {};
          })
        }
        Object.keys(entityToChainToLen).length > 0 && Object.keys(entityToChainToLen).map(entityId => {
          axios.get(`https://data.rcsb.org/rest/v1/core/polymer_entity/${pdbId}/${entityId}`)
          .then(resp => { 
            if (resp.status === 200 || resp.statusText === 'OK') {
              const asymIds = resp.data["rcsb_polymer_entity_container_identifiers"]["asym_ids"] as string[]|undefined;
              const authAsymIds = resp.data["rcsb_polymer_entity_container_identifiers"]["auth_asym_ids"] as string[]|undefined;
              if (asymIds && authAsymIds && asymIds.length === authAsymIds.length) {
                asymIds.map((asymId, ind) => { 
                  axios.get(`https://data.rcsb.org/rest/v1/core/polymer_entity_instance/${pdbId}/${asymId}`)
                  .then(resp => { 
                    if (resp.status === 200 || resp.statusText === 'OK') {
                      const dataAsymId = resp.data["rcsb_polymer_entity_instance_container_identifiers"]["asym_id"] as string;
                      const dataAuthAsymId = resp.data["rcsb_polymer_entity_instance_container_identifiers"]["auth_asym_id"] as string;
                      if (dataAsymId === asymId && dataAuthAsymId === authAsymIds[ind]) {         
                        const seqMapping = resp.data["rcsb_polymer_entity_instance_container_identifiers"]["auth_to_entity_poly_seq_mapping"] as string[];
                        entityToChainToLen[entityId][authAsymIds[ind]] = seqMapping[seqMapping.length-1];
                        chainList.push(authAsymIds[ind]);
                        aaSubs.length > 0 && aaSubs.map(aaSub => {
                          if (parseInt(aaSub.pos as string) < parseInt(entityToChainToLen[entityId][authAsymIds[ind]])) {
                            let newAaSub = { ...aaSub, chain: authAsymIds[ind] };
                            filteredAaSubs.push(newAaSub);
                            newAaSub.target === '' 
                              ? AMINO_ACIDS.map(AA => jmolAaSubs.push({...newAaSub, target: AA})) 
                              : jmolAaSubs.push(newAaSub)
                          }
                          
                        })
                      }
                    }
                  })
                  .catch((err: Error) => console.log(err.message))
                })
              }
            }
          })
          .catch((err: Error) => console.log(err.message))
        })
      })
      .catch((err: Error) => console.log(err.message));
      return { chainList: chainList.sort((a, b) => a > b ? 1 : -1 ), aaSubs: jmolAaSubs };
    }
    

    const toggleExtraModal = () => setExtraModalOpen(!isExtraModalOpen);
    const ExtraPdbQueryModal: FC<any> = () => {
      const [indpMolPdbIdQuery, setIndpMolPdbIdQuery] = useState<string>('');
      const handleExtraPdbIdInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
        evt.preventDefault();
        setIndpMolPdbIdQuery(evt.target.value);
      }
      const clearExtraPdbIdInput = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        setIndpMolPdbIdQuery('');
      }
      const submitExtraPdbIdInput = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (indpMolPdbIdQuery.match(/(?<=^\s*>)[1-9]\w{3}/)) {
          let pdbIdMatch = indpMolPdbIdQuery.match(/(?<=^\s*>)[1-9]\w{3}/);
          pdbIdMatch && // use axios.get to RCSB-PDB's RESTful API to check if this pdb-id exists
          axios.get(`https://data.rcsb.org/rest/v1/core/pubmed/${pdbIdMatch[0].toUpperCase()}`)
          .then(resp => { if (pdbIdMatch) { //verbose but necessary in typescript since it's a promise chain
            const processedPdbId = pdbIdMatch[0].toUpperCase();
            if (resp.status === 200 || resp.statusText === 'OK') {
              if (!uniquePdbIds(queryHistory).includes(processedPdbId)) {
                let aaPosSubList: Array<Omit<AaSub, 'chain'>> = [];
                let aaPosSubs = indpMolPdbIdQuery.match(/(?<=^\s*>[1-9]\w{3})(\s+\d+[arndcqeghilkmfpstwyv]|\s+\d+)+/gim);
                aaPosSubs ? 
                aaPosSubs[0].toUpperCase().split(/\s+/).filter(str => str.length > 0).map(aaPosSub => {  
                  const pos = aaPosSub.match(/\d+(?=[arndcqeghilkmfpstwyv]{0,1})/i);
                  const subTo = aaPosSub.match(/(?<=\d+)[arndcqeghilkmfpstwyv]/i);
                  pos && !subTo ? aaPosSubList.push({ 
                    pos: pos[0] as string, target: ''
                  }) :
                  pos && subTo && aaPosSubList.push({ 
                    pos: pos[0] as string, 
                    target: subTo[0].toUpperCase()
                  });
                }) &&
                setTimeout(() => {
                  const filteredPdbData = filterExtraAaSubs(processedPdbId, aaPosSubList);
                  dispatch(addIndpMolPdbIdQuery(molState.indpPdbIdQueries.jmol.filter(
                    query => query.pdbToLoad !== processedPdbId
                  ).concat({ 
                    pdbToLoad: processedPdbId, 
                    aaSubs: filteredPdbData.aaSubs,
                    chainList: filteredPdbData.chainList
                  }), molState.molVisChoice)) &&
                  setTimeout(() => dispatch(setJmolPdbId(processedPdbId)), 1500) && 
                  setExtraModalOpen(false)
                }, 20) :
                alert('Your query isn\'t correctly formatted!')
                }
              }
              else alert('Your PDB-id query is already existent in query history!')
            }
          })
          .catch((err: Error) => alert(`Network error, or the query you type isn't a published PDB-ID at RCSB-PDB!`))
        } 
        else alert('Your query isn\'t correctly formatted!') 
      }
      return (
      <Modal isOpen={isExtraModalOpen} toggle={toggleExtraModal}
        style={{ marginLeft: 16, minWidth: 400, maxWidth: 400 }}>
        <ModalBody>
          <Form onSubmit={submitExtraPdbIdInput} onReset={clearExtraPdbIdInput}>
            <FormGroup row>
              <Col>
                <Label style={{ marginTop: '0.5rem' }} htmlFor="extraPdbIdInput">
                  Add an extra PDB code-query with AA positions for mol-visualization:
                </Label>
                <Input type="textarea" id="extraPdbIdInput" name="extraPdbIdInput"
                value={indpMolPdbIdQuery} onChange={handleExtraPdbIdInput}
                valid={
                  indpMolPdbIdQuery.match(JMOL_ENTRY_REGEX) !== null
                }
                invalid={
                  !JMOL_ENTRY_REGEX.test(indpMolPdbIdQuery) 
                }
                rows="5" 
                placeholder={ExtraQueryExampleJmol} >  
                </Input>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col lg={{ size: 3, offset: 2 }}>
                <Button type="reset" color="warning" style={{ marginBottom: '0.5rem' }}>Clear</Button>
              </Col>
              <Col lg={{ size: 6 }}>
                <Button type="submit" color="primary">Submit</Button>
              </Col>
            </FormGroup>
          </Form>
        </ModalBody>
      </Modal> 
      )
    }
    const QueryList: FC<any> = () => (
      <div className='pdb-query-list' style={{ height: 760 }}>        
        <CardTitle tag="h5" style={{ marginTop: 10 }}
        >Which AA-clash code-queries to list</CardTitle>
        <ButtonGroup>
          <Button className='btn-sm'
          color="info" onClick={ () => dispatch(switchMolListDisplayMode('latest')) }
          active={molState.displayMode === 'latest'}>Latest</Button>
          <Button className='btn-sm'
          color="info" onClick={ () => dispatch(switchMolListDisplayMode('history')) }
          active={molState.displayMode === 'history'}>History</Button>
        </ButtonGroup>
        <CardTitle tag="h6"
        style={{ marginTop: '1rem' }}>AA-Clash PDB-ID queries</CardTitle>
        <ol className='pdb-query-ol'>
      { 
        molState.displayMode === 'latest' && molState.molVisChoice === 'Jmol' &&
          uniquePdbIds(queries).map((query, ind) =>  molState.jmolPdbAaSubs.pdbToLoad === query ? 
          <li key={`Jmol_${query}_${ind}`} className='pdb-query-item-selected'>
            <span className='pdb-id-span'>{query}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
          </li> :
          <li key={`Jmol_${query}_${ind}`} onClick={() => dispatch(setJmolPdbId(query))}
          className='pdb-query-item'>
            <span className='pdb-id-span'>{query}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
          </li> 
        ) 
      }
      {
        molState.displayMode === 'history' && molState.molVisChoice === 'Jmol' &&
          uniquePdbIds(queryHistory).map((query, ind) =>  molState.jmolPdbAaSubs.pdbToLoad === query ? 
          <li key={`Jmol_${query}_${ind}`} className='pdb-query-item-selected'>
            <span className='pdb-id-span'>{query}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
          </li> :
          <li key={`Jmol_${query}_${ind}`} onClick={() => dispatch(setJmolPdbId(query))}
          className='pdb-query-item'>
            <span className='pdb-id-span'>{query}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
          </li> 
        )
      }
        <CardTitle tag="h6" style={{ color: '#663399', marginTop: '1rem' }}>Extra PDB-ID queries</CardTitle>
          <Button className='btn btn-sm' color='link' style={{ margin: 0, marginBottom: 5, textAlign: 'left'}}
            onClick={toggleExtraModal}>
              Add an query for {molState.molVisChoice}
          </Button>
          <ol className='pdb-query-ol'>
      { 
        molState.molVisChoice === 'Jmol' && molState.indpPdbIdQueries.jmol.length > 0 &&
          molState.indpPdbIdQueries.jmol.map((query, ind) => molState.jmolPdbAaSubs.pdbToLoad === query.pdbToLoad ? 
          <li key={`indpPdbId_`} className='pdb-query-item-selected'>
            <span className='extra-pdb-id-span'>{query.pdbToLoad}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => deleteExtraPdbIdQuery(e, ind) }></i>
          </li> : 
          <li key={`indpPdbId_${ind}`} className='pdb-query-item' 
          onClick={() => dispatch(setJmolPdbId(query.pdbToLoad))}>
            <span className='extra-pdb-id-span'>{query.pdbToLoad}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => deleteExtraPdbIdQuery(e, ind) }></i>
          </li>
        ) 
      }
          </ol>
        </ol>
      </div> 
    )

    return (
        <div className="mol-comp under-sticky">
          <QueryList />
          <ExtraPdbQueryModal />
          <JsMol pdbId={molState.jmolPdbAaSubs.pdbToLoad} 
          aaPreds={aggregateAaListForPdbId(molState.jmolPdbAaSubs.pdbToLoad)} /> :
        </div>
    )
}

export default MolComponent;