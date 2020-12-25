// Apply react-router and react-transition-group here

import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { connect } from 'react-redux';
import * as ReduxActions from '../redux/ActionCreators';
import { Button, Form, FormGroup, Label, Input, Col, Row, FormFeedback } from 'reactstrap';
// import { TransitionGroup, CSSTransition } from 'react-transition-group';
import JsMol from './JmolComponent';
import Mol3D from './Mol3dComponent';
import Footer from './FooterComponent';


type MainProps = AppReduxState & { postPdbAaQuery: any, switchPdbInfoSrc: any }
type MainState = { //define this instead of 'any' in order to do error handling for {Form} from 'reactstrap'
  queryFormTouched: boolean,
  queryFormValue: string | string[],
  queryErrMsg: string
}

const mapAppStateToProps = (state: AppReduxState) => ({
  aaClashQuery: state.aaClashQuery
});

const mapDispatchToProps = (dispatch: ThunkDispatch<
  AaClashQueryState,
  undefined,
  ReturnType<PayloadAction | ThunkAction<any, any, undefined, any>>>) => ({
  postPdbAaQuery: (aaClashQuery: PdbIdAaQuery[]) => dispatch(ReduxActions.postPdbAaQuery(aaClashQuery)),
  switchPdbInfoSrc: () => dispatch(ReduxActions.switchPdbInfoSrc())
});


class Main extends Component<MainProps, MainState> {

  constructor(props: MainProps) {
    super(props);
    this.state = {
      queryFormTouched: false,
      queryFormValue: 'Initial',
      queryErrMsg: ''
    }
    this.submitAaClashQuery = this.submitAaClashQuery.bind(this);
  }

  submitAaClashQuery = (evt: React.MouseEvent<HTMLButtonElement>) => {
    // setPdbQuery(
    //   (document.getElementById('pdb-input') as HTMLInputElement).value
    // );
  };

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <Router>
          <header className="App-header">
            <div>
              {/* onChange={changePdbInput} */}
              <input
                type="text"
                id="pdb-input"
                placeholder="pdb code. For example: 3cmp"
              />
              <button
                className="btn btn-light"
                id="pdb-submit"
                onClick={this.submitAaClashQuery}
              >
                See results!
              </button>
            </div>
            <div className="mol-div">
              <JsMol key={`mol_js_`} pdbQueries={this.props.aaClashQuery.queries} />
              <Mol3D key={`mol_3d_`} pdbQueries={this.props.aaClashQuery.queries} />
            </div>
          </header>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default connect(mapAppStateToProps, mapDispatchToProps)(Main);
