// Apply react-router and react-transition-group here

import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { connect } from 'react-redux';
import { Button, ButtonGroup, CardTitle, Form, Label, Input, Col, Row, FormFeedback } from 'reactstrap';
import * as ReduxActions from '../redux/ActionCreators';
import { PDB_CODE_ENTRY_REGEX, AA_SUB_ENTRY_REGEX } from '../shared/Consts';
import JsMol from './JmolComponent';
import Mol3D from './Mol3dComponent';
import Footer from './FooterComponent';


type MainProps = AppReduxState & { postPdbAaQuery: any, switchPdbInfoSrc: any }
type MainState = { //define this instead of 'any' in order to do error handling for {Form} from 'reactstrap'
  queryFormTouched: boolean,
  queryFormValue: string | string[],
  queryErrMsg: string,
  pdbInfoSrc: 'rcsb' | 'pdbe';
}

const mapAppStateToProps = (state: AppReduxState) => ({
  aaClashQuery: state.aaClashQuery,
  pdbInfoSrc: state.pdbInfoSrc
});

const mapDispatchToProps = (dispatch: ThunkDispatch<
  AaClashQueryState,
  undefined,
  PayloadAction | ReturnType<ThunkAction<any, any, undefined, any>>>) => ({
  postPdbAaQuery: (aaClashQuery: PdbIdAaQuery[]) => dispatch(ReduxActions.postPdbAaQuery(aaClashQuery)),
  switchPdbInfoSrc: (newSrc: 'pdb' | 'rcsb') => dispatch(ReduxActions.switchPdbInfoSrc(newSrc))
});


class Main extends Component<MainProps, MainState> {

  constructor(props: MainProps) {
    super(props);
    this.state = {
      queryFormTouched: false,
      queryFormValue: 'Initial',
      queryErrMsg: '',
      pdbInfoSrc: 'rcsb'
    }
    this.submitAaClashQuery = this.submitAaClashQuery.bind(this);
    this.switchPdbInfoSrcState = this.switchPdbInfoSrcState.bind(this);
  }

  submitAaClashQuery = (evt: React.MouseEvent<HTMLButtonElement>) => {
    // setPdbQuery(
    //   (document.getElementById('pdb-input') as HTMLInputElement).value
    // );
  };

  switchPdbInfoSrcState = (newSrc: 'rcsb' | 'pdbe') => {
    this.setState((prevState: MainState) => (
      { ...prevState, pdbInfoSrc: newSrc } ));
  }

  componentDidMount() {

  }

  render() {
    return (
      <Router>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-12 col-md-4 App-header-col'>
             <CardTitle tag="h6">Choose source of PDB database: </CardTitle>
              <ButtonGroup style={{ marginTop: '0.5rem' }}>
                <Button color="info" onClick={ () => this.props.switchPdbInfoSrc('rcsb') &&
                this.switchPdbInfoSrcState('rcsb') }
                active={this.state.pdbInfoSrc === 'rcsb'}>RCSB PDB (default)</Button>
                <Button color="info" onClick={ () => this.props.switchPdbInfoSrc('pdbe') &&
                this.switchPdbInfoSrcState('pdbe') }
                active={this.state.pdbInfoSrc === 'pdbe'}>pdbE</Button>
              </ButtonGroup>
            </div>
            
            <div className='col-12 col-md-8 App-header-col'>
              <input
                type="text"
                id="pdb-input"
                placeholder="pdb code. For example: 3cmp"
              />
              <button
                className="btn btn-light"
                id="pdb-submit"
                onClick={this.submitAaClashQuery}
              >See results!
              </button>
            </div>
          </div>

          <div className='row'>
            <div className="mol-div">
              <JsMol key={`mol_js_`} pdbQueries={this.props.aaClashQuery.queries} />
              <Mol3D key={`mol_3d_`} pdbQueries={this.props.aaClashQuery.queries} />
            </div>
          </div>
        </div>
        <Footer />
      </Router>
    );
  }
}

export default connect(mapAppStateToProps, mapDispatchToProps)(Main);
