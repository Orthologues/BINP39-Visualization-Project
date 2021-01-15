import React, { FC, useEffect, useState } from 'react'; 
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { useGetPdbBasicQuery } from '../../graphql';
import RcsbPdbGql, { PdbIdSeqAndToUniprot } from './RcsbGraphQl';
import { Card, CardHeader, CardTitle, CardBody, CardText, Button, ButtonGroup } from 'reactstrap';
import { switchGqlListMode, selectGqlPdbId } from '../../redux/ActionCreators';
import '../../css/RcsbPdbGql.css';


type EntryProps = {
    queries: Array<PdbIdAaQuery>; // AA-Clash queries in redux-store
    queryHistory: Array<PdbIdAaQuery>; // AA-Clash query history in redux-store
}

type EntryState = {
    listDisplayMode: 'latest' | 'history' // defines which pdb-code queries to display
}

const RcsbGqlIndex: FC<EntryProps> = ({queries, queryHistory}) => {

    const [state, setState] = useState<EntryState>({listDisplayMode: 'latest'});
    const selectedQuery = useSelector<AppReduxState, PdbIdAaQuery|undefined>(state => state.rcsbGraphQl.selectedQuery);
    const listDisplayMode = useSelector<AppReduxState, string>(state => state.rcsbGraphQl.displayMode);
    const dispatch = useDispatch<Dispatch<PayloadAction>>();
    const { data, error, loading, refetch } = useGetPdbBasicQuery({
        variables: { entry_id: selectedQuery ? selectedQuery.pdbId : '' },
    });

    useEffect(() => { refetch() }, [selectedQuery]);

    const QueryList = (): JSX.Element => (
        <div className='pdb-query-list'>
          
          <CardTitle tag="h5">Choose which queries to list</CardTitle>
          <ButtonGroup style={{ marginTop: '0.5rem' }}>
            <Button color="info" onClick={ () => dispatch(switchGqlListMode('latest')) }
            active={listDisplayMode === 'latest'}>Your latest query</Button>
            <Button color="info" onClick={ () => dispatch(switchGqlListMode('history')) }
            active={listDisplayMode === 'history'}>History of your queries</Button>
          </ButtonGroup>
          <CardTitle tag="h3">Your PDB-ID queries</CardTitle>
          <ol className='pdb-query-ol'>
            { listDisplayMode === 'latest' ?
            queries.map((query, ind) => ( selectedQuery === query ? 
            ( <li key={`${query.pdbId}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item-selected'>
                {query.pdbId}
              </li> ):
            ( <li key={`${query.pdbId}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item'>
                {query.pdbId}
              </li> )
            )): 
            queryHistory.map((query, ind) => ( selectedQuery === query ? 
            ( <li key={`${query.pdbId}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item-selected'>
                {query.pdbId}
              </li> ):
            ( <li key={`${query.pdbId}_${ind}`} onClick={() => dispatch(selectGqlPdbId(query))}
              className='pdb-query-item'>
                {query.pdbId}
              </li> )
            ))}
          </ol>
        </div> )

    if (loading) {
        return (
          <div className='rcsb-gql-div'>
            <QueryList />
            <Card>
              <CardBody>
                <CardTitle>Loading data from RCSB-PDB …</CardTitle>
              </CardBody>
            </Card>
          </div> 
        )
    }

    if (error) {
        return (
          <div className='rcsb-gql-div'>
            <QueryList />
            <Card>
              <CardHeader>
                <CardTitle>Failed to fetch data from RCSB-PDB</CardTitle>
              </CardHeader>
              <CardBody>  
                <CardText>
                  {`Error message: ${error.message}`}
                </CardText>
              </CardBody>
            </Card>
          </div> 
        )
    }

    if (!data) {
        return (
          <div className='rcsb-gql-div'>
            <QueryList />
            <Card>
              <CardBody>
                <CardTitle>Failed to fetch data from RCSB-PDB</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Data from RCSB-PDB's GraphQl API</CardTitle>
              </CardHeader>
              <CardBody>  
                { selectedQuery && (<RcsbPdbGql pdbCode={selectedQuery.pdbId} rootQuery={data}/>) }
                { entityIds.map((entityId, ind) => 
                   (<PdbIdSeqAndToUniprot key={`mapping_seq_${entryId}_${String(entityId)}_${ind}`}
                    entryId={entryId} entityId={String(entityId)}/>)
                )}
              </CardBody>
            </Card>
          </div> 
        )
    }

    return (
      <div className='rcsb-gql-div'>
        <QueryList />
      </div> );
}

export default RcsbGqlIndex;