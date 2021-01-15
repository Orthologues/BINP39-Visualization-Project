import React, { FC, useEffect } from 'react'; 
import { useGetPdbBasicQuery } from '../../graphql';
import RcsbPdbGql, { PdbIdSeqAndToUniprot } from './RcsbGraphQl';
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap';
import '../../css/RcsbPdbGql.css';

type EntryProps = {
    pdbCode: string
}

const RcsbGqlIndex: FC<EntryProps> = ({pdbCode}) => {

    const { data, error, loading, refetch } = useGetPdbBasicQuery({
        variables: { entry_id: String(pdbCode) },
    });

    useEffect(() => {
        refetch();
    }, [pdbCode]);

    if (loading) {
        return (
            <Card>
              <CardBody>
                <CardTitle>Loading data from RCSB-PDB …</CardTitle>
              </CardBody>
            </Card> 
        )
    }

    if (error) {
        return (
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
        )
    }

    if (!data) {
        return (
            <Card>
              <CardBody>
                <CardTitle>Failed to fetch data from RCSB-PDB</CardTitle>
              </CardBody>
            </Card> 
        )
    }

    if ( data?.entry?.rcsb_entry_container_identifiers.rcsb_id && 
        data.entry.rcsb_entry_container_identifiers.entity_ids ) {
        
        const entryId = data?.entry?.rcsb_entry_container_identifiers.rcsb_id;
        const entityIds = data.entry.rcsb_entry_container_identifiers.entity_ids;

        return (
            <Card>
              <CardHeader>
                <CardTitle>Data from RCSB-PDB's GraphQl API</CardTitle>
              </CardHeader>
              <CardBody>  
                <RcsbPdbGql pdbCode={pdbCode} rootQuery={data}/>
                {entityIds.map(entityId => 
                    (<PdbIdSeqAndToUniprot entryId={entryId} entityId={String(entityId)}/>)
                )}
              </CardBody>
            </Card> 
        )
    }

    return (<div></div>);
}

export default RcsbGqlIndex;