import React, { FC, useEffect } from 'react'; 
import { QueryResult } from '@apollo/client';
import { useGetPdbBasicQuery } from '../../graphql';
import RcsbPdbGql, { PdbIdSeqAndToUniprot } from './RcsbGraphQl';
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap';
import '../../css/RcsbPdbGql.css';

type EntryProps = {
    pdbCodeEntry: string
}

const RcsbGqlIndex: FC<EntryProps> = (props) => {

    let { data, error, loading, refetch } = useGetPdbBasicQuery({
        variables: { entry_id: String(props.pdbCodeEntry) },
    });

    const pdbBasicResult: Partial<ReturnType<typeof useGetPdbBasicQuery>> = {
        data: data, 
        error: error,
        loading: loading,
        refetch: refetch
    }

    useEffect(() => {
        refetch();
    }, [props.pdbCodeEntry]);

    if (pdbBasicResult.loading) {
        return (
            <Card>
              <CardBody>
                <CardTitle>Loading data from RCSB-PDB …</CardTitle>
              </CardBody>
            </Card> 
        )
    }

    if (pdbBasicResult.error) {
        return (
            <Card>
              <CardHeader>
                <CardTitle>Failed to fetch data from RCSB-PDB</CardTitle>
              </CardHeader>
              <CardBody>  
                <CardText>
                  {`Error message: ${pdbBasicResult.error.message}`}
                </CardText>
              </CardBody>
            </Card> 
        )
    }

    if ( pdbBasicResult.data?.entry?.rcsb_entry_container_identifiers.rcsb_id && 
        pdbBasicResult.data.entry.rcsb_entry_container_identifiers.entity_ids ) {
        
        const entryId = pdbBasicResult.data?.entry?.rcsb_entry_container_identifiers.rcsb_id;
        const entityIds = pdbBasicResult.data.entry.rcsb_entry_container_identifiers.entity_ids;

        entityIds.map(entityId => {
      
        });
        
    }

    return (
        <Card>
          <CardBody>
            <CardTitle>RCSB-PDB API</CardTitle>
          </CardBody>
        </Card> 
    )
}

export default RcsbGqlIndex;