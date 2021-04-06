import React, { FC, useEffect, useState } from 'react'; 
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useGetPdbBasicQuery } from './GqlLib';
import RcsbPdbGql, { PdbIdSeqAndToUniprot } from './RcsbGraphQl';
import { switchGqlListMode, selectGqlPdbId, deleteCodeQuery, deleteIndpRcsbPdbIdQuery,
  eraseCodeQueryHistory, addIndpRcsbPdbIdQuery } from '../../redux/ActionCreators';
import { uniquePdbIds, uniqueStrings } from '../../shared/Funcs';
import { CardTitle, CardText, Button, ButtonGroup, Label, Input } from 'reactstrap';
import './RcsbPdbGql.css';

// <RcsbGraphQl queries={uniquePdbIds(this.props.aaClashQuery.queries)}
// queryHistory={uniquePdbIds(this.props.aaClashQuery.queryHistory)} />

const RcsbGqlIndex: FC<any> = () => {

    const selectedQuery = useSelector<AppReduxState, string|undefined>(state => state.rcsbGraphQl.selectedPdbId);
    const listDisplayMode = useSelector<AppReduxState, string>(state => state.rcsbGraphQl.displayMode);
    const queries = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queries);
    const queryHistory = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queryHistory);
    const indpPdbIdQueries = useSelector<AppReduxState, Array<string>>(state => state.rcsbGraphQl.indpPdbIdQueries);
    const dispatch = useDispatch<Dispatch<PayloadAction>>();
    const [extraPdbIdQuery, setExtraPdbIdQuery] = useState<string>('');
    const { data, error, loading, refetch } = useGetPdbBasicQuery({
        variables: { entry_id: selectedQuery ? selectedQuery : '' },
    });

    useEffect(() => { refetch() }, [selectedQuery]);

    const deleteQueriesOfPdbId = (evt: React.MouseEvent<HTMLElement, MouseEvent>, ind: number) => {
      evt.stopPropagation(); 
      if (queryHistory.length > 1) {
        const pdbIdToDelete = document.getElementsByClassName('pdb-id-span')[ind].textContent;
        pdbIdToDelete && queryHistory.map(query => {
          const processedPdbIdToDel = pdbIdToDelete.replace(/^\s+|\s+$/g, '').toUpperCase();
          processedPdbIdToDel === query.pdbId.toUpperCase() && dispatch(deleteCodeQuery(query));
          selectedQuery?.toUpperCase() === processedPdbIdToDel && dispatch(selectGqlPdbId(''));
        })
      } else {
        dispatch(eraseCodeQueryHistory()) && dispatch(selectGqlPdbId(''))
      }
    }
    const deleteExtraPdbIdQUery = (evt: React.MouseEvent<HTMLElement, MouseEvent>, ind: number) => {
      evt.stopPropagation(); 
      const pdbIdToDelete = document.getElementsByClassName('extra-pdb-id-span')[ind].textContent;
      pdbIdToDelete && dispatch(deleteIndpRcsbPdbIdQuery(pdbIdToDelete)) && 
      dispatch(selectGqlPdbId(''))
    }
    const handleExtraPdbIdInput = (evt: React.ChangeEvent<HTMLInputElement>) => {
      evt.preventDefault();
      setExtraPdbIdQuery(evt.target.value);
    }
    const submitExtraPdbIdInput = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      evt.preventDefault();
      const processedQuery= extraPdbIdQuery.replace(/^\s+|\s+$/g, '').toUpperCase();
      // use axios.get to RCSB-PDB's RESTful API to check if this pdb-id exists
      axios.get(`https://data.rcsb.org/rest/v1/core/pubmed/${processedQuery}`).then(resp => {
        if (resp.status === 200 || resp.statusText === 'OK') {
          !uniquePdbIds(queryHistory).includes(processedQuery) && 
          dispatch(addIndpRcsbPdbIdQuery(uniqueStrings(indpPdbIdQueries.concat(processedQuery))));
          dispatch(selectGqlPdbId(processedQuery)) 
        }
      }).catch((err: Error) => alert(`${err.message}. The query you type isn't a published PDB-ID at RCSB-PDB!`))
    }

    const QueryList = (): JSX.Element => (
        <div className='pdb-query-list'>        
          <CardTitle tag="h5" style={{ marginTop: 12 }}
          >Which AA-clash code-queries to list</CardTitle>
          <ButtonGroup>
            <Button className='btn-sm'
            color="info" onClick={ () => dispatch(switchGqlListMode('latest')) }
            active={listDisplayMode === 'latest'}>Latest</Button>
            <Button className='btn-sm'
            color="info" onClick={ () => dispatch(switchGqlListMode('history')) }
            active={listDisplayMode === 'history'}>History</Button>
          </ButtonGroup>
          <CardTitle tag="h6"
          style={{ marginTop: '1rem' }}>AA-Clash PDB-ID queries</CardTitle>
          <ol className='pdb-query-ol'>
            { listDisplayMode === 'latest' ?
            uniquePdbIds(queries).reverse().map((query, ind) => ( selectedQuery === query ? 
            ( <li key={`${query}_${ind}`} className='pdb-query-item-selected'>
                <span className='pdb-id-span'>{query}</span>
                <i className="fa fa-trash fa-lg deletion-fa-icon"
                onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
              </li> ):
            ( <li key={`${query}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item'>
                <span className='pdb-id-span'>{query}</span>
                <i className="fa fa-trash fa-lg deletion-fa-icon"
                onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
              </li> )
            )) : 
            uniquePdbIds(queryHistory).reverse().map((query, ind) => ( selectedQuery === query ? 
            ( <li key={`${query}_${ind}`} className='pdb-query-item-selected'>
                <span className='pdb-id-span'>{query}</span>
                <i className="fa fa-trash fa-lg deletion-fa-icon"
                onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
              </li> ):
            ( <li key={`${query}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item'>
                <span className='pdb-id-span'>{query}</span>
                <i className="fa fa-trash fa-lg deletion-fa-icon"
                onClick={ e => deleteQueriesOfPdbId(e, ind) }></i>
              </li> )
            )) }
          <CardTitle tag="h6" style={{ color: '#663399', marginTop: '1rem' }}>Extra PDB-ID queries</CardTitle>
            <ol className='pdb-query-ol'>
          { indpPdbIdQueries.length > 0 
              && indpPdbIdQueries.reverse().map((query, ind) => selectedQuery === query ? 
            ( <li key={`indpPdbId_`} className='pdb-query-item-selected'>
                <span className='extra-pdb-id-span'>{query}</span>
                <i className="fa fa-trash fa-lg deletion-fa-icon"
                onClick={ e => deleteExtraPdbIdQUery(e, ind) }></i>
              </li> ): 
            ( <li key={`indpPdbId_${ind}`} className='pdb-query-item' 
              onClick={() => dispatch(selectGqlPdbId(query))}>
                <span className='extra-pdb-id-span'>{query}</span>
                <i className="fa fa-trash fa-lg deletion-fa-icon"
                onClick={ e => deleteExtraPdbIdQUery(e, ind) }></i>
              </li> )) 
          }
            </ol>
          </ol>
        </div> )

    if (loading) {
        return (
          <div className='rcsb-gql-div'>
            <QueryList />
            <div className='rcsb-loading-or-error'>
              <CardTitle tag='h3'>Loading data from RCSB-PDB …</CardTitle>
            </div>
          </div> 
        )
    }
    if (error || !data) {
        return (
          <div className='rcsb-gql-div'>
            <QueryList />
            <div className='rcsb-loading-or-error'>
              <CardTitle tag='h3'>Failed to fetch data from RCSB-PDB</CardTitle>
              { error && (<CardText>{`Error message: ${error.message}`}</CardText>) }
            </div>
          </div> 
        )
    }
    if ( data && data.entry?.rcsb_entry_container_identifiers.rcsb_id && 
        data.entry.rcsb_entry_container_identifiers.entity_ids ) {
        
        const entryId = data.entry.rcsb_entry_container_identifiers.rcsb_id;
        const entityIds = data.entry.rcsb_entry_container_identifiers.entity_ids;

        return (
          <div className='rcsb-gql-div under-sticky'>
            <QueryList />
            <div className='container-fluid rcsb-gql-info'>
              <div className='row' style={{marginBottom: 8}}>
                <div className='col-12' style={{marginTop: 12, marginLeft: 12, textAlign: 'left'}}>
                  <Label for='extra-pdb-id'>Type in a PDB-ID to directly access RCSB-PDB API</Label>
                  <div className='row' style={{marginLeft: 0}}>
                    <Input id='extra-pdb-id' onChange={handleExtraPdbIdInput} 
                    placeholder={`For example, "4QNP"`} 
                    style={{width: '12rem', marginRight: '0.5rem' }}></Input>
                    <Button type='button' className='btn-sm' color='primary' style={{marginTop: 5}}
                    onClick={submitExtraPdbIdInput}>Submit</Button>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-12 col-lg-6'>
                { selectedQuery && (<RcsbPdbGql pdbCode={selectedQuery} rootQuery={data}/>) }
                </div>
                <div className='col-12 col-lg-6'>
                { entityIds.map((entityId, ind) => 
                  (<PdbIdSeqAndToUniprot key={`mapping_seq_${entryId}_${String(entityId)}_${ind}`}
                   entryId={entryId} entityId={String(entityId)}/>)
                ) }
                </div>
              </div>
            </div>
          </div> 
        )
    }
    return (
      <div className='rcsb-gql-div'>
        <QueryList />
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-12' style={{marginTop: 10, marginLeft: '1.5rem', textAlign: 'left'}}>
              <Label for='extra-pdb-id'>Type in a PDB-ID to directly access RCSB-PDB API</Label>
              <div className='row' style={{marginLeft: 0}}>
                <Input id='extra-pdb-id' onChange={handleExtraPdbIdInput} 
                placeholder={`For example, "4QNP"`} 
                style={{width: '12rem', marginRight: '0.5rem' }}></Input>
                <Button type='button' className='btn-sm' color='primary' style={{marginTop: 5}}
                onClick={submitExtraPdbIdInput}>Submit</Button>
              </div>
            </div>
          </div>
          <div className='row rcsb-loading-or-error'>
            <CardTitle tag='h3'>Failed to fetch data from RCSB-PDB for query "{selectedQuery}"</CardTitle>
          </div>
        </div>
      </div> );
}

export default RcsbGqlIndex;