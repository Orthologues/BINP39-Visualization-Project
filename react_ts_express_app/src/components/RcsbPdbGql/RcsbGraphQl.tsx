import React, { FC, useEffect } from 'react'; 
import { GetPdbBasicQuery, MapPdbToUniprotQuery, GetUniprotBasicQuery } from '../../graphql';
import { useMapPdbToUniprotQuery, useGetUniprotBasicQuery } from '../../graphql';
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap';
import '../../css/RcsbPdbGql.css';

type RootProps = {
    pdbCode: string,
    rootQuery: GetPdbBasicQuery,
}

type SecondaryProps = {
    entryId: string, entityId: string 
}

type TertiaryProps = {
    uniprotId: string 
}

const RcsbPdbIdInfo: FC<RootProps> = ({pdbCode, rootQuery}) => {
    if ( !rootQuery.entry || !rootQuery.entry.rcsb_entry_container_identifiers.rcsb_id ) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle tag='h5'>PDB-ID data from RCSB API</CardTitle>
                </CardHeader>
                <CardBody>
                    <CardText>No valid PDB-ID for query {`'${pdbCode}'`} were found</CardText>
                </CardBody>
            </Card>
        )
    }

    if (! rootQuery.entry.rcsb_entry_container_identifiers.entity_ids) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle tag='h5'>PDB-ID data from RCSB API</CardTitle>
                </CardHeader>
                <CardBody>
                    <CardText>No entity-ids for query {`'${pdbCode}'`} were found</CardText>
                </CardBody>
            </Card>
        )
    }

    const RCSB_PDB_ID = rootQuery.entry.rcsb_entry_container_identifiers.rcsb_id;
    const PUBMED_ID = rootQuery.entry.rcsb_entry_container_identifiers.pubmed_id;
    return (
        <Card>
          <CardHeader>
              <CardTitle tag='h5'>PDB-ID data from RCSB API</CardTitle>
          </CardHeader>
          <CardBody>
            <CardText>
                Found PDB-ID in RCSB: <b>{RCSB_PDB_ID}</b>
            </CardText>
            { PUBMED_ID && (<CardText>PudMed ID: <b>{PUBMED_ID}</b></CardText>)}
            <CardText>
                {}
            </CardText>
          </CardBody>
        </Card>
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
        <Card>
            <CardHeader>
                <CardTitle tag='h5'>Mapped Uniprot-ID(s) from this PDB-ID</CardTitle>
            </CardHeader>
          {
            uniprotIds.map((uniprotId, ind) => (
              <RcsbUniprotInfo uniprotId={String(uniprotId)} 
              key={`${String(uniprotId)}_${ind}`}/>
            ))
          }
        </Card> )
    }

    return (<div></div>)
}

const RcsbUniprotInfo: FC<TertiaryProps> = ({uniprotId}) => {
    if (uniprotId) {
        return (
            <CardBody>
              <CardText>Mapped Uniprot-ID: <b>{uniprotId}</b></CardText>
            </CardBody> 
        )
    }       
    return (<div></div>)
}