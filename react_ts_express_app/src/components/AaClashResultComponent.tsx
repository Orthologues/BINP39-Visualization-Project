import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
// import { Link, Route, Redirect, Switch, withRouter } from 'react-router-dom';
import { CardText } from 'reactstrap';
import * as ReduxActions from '../redux/ActionCreators';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

type AaClashProps = AppReduxState & {};
type AaClashState = {
    selectedPdbAaSubRoute?: string
}

const mapAppStateToProps = (state: AppReduxState) => ({
    aaClashQuery: state.aaClashQuery,
    pdbInfoSrc: state.pdbInfoSrc
});
const mapDispatchToProps = (dispatch: ThunkDispatch<
  AppReduxState,
  undefined,
  PayloadAction | ReturnType<ThunkAction<any, any, undefined, any>>>) => ({
    
});


class AaClashResult extends Component<AaClashProps, AaClashState> {
  constructor(props: AaClashProps) {
      super(props);  
      this.state = {}
  }  

  render() {
      if (Array.isArray(this.props.aaClashQuery.errMsg)) {
          return (
            <div className="col-10 offset-1 AaClash-err" >
              { this.props.aaClashQuery.errMsg.map(((errmsg, index) => {
                  return (
                    <CardText key={`pyErrMsg${index}`} style={{ margin: '5px'}}
                    >{errmsg}</CardText>
                  )
                }))}
            </div>
          )
      } 
      else if (this.props.aaClashQuery.errMsg) {
        return (
          <div className="col-10 offset-1 Aaclash-err" >
            <CardText>{this.props.aaClashQuery.errMsg}</CardText>
          </div>
        )
      }
      else if (this.props.aaClashQuery.predResultsHistory.length > 0) {
          return (
            <div className="col-12 App-body-col1"
            style={{ padding: '16px 5%', fontSize: '18px' }}>
              <CardText>{JSON.stringify(this.props.aaClashQuery.predResults)}</CardText>
            </div> );
      }
      return (<div></div>);
  }
}

export default connect(mapAppStateToProps, mapDispatchToProps)(AaClashResult);