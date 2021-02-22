import React, { FC, useState, useEffect } from 'react'; 
import { useSelector } from 'react-redux';
import { GetPdbBasicQuery } from './GqlLib';
import { useMapPdbToUniprotQuery, useGetUniprotBasicQuery } from './GqlLib';
import { Card, CardHeader, CardTitle, CardBody, CardText, Button, Label, Input } from 'reactstrap';
import { AA_1_TO_3, SRV_URL_PREFIX, UNIPROT_VARIANT_API_PREFIX } from '../../shared/Consts';
import { aaClashPredGoodBad } from '../../shared/Funcs'
import axios from 'axios'; 
import './RcsbPdbGql.css';
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
type NaturalMutantFeature = {
  wildType: string;
  mutatedType: string;
  altSeq: string;
  location: string;
  somaticStatus: boolean;
  begin: number;
  end: number;
  evidences?: Array<{
    code: string;
    source: {
      name: string;
      id: string;
    }
  }>;
  desc: string; // "In strain: B.1.1.7, 501Y.V2; May enhance affinity to human ACE2 receptor." etc
}
type StudyMutantFeature = {
  wildType: string;
  mutatedType: string;
  altSeq: string; 
  somaticStatus: boolean;
  begin: number; 
  end: number;
  xrefs: Array<{
    name: string;
    id: string; // { "name": "ENA", "id": "MN908947.3:25367:A:G" } etc
  }>;
  genomicLoc: string; //"NC_045512.2:g.25367A>G" etc
  proteinLoc: string; //"p.Leu244Val" etc
  nucleoLoc: string; //"c.730T>G" etc
  seqId: string; //"ENSSAST00005000004" etc
  source: string; //'EnsemblViruses' etc
  codon: string; //'TTA/GTA' etc
  consequenceType: string; //'missense' etc

}
type MappedVariant = {
  mutantInfo: NaturalMutantFeature | StudyMutantFeature;
  mappedResidueInfo: PdbResidueToUniprot;
  clashType: 'good' | 'bad',
  variType: 'natural' | 'study'
}
type VariantMappingInfo = {
  errorMsg?: string;
  mappedVariants: MappedVariant[];
}

const RcsbPdbIdInfo: FC<RootProps> = ({pdbCode, rootQuery}) => {
    const { data, error, loading, refetch } = useMapPdbToUniprotQuery(
      { variables: { entry_id: pdbCode, entity_id: '1' } },
    );
    const predHistory = useSelector<AppReduxState, AaClashPredData[]>(state => 
      state.aaClashQuery.codePredResultHistory);
    const [residueMappingInfo, setResidueMappingInfo] = useState<VariantMappingInfo>({
      mappedVariants: []
    });
    useEffect(() => {
      mapPdbAaSub2UnipVariant();
    }, [pdbCode, predHistory]);
    useEffect(() => {}, [residueMappingInfo]);

    const aggregateAaListForPdbId = (): 
    { goodList: AaSubDetailed[], badList: AaSubDetailed[] } => {
      const processedPdbId = pdbCode.replace(/^\s+|\s+$/g, '').toUpperCase();
      let predPdbId = '';
      let allGoodAas = [] as AaSubDetailed[], allBadAas = [] as AaSubDetailed[];
      predHistory.map(pred => {
        let predPdbIdMatch = pred.queryId.match(/\w{4}(?=_\w+)/i);
        if (predPdbIdMatch) {
          predPdbId = predPdbIdMatch[0].replace(/^\s+|\s+$/g, '').toUpperCase(); 
        }
        if (processedPdbId === predPdbId) {
          const goodAas = aaClashPredGoodBad(pred).goodList;
          const badAas = aaClashPredGoodBad(pred).badList;
          allGoodAas = allGoodAas.concat(goodAas); 
          allBadAas = allBadAas.concat(badAas);
        }
      });
      return { 
        goodList: [ ...new Set(allGoodAas) ].sort((a, b) => a.chain > b.chain ? -1 : 1)
        .sort((a, b) => a.pos > b.pos ? 1 : -1), 
        badList: [ ...new Set(allBadAas) ].sort((a, b) => a.chain > b.chain ? -1 : 1)
        .sort((a, b) => a.pos > b.pos ? 1 : -1) 
      }
    }

    const fetchVariationData = (goodResidues: Array<PdbResidueToUniprot>, 
      badResidues: Array<PdbResidueToUniprot>): MappedVariant[] => {
        const variData = new Array<MappedVariant>();
        const goodUnipIdSet = [ ...new Set(goodResidues.map(el => el.uniId)) ];
        const badUnipIdSet = [ ...new Set(badResidues.map(el => el.uniId)) ];
        const allUnipIdSet = [ ... new Set(goodUnipIdSet.concat(badUnipIdSet)) ];
        allUnipIdSet.forEach(async (unipId) => {
          await axios.get(`${UNIPROT_VARIANT_API_PREFIX}/${unipId}`)
            .then(res => {
              if (res.statusText === 'OK' || res.status === 200) { return res }
              else {
                let nonOkError = new Error(
                  `Could not fetch data from url! Error${res.status}`
                );
                throw nonOkError;
              }
            })
            .then(res => {
              if ((res.data['features'] as Array<any>)?.length > 0) {
                const features = res.data['features'] as Array<any>;
                features?.length > 0 &&
                features.forEach(el => {
                  if (el['sourceType'] === 'uniprot') {
                    const mutantData: NaturalMutantFeature = {
                      wildType: el['wildType'],
                      mutatedType: el['mutatedType'],
                      begin: parseInt(el['begin']),
                      end: parseInt(el['end']),
                      altSeq: el['alternativeSequence'],
                      somaticStatus: el['somaticStatus'],
                      location: el['locations'][0]['loc'],
                      desc: el['descriptions'][0]['value'],
                      evidences: el['evidences']
                    }
                    goodResidues.forEach(resiData => {
                      resiData.uniId === unipId && 
                      parseInt(resiData.uniPos.toString()) == mutantData.begin &&
                      resiData.uniAa === mutantData.wildType &&
                      variData.push({
                        mutantInfo: mutantData,
                        mappedResidueInfo: resiData,
                        clashType: 'good',
                        variType: 'natural'
                      })
                    });
                    badResidues.forEach(resiData => {
                      resiData.uniId === unipId && 
                      parseInt(resiData.uniPos.toString()) == mutantData.begin &&
                      resiData.uniAa === mutantData.wildType &&
                      variData.push({
                        mutantInfo: mutantData,
                        mappedResidueInfo: resiData,
                        clashType: 'bad',
                        variType: 'natural'
                      })
                    })
                  }
                  else if (el['sourceType'] === 'large_scale_study') {
                    const mutantData: StudyMutantFeature = {
                      wildType: el['wildType'],
                      mutatedType: el['mutatedType'],
                      begin: el['begin'],
                      end: el['end'],
                      codon: el['codon'],
                      altSeq: el['alternativeSequence'],
                      somaticStatus: el['somaticStatus'],
                      xrefs: el['xrefs'],
                      seqId: el['locations'][0]['seqId'],
                      genomicLoc: el['genomicLocation'],
                      proteinLoc: el['locations'][0]['loc'],
                      nucleoLoc: el['locations'][1]['loc'],
                      source: el['locations'][0]['source'],
                      consequenceType: el['consequenceType']
                    }
                    goodResidues.forEach(resiData => {
                      resiData.uniId === unipId && 
                      parseInt(resiData.uniPos.toString()) == mutantData.begin &&
                      resiData.uniAa === mutantData.wildType &&
                      variData.push({
                        mutantInfo: mutantData,
                        mappedResidueInfo: resiData,
                        clashType: 'good',
                        variType: 'study'
                      })
                    });
                    badResidues.forEach(resiData => {
                      resiData.uniId === unipId && 
                      parseInt(resiData.uniPos.toString()) == mutantData.begin &&
                      resiData.uniAa === mutantData.wildType &&
                      variData.push({
                        mutantInfo: mutantData,
                        mappedResidueInfo: resiData,
                        clashType: 'bad',
                        variType: 'study'
                      })
                    })
                  }
                })
              }
            })
            .catch((err: Error) => { console.log(err.message) });
        });
        return variData;
    }

    const mapPdbAaSub2UnipVariant = () => {
      axios.get(`${SRV_URL_PREFIX}/pon-scp/pdb-to-unip/${pdbCode}`)
        .then(res => {
          if (res.statusText === 'OK' || res.status === 200) {
            if (Array.isArray(res.data)) {
              const mappedResiduesList = res.data as PdbResidueToUniprot[];
              const goodBadAaList = aggregateAaListForPdbId();
              const goodAaList = goodBadAaList.goodList;     
              const badAaList = goodBadAaList.badList;
              const goodMappedResidues = mappedResiduesList.filter(el => 
                goodAaList.some(goodEl => el.pdbChain === goodEl.chain 
                  && el.pdbAa === goodEl.oldAa
                  && el.pdbPos === goodEl.pos.toString())
              );
              const badMappedResidues = mappedResiduesList.filter(el => 
                badAaList.some(badEl => el.pdbChain === badEl.chain 
                  && el.pdbAa === badEl.oldAa
                  && el.pdbPos === badEl.pos.toString())
              );
              const variationData = fetchVariationData(goodMappedResidues, badMappedResidues);
              setTimeout(() => {               
                console.log(variationData);
                setResidueMappingInfo({
                mappedVariants: variationData
              })}, 100);
              setTimeout(() => console.log(residueMappingInfo), 100);
            }
            else {
              setResidueMappingInfo({
                mappedVariants: [], errorMsg: res.data as string
              })
            }
          } 
          else {
            let nonOkError = new Error(
              `Could not fetch data from API server! Error${res.status}`
            );
            throw nonOkError;
          }
        })
        .catch((err: Error) => {
          setResidueMappingInfo({
            mappedVariants: [], errorMsg: err.message
          })
        });
    }
    
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
    const KEYWORDS = rootQuery.entry.struct_keywords;
    const STRUCT = rootQuery.entry.struct;
    const PUBMED_ID = rootQuery.entry.rcsb_entry_container_identifiers.pubmed_id;
    const EMDB_IDS = rootQuery.entry.rcsb_entry_container_identifiers.related_emdb_ids;
    const POLYMER_ENTITIES = rootQuery.entry.polymer_entities;
    const HOST_ORGANISMS = data?.polymer_entity?.rcsb_entity_host_organism;
    const SOURCE_ORGANISMS = data?.polymer_entity?.rcsb_entity_source_organism;
    return (
      <Card>
        <CardHeader>
            <CardTitle tag='h5'>PDB-ID data of {pdbCode} from RCSB API</CardTitle>
        </CardHeader>
        <CardBody style={{ textAlign: 'left' }}>
          <CardText>
            <b>Found PDB-ID in RCSB:</b> {RCSB_PDB_ID}
          </CardText>
          { KEYWORDS && <CardText><b>Keywords:</b> {KEYWORDS.pdbx_keywords} ({KEYWORDS.text})</CardText> }
          { STRUCT && 
          <React.Fragment>
          <CardText><b>CASP-flag:</b> {STRUCT.pdbx_CASP_flag}</CardText>
          <CardText><b>Description:</b> {STRUCT.pdbx_descriptor}</CardText>
          <CardText><b>Title:</b> {STRUCT.title}</CardText>
          </React.Fragment>
          }
          { PUBMED_ID && (<CardText><b>PudMed ID:</b> {PUBMED_ID}</CardText>) }
          { EMDB_IDS && 
            EMDB_IDS.map((emdbId, ind) =>
              <CardText><b>Related EMDB ID({ind}):</b> {emdbId}</CardText>
            )
          }
          { Array.isArray(POLYMER_ENTITIES) && 
            POLYMER_ENTITIES.map((entity, ind) => 
            entity?.entity_poly?.rcsb_sample_sequence_length && 
            <CardText key={`seq_len_text_${ind}`}>
              <b>Sample sequence length of Polymer-entity {ind+1}:</b> {entity.entity_poly.rcsb_sample_sequence_length}
            </CardText>) 
          }
          <hr />
          { Array.isArray(SOURCE_ORGANISMS) &&
            SOURCE_ORGANISMS.map((org, ind) => 
              <React.Fragment key={`src_org_${pdbCode}_${ind}`}>
                <CardTitle tag='h6'><b>Source organism({ind+1})</b></CardTitle>
              { (org?.ncbi_scientific_name || org?.scientific_name) && 
                <CardText>Scientific name: {org.ncbi_scientific_name ? org.ncbi_scientific_name :
                org.scientific_name}</CardText>
              }
              { org?.ncbi_parent_scientific_name &&
                <CardText>Scientific name of parent: {org.ncbi_parent_scientific_name}</CardText>
              }
              { org?.ncbi_taxonomy_id && 
                <CardText>NCBI taxonomy ID: {org?.ncbi_taxonomy_id}</CardText>
              }
              { (org?.beg_seq_num && org?.end_seq_num) && 
                <CardText>Range of sequence: {org.beg_seq_num}-{org.end_seq_num}</CardText>
              }
              { org?.provenance_source && 
                <CardText>Provenance source: {org.provenance_source}</CardText>
              }
              { org?.source_type && 
                <CardText>Source type: {org.source_type}</CardText>
              }
              </React.Fragment>
            )
          }
          { Array.isArray(HOST_ORGANISMS) &&
            HOST_ORGANISMS.map((org, ind) => 
              <React.Fragment key={`host_org_${pdbCode}_${ind}`}> 
                <CardTitle tag='h6'><b>Host organism({ind+1})</b></CardTitle>
              { (org?.ncbi_scientific_name || org?.scientific_name) && 
                <CardText>Scientific name: {org.ncbi_scientific_name ? org.ncbi_scientific_name :
                org.scientific_name}</CardText> 
              }
              { org?.ncbi_parent_scientific_name &&
                <CardText>Scientific name of parent: {org.ncbi_parent_scientific_name}</CardText>
              }
              { org?.ncbi_taxonomy_id && 
                <CardText>NCBI taxonomy ID: {org?.ncbi_taxonomy_id}</CardText>
              }
              { (org?.beg_seq_num && org?.end_seq_num) && 
                <CardText>Range of sequence: {org.beg_seq_num}-{org.end_seq_num}</CardText>
              }
              { org?.provenance_source && 
                <CardText>Provenance source: {org.provenance_source}</CardText>
              }
              </React.Fragment>
            )
          }
          {
            residueMappingInfo.mappedVariants.length > 0 
            && residueMappingInfo.mappedVariants.forEach((variant, ind) => 
              <CardText key={`${pdbCode}_variant_${ind}`}>
                {JSON.stringify(variant)}
              </CardText>
            )
          }
          <a target="_blank" 
          href={`https://www.ebi.ac.uk/thornton-srv/databases/cgi-bin/pdbsum/GetPage.pl?pdbcode=${pdbCode}`}>
            Link for this PDB-ID at PDBsum</a> 
          <br />
          <a target="_blank" href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbCode}`}>
            Link for this PDB-ID at PDBe</a> 
          <br />
          <a target="_blank" href={`https://www.rcsb.org/structure/${pdbCode}`}>
            Link for this PDB-ID at RCSB PDB</a>
          <br />
          <a target="_blank" href={`https://www.ebi.ac.uk/pdbe/api/mappings/${pdbCode}`}>
            Link for this PDB-ID at API of SIFTS Mappings</a>
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
          { 
          data.polymer_entity.rcsb_polymer_entity &&
          <React.Fragment>
          <CardText>
          <b>Polymer's Number of Molecules:</b> {data.polymer_entity.rcsb_polymer_entity.pdbx_number_of_molecules}
          </CardText>
          <CardText>
          <b>Polymer's Description:</b> {data.polymer_entity.rcsb_polymer_entity.pdbx_description}
          </CardText>  
          <CardText>
          <b>Polymer's Mutations:</b> {data.polymer_entity.rcsb_polymer_entity.pdbx_mutation}
          </CardText> 
          </React.Fragment>
          }
          { data.polymer_entity?.entity_poly?.pdbx_seq_one_letter_code_can && (
            <div className='row' style={{ marginLeft: 0, textAlign: 'left' }}>
              <div className='col-12 col-xl-5'>
                <Label for={`${entryId}_${entityId}_pdb_aa_pos`}>See AA at pos</Label>
                <Input id={`${entryId}_${entityId}_pdb_aa_pos`} 
                onChange={e => setPdbIdSeqPos(parseInt(e.target.value)-1)}
                style={{width: '70px', height: '30px', marginLeft: 5, display: 'inline-block'}}></Input> 
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
          <CardText><b>RCSB's Mutation/Conflict Count for this entity:</b> {data.polymer_entity.entity_poly.rcsb_mutation_count}/{data.polymer_entity.entity_poly.rcsb_conflict_count}</CardText>
          <CardText><b>RCSB's Insertion/Deletion Count for this entity:</b> {data.polymer_entity.entity_poly.rcsb_insertion_count}/{data.polymer_entity.entity_poly.rcsb_deletion_count}</CardText>
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
            <div className='row' style={{ marginLeft: 0, textAlign: 'left' }}>
              <div className='col-12 col-xl-5'>
                <Label for={`${uniprotId}_uniprot_aa_pos`}>See AA at pos</Label>
                <Input id={`${uniprotId}_uniprot_aa_pos`} onChange={e => setUniprotSeqPos(parseInt(e.target.value)-1)}
                style={{width: '70px', height: '30px', marginLeft: 5, display: 'inline-block'}}></Input> 
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
            <a target="_blank" href={`${UNIPROT_VARIANT_API_PREFIX}/${uniprotId}`}>
                Variations of this Uniprot-accession</a> 
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