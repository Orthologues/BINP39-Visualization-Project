import React, { FC, useState } from 'react';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { CardText, CardTitle } from 'reactstrap';
import { formattedAaClashPred } from '../shared/Funcs';


const AaClashResult: FC<any> = () => {
  
  const appState = useSelector<AppReduxState, AppReduxState>(state => state); 
  const queryMode = useSelector<AppReduxState, 'PDB-CODE'|'FILE'>(state => state.aaClashQuery.queryMode);
  const dispatch = useDispatch<Dispatch<PayloadAction>>();

    if (Array.isArray(appState.aaClashQuery.errMsg)) {
      return (
        <div className="col-12" >
          { appState.aaClashQuery.errMsg.map(((errmsg, index) => {
            return (
              <CardText key={`pyErrMsg${index}`} style={{color: 'red', margin: '5px auto', fontSize: '18px'}}
              >{errmsg}</CardText>
            )
          }))}
        </div>
      )
    } 
    else if (appState.aaClashQuery.errMsg) {
      return (
        <div className="col-10 offset-1" 
        style={{ color: 'red', margin: '0.5rem auto', fontSize: '18px'}}>
          <CardText>{appState.aaClashQuery.errMsg}</CardText>
        </div>
      )
    }
    else if (queryMode === 'PDB-CODE' && appState.aaClashQuery.codePredResults.length >0) {
        return (
          <div className="col-12 App-body-col1"
          style={{ padding: '16px', fontSize: '18px', textAlign: 'left' }}>
          { appState.aaClashQuery.queries.map((query, ind) => 
          ( <CardText key={`${query.queryId}_${ind}`}>
              <CardTitle tag='h5'>{appState.aaClashQuery.codePredResults[ind].jobName.match(/(?<=.+_)\w{4}/)}'s good AA-Substitutions without steric clash:</CardTitle>
              {formattedAaClashPred(appState.aaClashQuery.codePredResults[ind]).goodList.map(item =>
                <CardText style={{color: '#90ee90'}}>{item}</CardText>)}
              <CardTitle tag='h5'>{appState.aaClashQuery.codePredResults[ind].jobName.match(/(?<=.+_)\w{4}/)}'s bad AA-Substitutions with steric clash:</CardTitle>
              {formattedAaClashPred(appState.aaClashQuery.codePredResults[ind]).badList.map(item =>
                <CardText style={{color: '#ff4500'}}>{item}</CardText>)}
            <br /> 
            </CardText> )
          ) }
          </div> );
    }
    else if (queryMode === 'FILE' && appState.aaClashQuery.filePredResult) {
      return (
        <div className="col-12 App-body-col1"
        style={{ padding: '16px 5%', fontSize: '18px', textAlign: 'left' }}>
          <CardText>
            <CardTitle tag='h5'>{appState.aaClashQuery.filePredResult.jobName.match(/(?<=.+_)\w+/)}'s good AA-Substitutions without steric clash:</CardTitle>
            {formattedAaClashPred(appState.aaClashQuery.filePredResult).goodList.map(item =>
              <CardText style={{color: '#90ee90'}}>{item}</CardText>)}
            <CardTitle tag='h5'>{appState.aaClashQuery.filePredResult.jobName.match(/(?<=.+_)\w+/)}'s bad AA-Substitutions with steric clash:</CardTitle>
            {formattedAaClashPred(appState.aaClashQuery.filePredResult).badList.map(item =>
              <CardText style={{color: '#ff4500'}}>{item}</CardText>)}
          </CardText> 
        </div> );
    }
    return (<div></div>);
}

export default AaClashResult;