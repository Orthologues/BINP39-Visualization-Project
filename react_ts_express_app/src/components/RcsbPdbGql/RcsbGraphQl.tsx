import React, { FC, useState, useEffect } from 'react'; 
import { GetPdbBasicQuery } from '../../graphql';
import { useMapPdbToUniprotQuery, useGetUniprotBasicQuery } from '../../graphql';
import { Card, CardHeader, CardTitle, CardBody, CardText, Button, Label, Input } from 'reactstrap';
import { AA_1_TO_3 } from '../../shared/Consts';
import '../../css/RcsbPdbGql.css';
import { isInteger } from 'lodash';

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
                    <CardText>No valid PDB-ID for query {`'${pdbCode}'`} was found</CardText>
                </CardBody>
            </Card>
        )
    }
    if (! rootQuery.entry.rcsb_entry_container_identifiers.entity_ids) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle tag='h5'>PDB-ID Data from RCSB API</CardTitle>
                </CardHeader>
                <CardBody>
                    <CardText>No entity-ids for query {`'${pdbCode}'`} were found</CardText>
                </CardBody>
            </Card>
        )
    }

    const RCSB_PDB_ID = rootQuery.entry.rcsb_entry_container_identifiers.rcsb_id;
    const PUBMED_ID = rootQuery.entry.rcsb_entry_container_identifiers.pubmed_id;
    const CELL_INFO = rootQuery.entry.cell;
    const POLYMER_ENTITIES = rootQuery.entry.polymer_entities;
    return (
      <Card>
        <CardHeader>
            <CardTitle tag='h5'>PDB-ID data of {pdbCode} from RCSB API</CardTitle>
        </CardHeader>
        <CardBody style={{ textAlign: 'left' }}>
          <CardText>
            <b>Found PDB-ID in RCSB:</b> {RCSB_PDB_ID}
          </CardText>
          { PUBMED_ID && (<CardText><b>PudMed ID:</b> {PUBMED_ID}</CardText>) }
          { Array.isArray(POLYMER_ENTITIES) && 
            POLYMER_ENTITIES.map((entity, ind) => 
            entity?.entity_poly?.rcsb_sample_sequence_length && 
            <CardText key={`seq_len_text_${ind}`}>
              <b>Sample sequence length of Polymer-entity {ind+1}:</b> {entity.entity_poly.rcsb_sample_sequence_length}
            </CardText>) 
          }
          { CELL_INFO && (
            <React.Fragment>
              { CELL_INFO.Z_PDB && 
                <CardText>
                  <b>Number of the polymeric chains in a unit cell:</b> {CELL_INFO.Z_PDB}
                </CardText> }
              { CELL_INFO.angle_alpha && 
                <CardText>
                  <b>Unit-cell angle alpha of the reported structure in degrees:</b> {CELL_INFO.angle_alpha}
                </CardText> }
              { CELL_INFO.angle_beta && 
                <CardText>
                  <b>Unit-cell angle beta in degrees:</b> {CELL_INFO.angle_beta}
                </CardText> }
              { CELL_INFO.angle_gamma && 
                <CardText>
                  <b>Unit-cell angle gamma in degrees:</b> {CELL_INFO.angle_gamma}
                </CardText> }
              { CELL_INFO.length_a && 
                <CardText>
                  <b>Unit-cell length a corresponding to the structure reported in ångströms:</b> {CELL_INFO.length_a}
                </CardText> }
              { CELL_INFO.length_b && 
                <CardText>
                  <b>Unit-cell length b in å:</b> {CELL_INFO.length_b}
                </CardText> }
              { CELL_INFO.length_c && 
                <CardText>
                  <b>Unit-cell length c in å:</b> {CELL_INFO.length_c}
                </CardText> }
            </React.Fragment>
          ) }
          <a target="_blank" 
          href={`https://www.ebi.ac.uk/thornton-srv/databases/cgi-bin/pdbsum/GetPage.pl?pdbcode=${pdbCode}`}>
            Link for this PDB-ID at PDBsum</a> 
          <br />
          <a target="_blank" href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbCode}`}>
            Link for this PDB-ID at PDBe</a> 
          <br />
          <a target="_blank" href={`https://www.rcsb.org/structure/${pdbCode}`}>
            Link for this PDB-ID at RCSB PDB</a>
        </CardBody>
      </Card>
    );
}

export default RcsbPdbIdInfo;

export const PdbIdSeqAndToUniprot: FC<SecondaryProps> = ({entryId, entityId}) => {
    const [displayVarSeq, setDisplayVarSeq] = useState<boolean>(false);
    const [displayCanSeq, setDisplayCanSeq] = useState<boolean>(false);
    const [pdbIdSeqPos, setPdbIdSeqPos] = useState<number>(-1);
    const { data, error, loading, refetch } = useMapPdbToUniprotQuery(
        { variables: { entry_id: entryId, entity_id: entityId } },
    );

    useEffect(() => {
        refetch();
    }, [entryId, entityId]);
    if (error || !data) {
        return (
            <CardText>
              Failure in mapping and fetching sequence. {error && `Error message: ${error.message}`}
            </CardText>
        )
    }
    const displayUniprotInfo = () => {
        const uniprotIds = data.polymer_entity?.rcsb_polymer_entity_container_identifiers.uniprot_ids;
        return (
        <React.Fragment>
          <CardTitle tag='h5'>Mapped Uniprot-ID(s) from this PDB-ID</CardTitle>
        { uniprotIds?.map((uniprotId, ind) => (
            <RcsbUniprotInfo uniprotId={String(uniprotId)} 
            key={`${String(uniprotId)}_${ind}`}/>
          ))
        }
        </React.Fragment> )
    }
    if (!data.polymer_entity?.entity_poly?.pdbx_strand_id) return <div></div>
    return (
      <Card style={{marginBottom: 10}}>
        <CardHeader>
          <CardTitle tag='h5'>Info about Polymer-entity {entityId} of PDB-ID {entryId}</CardTitle>
        </CardHeader>
        <CardBody style={{ textAlign: 'left' }}>
          <CardText>
            <b>Polymer's PDBx Strand ID:</b> {data.polymer_entity?.entity_poly?.pdbx_strand_id}
          </CardText>
          { data.polymer_entity?.entity_poly?.pdbx_seq_one_letter_code_can && (
            <div className='row' style={{ marginLeft: '0.5rem', textAlign: 'left' }}>
              <div className='col-12 col-xl-5'>
                <Label for={`${entryId}_${entityId}_pdb_aa_pos`}>See AA at pos</Label>
                <Input id={`${entryId}_${entityId}_pdb_aa_pos`} 
                onChange={e => setPdbIdSeqPos(parseInt(e.target.value)-1)}
                style={{width: '75px', height: '30px', marginLeft: 5, display: 'inline-block'}}></Input> 
              </div>
              <div className='col-12 col-xl-3' style={{paddingLeft: 0}}>
                <p style={{marginTop: '3px'}}>
                  {isInteger(pdbIdSeqPos) && 
                   pdbIdSeqPos < data.polymer_entity.entity_poly.pdbx_seq_one_letter_code_can.length && pdbIdSeqPos >= 0 ?
                  (<b>{data.polymer_entity.entity_poly.pdbx_seq_one_letter_code_can.charAt(pdbIdSeqPos)}
                  ({AA_1_TO_3[data.polymer_entity.entity_poly.pdbx_seq_one_letter_code_can.charAt(pdbIdSeqPos)]})</b>
                  ) : (<b>Undefined!</b>)
                  }
                </p>
              </div>
              <div className='col-12 col-xl-4' style={{paddingLeft: 0, paddingTop: 3}}>
                <p style={{display: 'inline-block'}}>
                  Seq length: {data.polymer_entity.entity_poly.pdbx_seq_one_letter_code_can.length}
                </p>
              </div>
            </div> )
          }
          <Button className='btn btn-sm' color='link' style={{ margin: 0, marginBottom: 5, textAlign: 'left' }}
          onClick={() => setDisplayCanSeq(!displayCanSeq)}>
            {displayCanSeq? 'Hide' : 'Show'} canonical one-code PDBx sequence of this polymer-entity
          </Button>
          <div style={{ display: displayCanSeq ? 'inherit' : 'none' }}>
            <CardText>{data.polymer_entity?.entity_poly?.pdbx_seq_one_letter_code_can}</CardText>
          </div>
          <Button className='btn btn-sm' color='link' style={{ margin: 0, marginBottom: 5, textAlign: 'left' }}
          onClick={() => setDisplayVarSeq(!displayVarSeq)}>
            {displayVarSeq? 'Hide' : 'Show'} one-code PDBx sequence with non-standard AAs of this polymer-entity
          </Button>
          <div style={{ display: displayVarSeq ? 'inherit' : 'none' }}>
            <CardText>{data.polymer_entity?.entity_poly?.pdbx_seq_one_letter_code}</CardText>
          </div>
        </CardBody>
        {data.polymer_entity?.rcsb_polymer_entity_container_identifiers.uniprot_ids && displayUniprotInfo()}
      </Card>
    )
}


const RcsbUniprotInfo: FC<TertiaryProps> = ({uniprotId}) => {
    const [displaySeq, setDisplaySeq] = useState<boolean>(false);
    const [uniprotSeqPos, setUniprotSeqPos] = useState<number>(-1);
    const { data, error, loading, refetch } = useGetUniprotBasicQuery(
        { variables: { uniprot_id: uniprotId } },
    );

    useEffect(() => {
        refetch();
    }, [uniprotId]);
    return (
      <CardBody style={{ textAlign: 'left' }}>
        { data?.uniprot && (
            <React.Fragment>
            <CardTitle tag='h6'>{uniprotId} {data.uniprot.rcsb_uniprot_protein?.sequence && 
              <p style={{ display: 'inline-block', marginLeft: '1rem' }}>
              Sequence length: {data.uniprot.rcsb_uniprot_protein?.sequence.length}</p>}
            </CardTitle>
            <CardText><b>RCSB Uniprot-accession:</b> {data.uniprot.rcsb_uniprot_accession}</CardText>
            <CardText><b>RCSB Uniprot-entry name:</b> {data.uniprot.rcsb_uniprot_entry_name}</CardText>
            { data.uniprot.rcsb_uniprot_protein?.sequence && (
            <div className='row' style={{ marginLeft: '0.5rem', textAlign: 'left' }}>
              <div className='col-12 col-xl-5'>
                <Label for={`${uniprotId}_uniprot_aa_pos`}>See AA at pos</Label>
                <Input id={`${uniprotId}_uniprot_aa_pos`} onChange={e => setUniprotSeqPos(parseInt(e.target.value)-1)}
                style={{width: '75px', height: '30px', marginLeft: 5, display: 'inline-block'}}></Input> 
              </div>
              <div className='col-12 col-xl-7' style={{paddingLeft: 0}}>
                <p style={{marginTop: '3px'}}>
                  {isInteger(uniprotSeqPos) && 
                   uniprotSeqPos < data.uniprot.rcsb_uniprot_protein.sequence.length && uniprotSeqPos >= 0 ?
                  (<b>{data.uniprot.rcsb_uniprot_protein.sequence.charAt(uniprotSeqPos)}
                  ({AA_1_TO_3[data.uniprot.rcsb_uniprot_protein.sequence.charAt(uniprotSeqPos)]})</b>
                  ) : (<b>Undefined!</b>)
                  }
                </p>
              </div>
            </div> )
          }
            <Button className='btn btn-sm' color='link' 
            style={{ margin: 0, marginBottom: 8, textAlign: 'left' }}
            onClick={() => setDisplaySeq(!displaySeq)}>
              {displaySeq? 'Hide' : 'Show'} sequence of Uniprot-protein
            </Button>
            <div style={{ display: displaySeq ? 'inherit' : 'none' }}>
              <CardText>{data.uniprot.rcsb_uniprot_protein?.sequence}</CardText>
            </div>
            <br/>
            <a target="_blank" href={`https://www.uniprot.org/uniprot/${uniprotId}`}>
                Link for this Uniprot-accession at Uniprot</a> 
            <br />
            <a target="_blank" href={`https://www.ebi.ac.uk/pdbe/pdbe-kb/proteins/${uniprotId}`}>
                Link for this Uniprot-accession at PDBe</a> 
            <br />
            <a target="_blank" href={`https://huma.rubi.ru.ac.za/#proteins/fetch/${uniprotId}`}>
                Link for this Uniprot-accession at HUMA (only for human-related proteins)</a>
            <br />
            <a target="_blank" href={`https://www.ebi.ac.uk/thornton-srv/databases/cgi-bin/VarSite/GetPage.pl?uniprot_acc=${uniprotId}&template=protein.html`}>
                Link for this Uniprot-accession at VarSite (only for human-related proteins)</a>
            </React.Fragment>
        ) }
      </CardBody> 
    )       
}