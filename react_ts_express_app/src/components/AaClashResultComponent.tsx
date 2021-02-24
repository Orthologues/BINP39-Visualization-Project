import React, { FC, useState, useEffect } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { CardText, CardTitle, Button, ButtonGroup } from 'reactstrap';
import { deleteCodeQuery, deleteFileQuery } from '../redux/ActionCreators';
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
  const latestFilePred = useSelector<AppReduxState, AaClashPredData|null>(state => 
    state.aaClashQuery.filePredResult);
  const codeQueryHistory = useSelector<AppReduxState, PdbIdAaQuery[]>(state => 
    state.aaClashQuery.queryHistory);
  const fileQueryHistory = useSelector<AppReduxState, PdbFileQueryStore[]>(state => 
    state.aaClashQuery.fileQueryHistory);
  const codePredHistory = useSelector<AppReduxState, AaClashPredData[]>(state => 
    state.aaClashQuery.codePredResultHistory);
  const filePredHistory = useSelector<AppReduxState, AaClashPredData[]>(state => 
    state.aaClashQuery.filePredResultHistory);
  const [displayMode, setDisplayMode] = useState<'latest'|'history'>('latest');
  const [queryToShowPred, setQueryToShowPred] = useState<PdbIdAaQuery|PdbFileQueryStore|undefined>();
  const [residueMappingInfo, setResidueMappingInfo] = useState<VariantMappingInfo>({
    mappedVariants: []
  });
  useEffect(() => {
    queryMode === "PDB-CODE" && !queryToShowPred
      ? latestCodeQueries.length > 0 && setQueryToShowPred(latestCodeQueries[0])
      : latestFileQuery && setQueryToShowPred(latestFileQuery);
    queryToShowPred && Object.keys(queryToShowPred).some(key => key === 'pdbId') 
      && mapPdbAaSub2UnipVariant((queryToShowPred as PdbIdAaQuery).pdbId);
  }, [residueMappingInfo, latestCodePred, latestFilePred, queryToShowPred]);


   // mapping from PDB-id AA-sub to Uniprot-id Variants
   const mapPdbAaSub2UnipVariant = (pdbCode: string) => {
    axios.get(`${SRV_URL_PREFIX}/pon-scp/pdb-to-unip/${pdbCode}`)
      .then(res => {
        if (res.statusText === 'OK' || res.status === 200) {
          if (Array.isArray(res.data)) {
            const mappedResiduesList = res.data as PdbResidueToUniprot[];
            const goodBadAaList = aggregateAaListForPdbId(pdbCode);
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
  const aggregateAaListForPdbId = (pdbCode: string): 
  { goodList: AaSubDetailed[], badList: AaSubDetailed[] } => {
    const processedPdbId = pdbCode.replace(/^\s+|\s+$/g, '').toUpperCase();
    let predPdbId = '';
    let allGoodAas = [] as AaSubDetailed[], allBadAas = [] as AaSubDetailed[];
    if (displayMode === 'latest') { var preds = latestCodePred }
    else { var preds = codePredHistory }
    preds.map(pred => {
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
          <li key={`${query.pdbId}_${ind}`} onClick={() => setQueryToShowPred(query)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(query) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{query.pdbId}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => { 
              e.stopPropagation();
              dispatch(deleteCodeQuery(query)) && setQueryToShowPred(undefined)
            } }></i>
          </li> 
        ) : 
        codeQueryHistory.map((query, ind) => 
          <li key={`${query.pdbId}_${ind}`} onClick={() => setQueryToShowPred(query)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(query) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{query.pdbId}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => { 
              e.stopPropagation();
              dispatch(deleteCodeQuery(query)) && setQueryToShowPred(undefined)
            } }></i>
          </li>
        ) 
      }
      <CardTitle tag="h6" style={{ color: '#663399', marginTop: 10 }}>AA-clash File queries</CardTitle>
        <ol className='pdb-query-ol'>
      {
      displayMode === 'latest' ?
        latestFileQuery &&
          <li onClick={() => setQueryToShowPred(latestFileQuery)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(latestFileQuery) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{latestFileQuery.fileName}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => { 
              e.stopPropagation();
              dispatch(deleteFileQuery(latestFileQuery)) && setQueryToShowPred(undefined)
            } }></i>
          </li>
        :
        fileQueryHistory.map((query, ind) => 
          <li key={`${query.fileName}_${ind}`} onClick={() => setQueryToShowPred(query)}
          className={JSON.stringify(queryToShowPred) === JSON.stringify(query) 
            ? 'pdb-query-item-selected'
            : 'pdb-query-item'}>
            <span className='pdb-id-span'>{query.fileName}</span>
            <i className="fa fa-trash fa-lg deletion-fa-icon"
            onClick={ e => { 
              e.stopPropagation();
              dispatch(deleteFileQuery(query)) && setQueryToShowPred(undefined)
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
      <div
        className="AaClash-result container-fluid"
        style={{ padding: 0, fontSize: '16px', textAlign: 'left', marginTop: 1 }}
      >
        <QueryList />
      {queryToShowPred &&
        <div className="container-fluid" style={{ minHeight: 480, maxHeight: 480 }}>
          <div className='row'>
            <div className="col-6" 
            style={{ paddingLeft: 16, overflow: 'hidden scroll', 
              minHeight: 480, paddingTop: 8 }}>
              <CardTitle tag="h5">
                {(queryToShowPred as PdbIdAaQuery).pdbId}'s good AA-Substitutions without steric clash:
              </CardTitle>
              {formattedAaClashPred(
                codePredHistory.filter(pred => pred.queryId === queryToShowPred.queryId)[0]
              ).goodList.map((item) => (
                <CardText key={`good_aa_clash_${parseAaSubDetailedToStr(item)}`}
                  style={{ color: '#90ee90' }}>{parseAaSubDetailedToStr(item)}
                  <Button className='btn btn-sm' color='link' 
                    style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                    onClick={() => {
                      const jobName = codePredHistory.filter(pred => 
                        pred.queryId === queryToShowPred.queryId)[0].jobName;
                      jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                    }}>Download .pdb file of this AA-sub
                  </Button>
                </CardText>
              ))}
            </div>
            <div className="col-6" style={{ paddingLeft: 16, 
              overflow: 'hidden scroll', paddingTop: 8 }}>
              <CardTitle tag="h5">
                {(queryToShowPred as PdbIdAaQuery).pdbId}'s bad AA-Substitutions with steric clash:
              </CardTitle>
              {formattedAaClashPred(
                codePredHistory.filter(pred => pred.queryId === queryToShowPred.queryId)[0]
              ).badList.map((item) => (
                  <CardText key={`bad_aa_clash_${parseAaSubDetailedToStr(item)}`}
                  style={{ color: '#ff4500' }}>
                    {parseAaSubDetailedToStr(item)}
                    <Button className='btn btn-sm' color='link' 
                      style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                      onClick={() => {
                        const jobName = codePredHistory.filter(pred => 
                          pred.queryId === queryToShowPred.queryId)[0].jobName;
                        jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                    }}>Download .pdb file of this AA-sub
                    </Button>
                  </CardText>
              ))}
              <br />
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
    <div className="AaClash-result container-fluid" style={{padding: 0, fontSize: '16px', textAlign: 'left'}}>
      <QueryList />
      <div className="container-fluid" style={{ minHeight: 480, maxHeight: 480 }}>
        <div className='row'>
          <div className="col-6" style={{ paddingLeft: 10, overflow: 'hidden scroll' }}>
            <CardTitle tag="h5">
              {(queryToShowPred as PdbFileQueryStore).fileName}'s good AA-Substitutions without steric clash:
            </CardTitle>
            {formattedAaClashPred(
              filePredHistory.filter(pred => queryToShowPred.queryId === pred.queryId)[0]
              ).goodList.map((item) => (
              <CardText key={`file_good_aa_clash_${parseAaSubDetailedToStr(item)}`}
              style={{ color: '#90ee90' }}>{parseAaSubDetailedToStr(item)}
                <Button className='btn btn-sm' color='link' 
                  style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                  onClick={() => {
                    const jobName = filePredHistory.filter(pred => 
                      (queryToShowPred as PdbFileQueryStore).queryId === pred.queryId)[0].jobName;
                    jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                  }}>Download .pdb file of this AA-sub
                </Button>
              </CardText>
            ))}
          </div>
          <div className="col-6" style={{ paddingLeft: 10, overflow: 'hidden scroll' }}>
            <CardTitle tag="h5">
              {(queryToShowPred as PdbFileQueryStore).fileName}'s bad AA-Substitutions with steric clash:
            </CardTitle>
            {formattedAaClashPred(
              filePredHistory.filter(pred => queryToShowPred.queryId === pred.queryId)[0]
              ).badList.map((item) => (
              <CardText key={`file_bad_aa_clash_${parseAaSubDetailedToStr(item)}`}
              style={{ color: '#ff4500' }}>{parseAaSubDetailedToStr(item)}
                <Button className='btn btn-sm' color='link' 
                  style={{ margin: 0, marginLeft: 5, color: 'yellow'}}
                  onClick={() => {
                    const jobName = filePredHistory.filter(pred => 
                      (queryToShowPred as PdbFileQueryStore).queryId === pred.queryId)[0].jobName;
                    jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                  }}>Download .pdb file of this AA-sub
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
