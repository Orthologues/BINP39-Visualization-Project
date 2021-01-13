import React, { FC } from 'react'; 
import { GetPdbBasicQuery, MapPdbToUniprotQuery, GetUniprotBasicQuery } from '../../graphql';
import { useMapPdbToUniprotQuery, useGetUniprotBasicQuery } from '../../graphql';
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap';
import '../../css/RcsbPdbGql.css';

interface RootProps {
    rootQuery: GetPdbBasicQuery,
}

interface SecondaryProps {
    secondaryQuery: MapPdbToUniprotQuery,
    secondaryInput: { entryId: string, entityId: string }
}

interface TertiaryProps {
    tertiaryQuery: GetUniprotBasicQuery,
    tertiaryInput: { uniprotId: string }
}

const ROOT_CLASS_NAME = 'root-query';
const SECONDARY_CLASS_NAME = 'secondary-query';
const TERTIARY_CLASS_NAME = 'tertiary-query';

const RcsbPdbIdInfo: FC<RootProps> = ({rootQuery}) => {

    if ( !rootQuery.entry || !rootQuery.entry.rcsb_entry_container_identifiers.rcsb_id ) {
        return (
            <div key={`${ROOT_CLASS_NAME}_no_entry`} 
            className={`${ROOT_CLASS_NAME}-no-entry`}>
                <Card>
                    <CardHeader>
                        <CardTitle>RCSB API</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <CardText>No PDB-ID query available</CardText>
                    </CardBody>
                </Card>
            </div>
        )
    }

    if (! rootQuery.entry.rcsb_entry_container_identifiers.entity_ids) {
        return (
            <div key={`${ROOT_CLASS_NAME}_no_entry`} 
            className={`${ROOT_CLASS_NAME}-no-entry`}>
                <Card>
                    <CardHeader>
                        <CardTitle>RCSB API</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <CardText>No entity-ids of PDB-ID query were found</CardText>
                    </CardBody>
                </Card>
            </div>
        )
    }

    const RCSB_PDB_ID = rootQuery.entry.rcsb_entry_container_identifiers.rcsb_id;
    return (
        <div key={`${ROOT_CLASS_NAME}_entry_${RCSB_PDB_ID}`}
        className={`${ROOT_CLASS_NAME}-entry`}>
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

const RcsbUniprotInfo: FC<TertiaryProps> = ({tertiaryQuery, tertiaryInput}) => {
    
    if (tertiaryQuery.uniprot) {
        <div key={`${TERTIARY_CLASS_NAME}_${tertiaryInput.uniprotId}`}
        className={`${TERTIARY_CLASS_NAME}-entry`}>
            
        </div>
    }

    return (
        <div></div>
    )
}

export const PdbIdSeqAndToUniprot: FC<SecondaryProps> = ({secondaryQuery, secondaryInput}) => {
    
    if (secondaryQuery.polymer_entity) {
        <div key={`${SECONDARY_CLASS_NAME}_${secondaryInput.entryId}_${secondaryInput.entityId}`}
        className={`${SECONDARY_CLASS_NAME}-entry`}>
            
        </div>
    }

    return (
        <div></div>
    )
}

export default RcsbPdbIdInfo;