import React, { FC, useEffect } from 'react'; 
import { GetPdbBasicQuery, MapPdbToUniprotQuery, GetUniprotBasicQuery } from '../../graphql';
import { useMapPdbToUniprotQuery, useGetUniprotBasicQuery } from '../../graphql';
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap';
import '../../css/RcsbPdbGql.css';

interface RootProps {
    pdbCode: string,
    rootQuery: GetPdbBasicQuery,
}

interface SecondaryProps {
    entryId: string, entityId: string 
}

interface TertiaryProps {
    uniprotId: string 
}

const ROOT_CLASS_NAME = 'root-query';
const SECONDARY_CLASS_NAME = 'secondary-query';
const TERTIARY_CLASS_NAME = 'tertiary-query';


const RcsbPdbIdInfo: FC<RootProps> = ({pdbCode, rootQuery}) => {

    if ( !rootQuery.entry || !rootQuery.entry.rcsb_entry_container_identifiers.rcsb_id ) {
        return (
            <div className={`${ROOT_CLASS_NAME}-no-entry`}>
                <Card>
                    <CardHeader>
                        <CardTitle>RCSB API</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <CardText>No valid PDB-ID for query {`'${pdbCode}'`} were found</CardText>
                    </CardBody>
                </Card>
            </div>
        )
    }

    if (! rootQuery.entry.rcsb_entry_container_identifiers.entity_ids) {
        return (
            <div className={`${ROOT_CLASS_NAME}-no-entry`}>
            <Card>
                <CardHeader>
                    <CardTitle>RCSB API</CardTitle>
                </CardHeader>
                <CardBody>
                    <CardText>No entity-ids for query {`'${pdbCode}'`} were found</CardText>
                </CardBody>
            </Card>
            </div>
        )
    }

    const RCSB_PDB_ID = rootQuery.entry.rcsb_entry_container_identifiers.rcsb_id;
    return (
        <div className={`${ROOT_CLASS_NAME}-entry`}>
          <Card>
            <CardHeader>
                <CardTitle>RCSB API</CardTitle>
            </CardHeader>
            <CardBody>
              <CardText>
                  {}
              </CardText>
              <CardText>
                  {}
              </CardText>
              <CardText>
                  {}
              </CardText>
            </CardBody>
          </Card>
        </div>
    );
}

export default RcsbPdbIdInfo;

export const PdbIdSeqAndToUniprot: FC<SecondaryProps> = ({entryId, entityId}) => {
    
    const { data, error, loading, refetch } = useMapPdbToUniprotQuery(
        { variables: { entry_id: entryId, entity_id: entityId } },
    );

    useEffect(() => {
        refetch();
    }, [entryId, entityId]);

    if (loading) {
        return (
            <CardText>Loading … </CardText>
        )
    }

    if (error || !data) {
        return (
            <CardText>
              Failure in mapping and fetching sequence. {error && `Error message: ${error.message}`}
            </CardText>
        )
    }

    if (data.polymer_entity?.rcsb_polymer_entity_container_identifiers.uniprot_ids) {
        const uniprotIds = data.polymer_entity?.rcsb_polymer_entity_container_identifiers.uniprot_ids;

        return (
        <div className={`${SECONDARY_CLASS_NAME}-entry`}>
            {
              uniprotIds.map((uniprotId, ind) => (
                <RcsbUniprotInfo uniprotId={String(uniprotId)} 
                key={`${String(uniprotId)}_${ind}`}/>
              ))
            }
        </div>
        )
    }

    return (
      <div className={`${SECONDARY_CLASS_NAME}-entry`}>
      </div>)
}

const RcsbUniprotInfo: FC<TertiaryProps> = ({uniprotId}) => {
    
    return (
        <div className={`${TERTIARY_CLASS_NAME}-entry`}>
            
        </div>)
}