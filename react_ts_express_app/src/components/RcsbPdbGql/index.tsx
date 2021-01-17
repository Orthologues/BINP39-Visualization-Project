import React, { FC, useEffect } from 'react'; 
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { useGetPdbBasicQuery } from '../../graphql';
import RcsbPdbGql, { PdbIdSeqAndToUniprot } from './RcsbGraphQl';
import { Card, CardHeader, CardTitle, CardBody, CardText, Button, ButtonGroup } from 'reactstrap';
import { switchGqlListMode, selectGqlPdbId } from '../../redux/ActionCreators';
import '../../css/RcsbPdbGql.css';


type EntryProps = {
    queries: Array<string>; // The unique set of PDB-IDs of AA-Clash queries in redux-store
    queryHistory: Array<string>; // The unique set of PDB-IDs AA-Clash query history in redux-store
}

type EntryState = {
    listDisplayMode: 'latest' | 'history' // defines which pdb-code queries to display
}

const RcsbGqlIndex: FC<EntryProps> = ({queries, queryHistory}) => {

    const selectedQuery = useSelector<AppReduxState, string|undefined>(state => state.rcsbGraphQl.selectedPdbId);
    const listDisplayMode = useSelector<AppReduxState, string>(state => state.rcsbGraphQl.displayMode);
    const dispatch = useDispatch<Dispatch<PayloadAction>>();
    const { data, error, loading, refetch } = useGetPdbBasicQuery({
        variables: { entry_id: selectedQuery ? selectedQuery : '' },
    });

    useEffect(() => { refetch() }, [selectedQuery]);

    const QueryList = (): JSX.Element => (
        <div className='pdb-query-list'>
          
          <CardTitle tag="h5" style={{ marginTop: '1rem' }}
          >Choose which queries to list</CardTitle>
          <ButtonGroup>
            <Button className='btn-sm'
            color="primary" onClick={ () => dispatch(switchGqlListMode('latest')) }
            active={listDisplayMode === 'latest'}>Your latest query</Button>
            <Button className='btn-sm'
            color="primary" onClick={ () => dispatch(switchGqlListMode('history')) }
            active={listDisplayMode === 'history'}>History of your queries</Button>
          </ButtonGroup>
          <CardTitle tag="h4"
          style={{ marginTop: '1rem' }}>Your PDB-ID queries</CardTitle>
          <ol className='pdb-query-ol'>
            { listDisplayMode === 'latest' ?
            queries.map((query, ind) => ( selectedQuery === query ? 
            ( <li key={`${query}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item-selected'>
                {query}
              </li> ):
            ( <li key={`${query}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item'>
                {query}
              </li> )
            )) : 
            queryHistory.map((query, ind) => ( selectedQuery === query ? 
            ( <li key={`${query}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item-selected'>
                {query}
              </li> ):
            ( <li key={`${query}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item'>
                {query}
              </li> )
            )) }
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

    if (!data) {
        return (
          <div className='rcsb-gql-div'>
            <QueryList />
            <Card>
              <CardBody>
                <CardTitle tag='h3'>Failed to fetch data from RCSB-PDB</CardTitle>
              </CardBody>
            </Card>
          </div>
        )
    }

    if ( data && data.entry?.rcsb_entry_container_identifiers.rcsb_id && 
        data.entry.rcsb_entry_container_identifiers.entity_ids ) {
        
        const entryId = data.entry.rcsb_entry_container_identifiers.rcsb_id;
        const entityIds = data.entry.rcsb_entry_container_identifiers.entity_ids;

        return (
          <div className='rcsb-gql-div'>
            <QueryList />
            <div className='container-fluid'>
              <div className='row rcsb-info-header'>
                <div className='col-12'>
                  <CardTitle tag='h3'>Data from RCSB-PDB's GraphQL API</CardTitle>
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
      </div> );
}

export default RcsbGqlIndex;