import React, { FC, useState, useEffect } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { CardText, CardTitle, Button, ButtonGroup } from 'reactstrap';
import { deleteCodeQuery, deleteFileQuery, eraseFileQueryHistory } from '../redux/ActionCreators';
import { formattedAaClashPred, parseAaSubDetailedToStr, aaClashPredGoodBad } from '../shared/Funcs';
import { SRV_URL_PREFIX, UNIPROT_VARIANT_API_PREFIX } from '../shared/Consts';

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
type AaClashResultState = {
  displayMode: 'latest'|'history',
  queryToShowPred: PdbIdAaQuery|PdbFileQueryStore|undefined,
  residueMappingInfo: VariantMappingInfo,
  showVariantInfo: boolean
}


const DisplayMutantInfo: FC<{variants: MappedVariant[]}> = ({variants}) => {
  return (
    <React.Fragment>
    {
      [ ...new Set(variants.map(variants => variants.mutantInfo)) ]
      .map((mutant, ind) => 
      Object.keys(mutant).some(key => key === 'desc') 
      //natural variant
      ? <CardText key={`${JSON.stringify(mutant)}_${ind}}}`} 
      style={{ fontSize: 15, margin: 0, marginBottom: 8 }}>
          <p style={{margin: 0}}>
            <b>Positions at PDB-id/UniProt-accession:</b>
          {
          variants.filter(variant => 
            JSON.stringify(variant.mutantInfo) ===  JSON.stringify(mutant)).map(variant => 
            variant.mappedResidueInfo).map(el => 
            <p style={{margin: 0}}
            >{el.pdbId}-Chain {el.pdbChain}: {el.pdbAa}{el.pdbPos} / {el.uniId}: {el.uniAa}{el.uniPos}</p>
          )}
          </p>
          <p style={{margin: 0}}>
            <b>Description:</b> {(mutant as NaturalMutantFeature).desc}<br />
            <b>Location:</b> {(mutant as NaturalMutantFeature).location}, 
            {(mutant as NaturalMutantFeature).somaticStatus ? ' Somatic' : ' Non-somatic'}
          </p>
          {
          (mutant as NaturalMutantFeature).evidences &&
          (mutant as NaturalMutantFeature).evidences?.map((evi, ind) =>
            <p style={{margin: 0}}>
              <b>Evidence{ind}:</b> {evi.code}, <b>Source: </b>{evi.source.name} {evi.source.id}
            </p>
          )
          }
        </CardText>
      //study variant
      : <CardText key={`${JSON.stringify(mutant)}_${ind}}}`} 
      style={{ fontSize: 15, margin: 0, marginBottom: 8 }}>  
          <p style={{margin: 0}}>
            <b>Positions at PDB-id/UniProt-accession:</b>
          {
          variants.filter(variant => 
            JSON.stringify(variant.mutantInfo) ===  JSON.stringify(mutant)).map(variant => 
            variant.mappedResidueInfo).map(el => 
            <p style={{ margin: 0 }}
            >{el.pdbId}-Chain {el.pdbChain}: {el.pdbAa}{el.pdbPos} / {el.uniId}: {el.uniAa}{el.uniPos}</p>
          )}
          </p>
          <p style={{margin: 0}}>
            <b>SeqId: </b>{(mutant as StudyMutantFeature).seqId}, 
            {(mutant as StudyMutantFeature).somaticStatus? ' Somatic' : ' Non-somatic'}<br />
            <b>Consequence: </b>{(mutant as StudyMutantFeature).consequenceType},
            <b> Source: </b>{(mutant as StudyMutantFeature).source}<br />
            <b>Genomic location: </b>{(mutant as StudyMutantFeature).genomicLoc}<br />
            <b>Nucleotide location: </b>{(mutant as StudyMutantFeature).nucleoLoc}<br />
            <b>Protein location: </b>{(mutant as StudyMutantFeature).proteinLoc}<br />
            <b>Codon: </b> {(mutant as StudyMutantFeature).codon}<br />
            {
            (mutant as StudyMutantFeature).xrefs.forEach((xref, ind) =>
              <p key={`${(mutant as StudyMutantFeature).genomicLoc}_xref${ind}`} style={{margin: 0}}>
                <b>Xref{ind}: </b>{xref.id} {xref.name}
              </p>
            )}
          </p>
        </CardText>
      )
    }
    </React.Fragment>
  )
}

const AaClashResult: FC<any> = () => {
  const appState = useSelector<AppReduxState, AppReduxState>((state) => state);
  const queryMode = useSelector<AppReduxState, 'PDB-CODE' | 'FILE'>(
    (state) => state.aaClashQuery.queryMode
  );
  const dispatch = useDispatch<Dispatch<PayloadAction>>();
  const latestCodeQueries = useSelector<AppReduxState, PdbIdAaQuery[]>(state => 
    state.aaClashQuery.queries);
  const latestFileQuery = useSelector<AppReduxState, PdbFileQueryStore|null>(state => 
    state.aaClashQuery.fileQuery);
  const latestCodePred = useSelector<AppReduxState, AaClashPredData[]>(state => 
    state.aaClashQuery.codePredResults);
  // const latestFilePred = useSelector<AppReduxState, AaClashPredData|null>(state => 
  //   state.aaClashQuery.filePredResult);
  const codeQueryHistory = useSelector<AppReduxState, PdbIdAaQuery[]>(state => 
    state.aaClashQuery.queryHistory);
  const fileQueryHistory = useSelector<AppReduxState, PdbFileQueryStore[]>(state => 
    state.aaClashQuery.fileQueryHistory);
  const codePredHistory = useSelector<AppReduxState, AaClashPredData[]>(state => 
    state.aaClashQuery.codePredResultHistory);
  const filePredHistory = useSelector<AppReduxState, AaClashPredData[]>(state => 
    state.aaClashQuery.filePredResultHistory);
  const [compState, setCompState] = useState<AaClashResultState>({
    displayMode: 'latest',
    queryToShowPred: undefined,
    residueMappingInfo: { mappedVariants: [] },
    showVariantInfo: false
  });
  const queryToShowPred = compState.queryToShowPred;
  const residueMappingInfo = compState.residueMappingInfo;
  const displayMode = compState.displayMode;
  const showVariantInfo = compState.showVariantInfo;
  const setDisplayMode = (mode: 'latest'|'history') => {
    setCompState(prev => ({ ...prev, displayMode: mode}))
  }
  const setQueryToShowPred = async (query: PdbIdAaQuery|PdbFileQueryStore|undefined) => {
    if (query && Object.keys(query).some(key => key === 'pdbId')) { //code-query
      const variantsOrErrmsg = await mapPdbAaSub2UnipVariant((query as PdbIdAaQuery).pdbId, query.queryId);
      setCompState((prev) => {
        if (Array.isArray(variantsOrErrmsg)) { //variants
          return { ...prev, 
            showVariantInfo: false,
            queryToShowPred: query as PdbIdAaQuery, 
            residueMappingInfo: {mappedVariants: variantsOrErrmsg} }
        }
        else { //errMsg
          return { ...prev, 
            showVariantInfo: false,
            queryToShowPred: query as PdbIdAaQuery, 
            residueMappingInfo: {mappedVariants: [], errorMsg: variantsOrErrmsg} }
        }
      })
    }
    else { //File-query or undefined
      setCompState((prev) => ({ 
        ...prev, 
        showVariantInfo: false,
        queryToShowPred: query as PdbFileQueryStore|undefined, 
        residueMappingInfo: {mappedVariants: []}
      }))
    }
  }
  
  const switchIfShowVariants = () => {
    setCompState( prev => ({ ...prev, showVariantInfo: !showVariantInfo }))
  }
  useEffect(() => {
    queryMode === 'PDB-CODE' 
      ? latestCodeQueries.length > 0 
        && setTimeout(async () => await setQueryToShowPred(latestCodeQueries[0]), 10) 
      : latestFileQuery 
        && setTimeout(async () => await setQueryToShowPred(latestFileQuery), 10)
  }, []); //initial rendering

   // mapping from PDB-id AA-sub to Uniprot-id Variants
  const mapPdbAaSub2UnipVariant = (pdbCode: string, queryId: string) => {
    let rVal = 
    axios.get(`${SRV_URL_PREFIX}/pon-scp/pdb-to-unip/${pdbCode}`)
      .then(res => {
        if (res.statusText === 'OK' || res.status === 200) {
          if (Array.isArray(res.data)) {
            const mappedResiduesList = res.data as PdbResidueToUniprot[];
            const goodBadAaList = aggregateAaListForQueryId(queryId);
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
            return variationData
          }
          else { return res.data as string }
        } 
        else {
          let nonOkError = new Error(
            `Could not fetch data from API server! Error${res.status}`
          );
          throw nonOkError;
        }
      })
      .catch((err: Error) => { return err.message });
    return rVal;
  }
  const aggregateAaListForQueryId = (queryId: string): 
  { goodList: AaSubDetailed[], badList: AaSubDetailed[] } => {
    let allGoodAas = [] as AaSubDetailed[], allBadAas = [] as AaSubDetailed[];
    if (displayMode === 'latest') { var preds = latestCodePred }
    else { var preds = codePredHistory }
    preds.forEach(pred => {
      if (pred.queryId === queryId) {
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
    allUnipIdSet.forEach( async(unipId) => {
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

  
  // .pdb file download for a specific aa-sub of a aa-clash query by jobId
  const mapJobIdAaSub2Pdb = (jobId: string, aaSub: AaSubDetailed) => {
    axios.post(`${SRV_URL_PREFIX}/pon-scp/pdb/${jobId}`, JSON.stringify({
      aaSub: aaSub
    }),
    { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' })
      .then(res => {
        if (res.statusText === 'OK' || res.status === 200) {
          const AA_SUB_NAME = `${aaSub.chain}_${aaSub.oldAa}${aaSub.pos}${aaSub.newAa}`;
          fileDownload(res.data as Blob, `${jobId}-${AA_SUB_NAME}.pdb`)
        } 
        else {
          let nonOkError = new Error(
            `Could not fetch .pdb file from API server! Error${res.status}`
          );
          throw nonOkError;
        }
      })
      .catch((err: Error) => {
        alert(err.message)
      });
  }


  // scrolling query list, displayMode: 'latest'|'history', queryMode: 'FILE'|'CODE'
  const QueryList = (): JSX.Element => (
    <div className='pdb-query-list' 
    style={{ minHeight: 480, maxHeight: 480, textAlign: 'center', color: 'black', 
    minWidth: 200, maxWidth: 200, padding: 0 }}>        
      <CardTitle tag="h5" style={{ marginTop: 8 }}
      >Which AA-clash predictions to display</CardTitle>
      <ButtonGroup>
        <Button className='btn-sm'
        color="info" onClick={ () => setDisplayMode('latest') }
        active={displayMode === 'latest'}>Latest query</Button>
        <Button className='btn-sm'
        color="info" onClick={ () => setDisplayMode('history') }
        active={displayMode === 'history'}>Query history</Button>
      </ButtonGroup>
      <CardTitle tag="h6" style={{ marginTop: 10 }}>AA-Clash Code queries</CardTitle>
      <ol className='pdb-query-ol'>
      { 
      displayMode === 'latest' ?
        latestCodeQueries.map((query, ind) =>  
          <li key={`${query.pdbId}_${ind}`} onClick={async () => await setQueryToShowPred(query)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(query) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{query.pdbId}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={async (e) => { 
              e.stopPropagation();
              dispatch(deleteCodeQuery(query)) && await setQueryToShowPred(undefined)
            } }></i>
          </li> 
        ) : 
        codeQueryHistory.map((query, ind) => 
          <li key={`${query.pdbId}_${ind}`} onClick={async () => await setQueryToShowPred(query)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(query) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{query.pdbId}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={async (e) => { 
              e.stopPropagation();
              dispatch(deleteCodeQuery(query)) && await setQueryToShowPred(undefined)
            } }></i>
          </li>
        ) 
      }
      <CardTitle tag="h6" style={{ color: '#663399', marginTop: 10 }}>AA-clash File queries</CardTitle>
        <ol className='pdb-query-ol'>
      {
      displayMode === 'latest' ?
        latestFileQuery &&
          <li onClick={ async () => await setQueryToShowPred(latestFileQuery)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(latestFileQuery) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{latestFileQuery.fileName}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ async (e) => { 
              e.stopPropagation();
              fileQueryHistory.length === 1 
                ? dispatch(eraseFileQueryHistory()) && await setQueryToShowPred(undefined)
                : dispatch(deleteFileQuery(latestFileQuery)) && await setQueryToShowPred(undefined)    
            } }></i>
          </li>
        :
        fileQueryHistory.map((query, ind) => 
          <li key={`${query.fileName}_${ind}`} onClick={ async () => await setQueryToShowPred(query)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(query) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{query.fileName}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ async (e) => { 
              e.stopPropagation();
              fileQueryHistory.length === 1 
                ? dispatch(eraseFileQueryHistory()) && await setQueryToShowPred(undefined)
                : dispatch(deleteFileQuery(query)) && await setQueryToShowPred(undefined)              
            } }></i>
          </li>
        )
      }
        </ol>
      </ol>
    </div> )


  // conditional JSX rendering
  if (Array.isArray(appState.aaClashQuery.errMsg)) {
    return (
      <div className="col-12">
        {appState.aaClashQuery.errMsg.map((errmsg, index) => {
          return (
            <CardText
              key={`pyErrMsg${index}`}
              style={{ color: 'red', margin: '5px auto', fontSize: '18px' }}
            >
              {errmsg}
            </CardText>
          );
        })}
      </div>
    );
  } 
  else if (appState.aaClashQuery.errMsg) {
    return (
      <div
        className="col-10 offset-1"
        style={{ color: 'red', margin: '0.5rem auto', fontSize: '18px' }}
      >
        <CardText>{appState.aaClashQuery.errMsg}</CardText>
      </div>
    );
  } 
  else if (queryToShowPred && codePredHistory.length > 0 
    && Object.keys(queryToShowPred).some(key => key === 'pdbId')) {
    return (
      <div className="AaClash-result">
        <QueryList />
      {queryToShowPred &&
        <div className="container-fluid">
          <div className='row'>
            <div className="col-6" 
            style={{ paddingLeft: 16, 
              overflow: 'hidden scroll', paddingTop: 8, minHeight: 480, maxHeight: 480 }}>
              <CardTitle tag="h5" style={{margin: 0}}>
                {(queryToShowPred as PdbIdAaQuery).pdbId}'s good AA-Substitutions without steric clash:
              </CardTitle>
              <Button className='btn btn-sm' color='link' 
                style={{ margin: 3, color: 'white'}}
                onClick={switchIfShowVariants}>
                  {showVariantInfo ? 'Hide' : 'Show'} PDB to UniProt Variant Mapping
                </Button>
              {
              showVariantInfo && residueMappingInfo.mappedVariants.some(mutant => 
                mutant.clashType === 'good')
                ? <DisplayMutantInfo variants={residueMappingInfo.mappedVariants} />
                : showVariantInfo && <p style={{fontSize: 15}}>No variants are mapped</p>
              }
              {formattedAaClashPred(
                codePredHistory.filter(pred => pred.queryId === queryToShowPred.queryId)[0]
              ).goodList.map((item) => (
                <CardText key={`good_aa_clash_${parseAaSubDetailedToStr(item)}`}
                  style={{ color: '#90ee90', margin: 0 }}>{parseAaSubDetailedToStr(item)}
                  <Button className='btn btn-sm' color='link' 
                    style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                    onClick={() => {
                      const jobName = codePredHistory.filter(pred => 
                        pred.queryId === queryToShowPred.queryId)[0].jobName;
                      jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 10)
                    }}>Download .pdb file
                  </Button>
                </CardText>
              ))}
            </div>
            <div className="col-6" 
            style={{ paddingLeft: 16, 
              overflow: 'hidden scroll', paddingTop: 8, minHeight: 480, maxHeight: 480 }}>
              <CardTitle tag="h5" style={{margin: 0}}>
                {(queryToShowPred as PdbIdAaQuery).pdbId}'s bad AA-Substitutions with steric clash:
              </CardTitle>
              <Button className='btn btn-sm' color='link' 
                style={{ margin: 3, color: 'white'}}
                onClick={switchIfShowVariants}>
                  {showVariantInfo ? 'Hide' : 'Show'} PDB to UniProt Variant Mapping
              </Button>
              {
              showVariantInfo && residueMappingInfo.mappedVariants.some(mutant => 
                mutant.clashType === 'bad')
                ? <DisplayMutantInfo variants={residueMappingInfo.mappedVariants} />
                : showVariantInfo && <p style={{fontSize: 15}}>No variants are mapped</p>
              }
              {formattedAaClashPred(
                codePredHistory.filter(pred => pred.queryId === queryToShowPred.queryId)[0]
              ).badList.map((item) => (
                  <CardText key={`bad_aa_clash_${parseAaSubDetailedToStr(item)}`}
                  style={{ color: '#ff4500', margin: 0 }}>
                    {parseAaSubDetailedToStr(item)}
                    <Button className='btn btn-sm' color='link' 
                      style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                      onClick={() => {
                        const jobName = codePredHistory.filter(pred => 
                          pred.queryId === queryToShowPred.queryId)[0].jobName;
                        jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 10)
                    }}>Download .pdb file
                    </Button>
                  </CardText>
              ))} 
            </div>
          </div>
        </div>
      }
      </div>
    );
  } 
  else if (queryToShowPred && filePredHistory.length > 0
    && Object.keys(queryToShowPred).some(key => key === 'fileName')) {
    return (
    <div className="AaClash-result">
      <QueryList />
      <div className="container-fluid">
        <div className='row'>
          <div className="col-6" 
          style={{ paddingLeft: 16, 
              overflow: 'hidden scroll', paddingTop: 8, minHeight: 480, maxHeight: 480 }}>
            <CardTitle tag="h5">
              {(queryToShowPred as PdbFileQueryStore).fileName}'s good AA-Substitutions without steric clash:
            </CardTitle>
            {formattedAaClashPred(
              filePredHistory.filter(pred => queryToShowPred.queryId === pred.queryId)[0]
              ).goodList.map((item) => (
              <CardText key={`file_good_aa_clash_${parseAaSubDetailedToStr(item)}`}
              style={{ color: '#90ee90', margin: 0 }}>{parseAaSubDetailedToStr(item)}
                <Button className='btn btn-sm' color='link' 
                  style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                  onClick={() => {
                    const jobName = filePredHistory.filter(pred => 
                      (queryToShowPred as PdbFileQueryStore).queryId === pred.queryId)[0].jobName;
                    jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 10)
                  }}>Download .pdb file
                </Button>
              </CardText>
            ))}
          </div>
          <div className="col-6" 
          style={{ paddingLeft: 16, 
            overflow: 'hidden scroll', paddingTop: 8, minHeight: 480, maxHeight: 480 }}>
            <CardTitle tag="h5">
              {(queryToShowPred as PdbFileQueryStore).fileName}'s bad AA-Substitutions with steric clash:
            </CardTitle>
            {formattedAaClashPred(
              filePredHistory.filter(pred => queryToShowPred.queryId === pred.queryId)[0]
              ).badList.map((item) => (
              <CardText key={`file_bad_aa_clash_${parseAaSubDetailedToStr(item)}`}
              style={{ color: '#ff4500', margin: 0 }}>{parseAaSubDetailedToStr(item)}
                <Button className='btn btn-sm' color='link' 
                  style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                  onClick={() => {
                    const jobName = filePredHistory.filter(pred => 
                      (queryToShowPred as PdbFileQueryStore).queryId === pred.queryId)[0].jobName;
                    jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 10)
                  }}>Download .pdb file
                </Button>
              </CardText>
            ))}
          </div>
        </div>
      </div>
    </div>
    ) }
  return <div></div>;
};

export default AaClashResult;
