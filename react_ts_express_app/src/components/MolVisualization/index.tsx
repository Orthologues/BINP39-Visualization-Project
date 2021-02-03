import React, { FC, useState } from 'react';
import JsMol from './JmolComponent';
import Mol3D from './Mol3dComponent';
import axios from 'axios';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { CardTitle, Button, ButtonGroup, Label, Input } from 'reactstrap';
import { uniquePdbIds, uniqueStrings, aaClashPredGoodBad } from '../../shared/Funcs'
import { switchMolListDisplayMode, switchMolVisChoice, addIndpMolPdbIdQuery, delIndpMolPdbIdQuery, 
  deleteCodeQuery, eraseCodeQueryHistory, setJmolPdbId, set3DmolPdbId } from '../../redux/ActionCreators';
import '../../css/Mol.css';


const MolComponent: FC<any> = () => {
    const queries = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queries);
    const queryHistory = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queryHistory);
    const preds = useSelector<AppReduxState, AaClashPredData[]>(state => state.aaClashQuery.codePredResults);
    const predHistory = useSelector<AppReduxState, AaClashPredData[]>(state => 
      state.aaClashQuery.codePredResultHistory);
    const molState = useSelector<AppReduxState, MolComponentState>(state => state.molVis);
    const dispatch = useDispatch<Dispatch<PayloadAction>>();
    const [indpMolPdbId, setIndpMolPdbId] = useState<string>('');
    
    const deleteQueriesOfPdbId = (evt: React.MouseEvent<HTMLElement, MouseEvent>, ind: number) => {
      evt.stopPropagation(); 
      if (queryHistory.length > 1) {
        const pdbIdToDelete = document.getElementsByClassName('pdb-id-span')[ind].textContent;
        pdbIdToDelete && queryHistory.map(query => {
          const processedPdbIdToDel = pdbIdToDelete.replace(/^\s+|\s+$/g, '').toUpperCase();
          processedPdbIdToDel === query.pdbId.toUpperCase() && dispatch(deleteCodeQuery(query));
          molState.molVisChoice === 'Jmol' ? 
          molState.jmolPdbAaSubs.pdbToLoad.toUpperCase() === processedPdbIdToDel 
          && dispatch(setJmolPdbId('')) :
          molState.mol3DPdbAa.pdbToLoad.toUpperCase() === processedPdbIdToDel 
          && dispatch(set3DmolPdbId('')) 
        })
      } else {
        dispatch(eraseCodeQueryHistory()) && dispatch(setJmolPdbId('')) && dispatch(set3DmolPdbId('')) 
      }
    }
    const deleteExtraPdbIdQUery = (evt: React.MouseEvent<HTMLElement, MouseEvent>, ind: number) => {
      evt.stopPropagation(); 
      const pdbIdToDelete = document.getElementsByClassName('extra-pdb-id-span')[ind].textContent;
      pdbIdToDelete && dispatch(delIndpMolPdbIdQuery(pdbIdToDelete)) && 
      molState.molVisChoice === 'Jmol' ?
      dispatch(setJmolPdbId('')) : dispatch(set3DmolPdbId(''))
    }
    const handleExtraPdbIdInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
      evt.preventDefault();
      setIndpMolPdbId(evt.target.value);
    }
    const submitExtraPdbIdInput = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      evt.preventDefault();
      const processedQuery= indpMolPdbId.replace(/^\s+|\s+$/g, '').toUpperCase();
      // use axios.get to RCSB-PDB's RESTful API to check if this pdb-id exists
      axios.get(`https://data.rcsb.org/rest/v1/core/pubmed/${processedQuery}`).then(resp => {
        if (resp.status === 200 || resp.statusText === 'OK') {
          !uniquePdbIds(queryHistory).includes(processedQuery) && 
          dispatch(addIndpMolPdbIdQuery(uniqueStrings(molState.indpPdbIdQueries.concat(processedQuery)))); 
          molState.molVisChoice === 'Jmol' ?
          dispatch(setJmolPdbId(processedQuery)) : dispatch(set3DmolPdbId(processedQuery)) 
        }
      }).catch((err: Error) => alert(`${err.message}. The query you type isn't a published PDB-ID at RCSB-PDB!`))
    }
    const aggregateAaListForPdbId = (pdbId: string): { goodList: string[], badList: string[] } => {
      const processedPdbId = pdbId.replace(/^\s+|\s+$/g, '').toUpperCase();
      let predPdbId = '';
      if (molState.displayMode === 'latest') {
        let allGoodAas: Array<string> = [], allBadAas: Array<string> = [];
        preds.map(pred => {
          let predPdbIdMatch = pred.queryId.match(/\w{4}(?=_\w+)/i);
          predPdbIdMatch && console.log(predPdbIdMatch[0]);
          if (predPdbIdMatch && predPdbIdMatch.length === 1) {
            predPdbId = predPdbIdMatch[0].replace(/^\s+|\s+$/g, '').toUpperCase(); 
          }
          if (processedPdbId === predPdbId) {
            const goodAas = aaClashPredGoodBad(pred).goodList;
            const badAas = aaClashPredGoodBad(pred).badList;
            allGoodAas = allGoodAas.concat(goodAas); 
            allBadAas = allBadAas.concat(badAas);
          }
          
        });
        return { goodList: uniqueStrings(allGoodAas), badList: uniqueStrings(allBadAas) }
      } 
      else {
        let allGoodAas: Array<string> = [], allBadAas: Array<string> = [];
        predHistory.map(pred => {
          let predPdbIdMatch = pred.queryId.match(/\w{4}(?=_\w+)/i);
          if (predPdbIdMatch && predPdbIdMatch.length === 1) {
            predPdbId = predPdbIdMatch[0].replace(/^\s+|\s+$/g, '').toUpperCase(); 
          }
          if (processedPdbId === predPdbId) {
            const goodAas = aaClashPredGoodBad(pred).goodList;
            const badAas = aaClashPredGoodBad(pred).badList;
            allGoodAas = allGoodAas.concat(goodAas); 
            allBadAas = allBadAas.concat(badAas);
          }
          
        });
        return { goodList: uniqueStrings(allGoodAas), badList: uniqueStrings(allBadAas) }
      }
    }

    const QueryList = (): JSX.Element => (
      <div className='pdb-query-list' style={{ height: 760 }}>        
        <CardTitle tag="h5" style={{ marginTop: 12 }}
        >Choose a tool</CardTitle>
        <ButtonGroup>
          <Button className='btn-sm'
          color="info" onClick={ () => dispatch(switchMolVisChoice('Jmol')) }
          active={molState.molVisChoice ==='Jmol'}>JSmol</Button>
          <Button className='btn-sm'
          color="info" onClick={ () => dispatch(switchMolVisChoice('3Dmol')) }
          active={molState.molVisChoice === '3Dmol'}>3Dmol</Button>
        </ButtonGroup>
        <hr />
        <CardTitle tag="h5" style={{ marginTop: 0 }}
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
        molState.displayMode === 'latest' && molState.molVisChoice === 'Jmol' ?
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
          ) : 
        molState.displayMode === 'latest' && molState.molVisChoice === '3Dmol' ?
          uniquePdbIds(queries).map((query, ind) => molState.mol3DPdbAa.pdbToLoad === query ? 
            <li key={`3Dmol_${query}_${ind}`} className='pdb-query-item-selected'>
              <span className='pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
            </li> :
            <li key={`3Dmol_${query}_${ind}`} onClick={() => dispatch(set3DmolPdbId(query))}
            className='pdb-query-item'>
              <span className='pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
            </li> 
          ) :
        molState.displayMode === 'history' && molState.molVisChoice === 'Jmol' ?
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
          ) : 
          uniquePdbIds(queryHistory).map((query, ind) => molState.mol3DPdbAa.pdbToLoad === query ? 
            <li key={`3Dmol_${query}_${ind}`} className='pdb-query-item-selected'>
              <span className='pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
            </li> :
            <li key={`3Dmol_${query}_${ind}`} onClick={() => dispatch(set3DmolPdbId(query))}
            className='pdb-query-item'>
              <span className='pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
            </li> 
          )
        }
        <CardTitle tag="h6" style={{ color: '#663399', marginTop: '1rem' }}>Extra PDB-ID queries</CardTitle>
          <ol className='pdb-query-ol'>
        { 
        molState.molVisChoice === 'Jmol' ?
          molState.indpPdbIdQueries.length > 0 && 
          molState.indpPdbIdQueries.map((query, ind) => molState.jmolPdbAaSubs.pdbToLoad === query ? 
            <li key={`indpPdbId_`} className='pdb-query-item-selected'>
              <span className='extra-pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteExtraPdbIdQUery(e, ind) }></i>
            </li> : 
            <li key={`indpPdbId_${ind}`} className='pdb-query-item' 
            onClick={() => dispatch(setJmolPdbId(query))}>
              <span className='extra-pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteExtraPdbIdQUery(e, ind) }></i>
            </li>
          ) :
          molState.indpPdbIdQueries.length > 0 && 
          molState.indpPdbIdQueries.map((query, ind) => molState.mol3DPdbAa.pdbToLoad === query ? 
            <li key={`indpPdbId_`} className='pdb-query-item-selected'>
              <span className='extra-pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteExtraPdbIdQUery(e, ind) }></i>
            </li> : 
            <li key={`indpPdbId_${ind}`} className='pdb-query-item' 
            onClick={() => dispatch(set3DmolPdbId(query))}>
              <span className='extra-pdb-id-span'>{query}</span>
              <i className="fa fa-trash fa-lg deletion-fa-icon"
              onClick={ e => deleteExtraPdbIdQUery(e, ind) }></i>
            </li>
          )
        }
          </ol>
        </ol>
      </div> )

    return (
        <div className="mol-comp under-sticky">
          <QueryList />
          <div className='row'>
            <div className='col-12 col-lg-3'>
              <div className='row' style={{marginBottom: 8}}>
                <div className='col-12' style={{marginTop: 12, marginLeft: 12, textAlign: 'left'}}>
                  <Label for='extra-pdb-id'>Type in a PDB-ID to access MOL directly</Label>
                  <div className='row' style={{marginLeft: 0}}>
                    <Input id='extra-pdb-id' onChange={handleExtraPdbIdInput} 
                    placeholder={`For example, "4QNP"`} 
                    style={{width: '12rem', marginRight: '0.5rem' }}></Input>
                    <Button type='button' className='btn-sm' color='primary' style={{marginTop: 5}}
                    onClick={submitExtraPdbIdInput}>Submit</Button>
                  </div>
                </div>
              </div>
              <p>{JSON.stringify(aggregateAaListForPdbId(molState.molVisChoice === 'Jmol' ?
                molState.jmolPdbAaSubs.pdbToLoad : molState.mol3DPdbAa.pdbToLoad)) }</p>
            </div>
            <div className= 'col-12 col-lg-9'>
            {
            molState.molVisChoice === 'Jmol' ?
              <JsMol pdbId={molState.jmolPdbAaSubs.pdbToLoad} aaSelectionList={[]} /> :
              <Mol3D pdbId={molState.mol3DPdbAa.pdbToLoad} aaSelectionList={[]}/>
            }
            </div>
          </div>
        </div>
    )
}

export default MolComponent;