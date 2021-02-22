import React, { FC } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { useSelector } from 'react-redux';
import { CardText, CardTitle, Button } from 'reactstrap';
import { formattedAaClashPred, parseAaSubDetailedToStr } from '../shared/Funcs';
import { SRV_URL_PREFIX } from '../shared/Consts';


const AaClashResult: FC<any> = () => {
  const appState = useSelector<AppReduxState, AppReduxState>((state) => state);
  const queryMode = useSelector<AppReduxState, 'PDB-CODE' | 'FILE'>(
    (state) => state.aaClashQuery.queryMode
  );

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
  } else if (appState.aaClashQuery.errMsg) {
    return (
      <div
        className="col-10 offset-1"
        style={{ color: 'red', margin: '0.5rem auto', fontSize: '18px' }}
      >
        <CardText>{appState.aaClashQuery.errMsg}</CardText>
      </div>
    );
  } else if (
    queryMode === 'PDB-CODE' &&
    appState.aaClashQuery.codePredResults.length > 0
  ) {
    return (
      <div
        className="App-body-col1 container-fluid"
        style={{ padding: '0 1rem', fontSize: '18px', textAlign: 'left' }}
      >
        {appState.aaClashQuery.queries.map((query) => (
          <div className="container-fluid" key={`result_div_${query.queryId}`}>
            <div className="row">
              <div
                className="col-12 col-lg-6"
                style={{ paddingLeft: '2rem', marginBottom: '1rem' }}
              >
                <CardTitle tag="h5">
                  {query.pdbId}'s good AA-Substitutions without steric clash:
                </CardTitle>
                {formattedAaClashPred(
                  appState.aaClashQuery.codePredResults.filter(pred => pred.queryId === query.queryId)[0]
                ).goodList.map((item) => (
                  <CardText key={`good_aa_clash_${parseAaSubDetailedToStr(item)}`}
                    style={{ color: '#90ee90' }}>{parseAaSubDetailedToStr(item)}
                    <Button className='btn btn-sm' color='link' style={{ margin: 0, marginLeft: 5 }}
                      onClick={() => {
                        const jobName = appState.aaClashQuery.codePredResults.filter(pred => 
                          pred.queryId === query.queryId)[0].jobName;
                        jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                      }}>Download .pdb file of this AA-sub
                    </Button>
                  </CardText>
                ))}
              </div>
              <div className="col-12 col-lg-6" style={{ paddingLeft: '2rem' }}>
                <CardTitle tag="h5">
                  {query.pdbId}'s bad AA-Substitutions with steric clash:
                </CardTitle>
                {formattedAaClashPred(
                  appState.aaClashQuery.codePredResults.filter(pred => pred.queryId === query.queryId)[0]
                ).badList.map((item) => (
                    <CardText key={`bad_aa_clash_${parseAaSubDetailedToStr(item)}`}
                    style={{ color: '#ff4500' }}>
                      {parseAaSubDetailedToStr(item)}
                      <Button className='btn btn-sm' color='link' style={{ margin: 0, marginLeft: 5 }}
                        onClick={() => {
                          const jobName = appState.aaClashQuery.codePredResults.filter(pred => 
                            pred.queryId === query.queryId)[0].jobName;
                          jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                      }}>Download .pdb file of this AA-sub
                      </Button>
                    </CardText>
                ))}
                <br />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (queryMode === 'FILE' && appState.aaClashQuery.filePredResult) {
    return (
      <div
        className="App-body-col1 container-fluid"
        style={{ padding: '0 1rem', fontSize: '18px', textAlign: 'left' }}
      >
        <div className="container-fluid">
          <div className="row">
            <div
              className="col-12 col-lg-6"
              style={{ paddingLeft: '2rem', marginBottom: '1rem' }}
            >
              <CardTitle tag="h5">
                {appState.aaClashQuery.filePredResult.jobName.match(
                  /(?<=.+_)\w+/
                )}
                's good AA-Substitutions without steric clash:
              </CardTitle>
              {formattedAaClashPred(
                appState.aaClashQuery.filePredResult
              ).goodList.map((item) => (
                <CardText key={`file_good_aa_clash_${parseAaSubDetailedToStr(item)}`}
                style={{ color: '#90ee90' }}>{parseAaSubDetailedToStr(item)}
                  <Button className='btn btn-sm' color='link' style={{ margin: 0, marginLeft: 5 }}
                    onClick={() => {
                      const jobName = appState.aaClashQuery.filePredResult?.jobName;
                      jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                    }}>
                  </Button>
                </CardText>
              ))}
            </div>
            <div className="col-12 col-lg-6" style={{ paddingLeft: '2rem' }}>
              <CardTitle tag="h5">
                {appState.aaClashQuery.filePredResult.jobName.match(
                  /(?<=.+_)\w+/
                )}
                's bad AA-Substitutions with steric clash:
              </CardTitle>
              {formattedAaClashPred(
                appState.aaClashQuery.filePredResult
              ).badList.map((item) => (
                <CardText key={`file_bad_aa_clash_${parseAaSubDetailedToStr(item)}`}
                style={{ color: '#ff4500' }}>{parseAaSubDetailedToStr(item)}
                  <Button className='btn btn-sm' color='link' style={{ margin: 0, marginLeft: 5 }}
                    onClick={() => {
                      const jobName = appState.aaClashQuery.filePredResult?.jobName;
                      jobName && setTimeout(() => mapJobIdAaSub2Pdb(jobName, item), 50)
                    }}>
                  </Button>
                </CardText>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <div></div>;
};

export default AaClashResult;
