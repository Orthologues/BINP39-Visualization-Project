// Apply react-router and react-transition-group here

import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { connect } from 'react-redux';
import { Button, ButtonGroup, CardTitle, Form, FormGroup, Label, Input, Col, 
  Row, FormFeedback, CardText } from 'reactstrap';
import * as ReduxActions from '../redux/ActionCreators';
import { PDB_CODE_ENTRY_REGEX, AA_SUB_ENTRY_REGEX } from '../shared/Consts';
import JsMol from './JmolComponent';
import Mol3D from './Mol3dComponent';
import Footer from './FooterComponent';

const AaClashQueryInputInstruction = `Example:
>1asd  50Y A101S
115P 120
>3cmp 
>2zxc
 34F 
L310R 487`

type MainProps = AppReduxState & { 
  postPdbAaQuery: (aaClashQuery: PdbIdAaQuery[]) => ThunkAction<Promise<void>, any, undefined, any>,
  switchPdbInfoSrc: (newSrc: 'pdbe' | 'rcsb') => PayloadAction
}
type MainState = { //define this instead of 'any' in order to do error handling for {Form} from 'reactstrap'
  queryFormTouched: boolean,
  queryFormValue: string | string[],
  queryErrMsg: string,
  pdbInfoSrc: 'pdbe' | 'rcsb'
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
  switchPdbInfoSrc: (newSrc: 'rcsb' | 'pdbe') => dispatch(ReduxActions.switchPdbInfoSrc(newSrc))
});


class Main extends Component<MainProps, MainState> {

  constructor(props: MainProps) {
    super(props);
    this.state = {
      queryFormTouched: false,
      queryFormValue: '',
      queryErrMsg: '',
      pdbInfoSrc: 'rcsb'
    }
    this.submitAaClashQuery = this.submitAaClashQuery.bind(this);
    this.checkAaClashQueryInput = this.checkAaClashQueryInput.bind(this);
    this.switchPdbInfoSrcState = this.switchPdbInfoSrcState.bind(this);
  }

  submitAaClashQuery = (evt: React.FormEvent<HTMLFormElement>) => {
    alert(this.state.queryFormValue);
  }

  checkAaClashQueryInput = (evt: React.FormEvent<HTMLInputElement>) => {
    const inputField = document.getElementById('aaClashInput');
    if (inputField) {
      this.setState((prevState: MainState) => ({
        ...prevState, queryFormValue: (inputField as HTMLInputElement).value
      }));
    }
  }

  switchPdbInfoSrcState = (newSrc: 'rcsb' | 'pdbe') => {
    this.setState((prevState: MainState) => ({ ...prevState, pdbInfoSrc: newSrc }));
  }

  componentDidMount() {

  }

  render() {

    const displayAaClashQueryExample = (textStr: string) => {
      if (textStr) {
        return (
        <React.Fragment>
          {textStr.split('\n').map((line, index) => 
          (
            <CardText 
            style={{ textAlign: 'left', margin: '5px', marginLeft: '2rem' }}
            key={`exmpl_line_${index}`}>{line}</CardText>
          ))}
        </React.Fragment>) 
      }
      return (
        <React.Fragment>
          <CardText>Example in the text field</CardText>
        </React.Fragment>) 
    }
    

    return (
      <Router>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-12 col-lg-3 App-header-col1'>
              <CardTitle tag="h5">Choose source of PDB database: </CardTitle>
              <ButtonGroup style={{ marginTop: '0.5rem' }}>
                <Button color="info" onClick={ () => this.props.switchPdbInfoSrc('rcsb') &&
                this.switchPdbInfoSrcState('rcsb') }
                active={this.state.pdbInfoSrc === 'rcsb'}>RCSB PDB (default)</Button>
                <Button color="info" onClick={ () => this.props.switchPdbInfoSrc('pdbe') &&
                this.switchPdbInfoSrcState('pdbe') }
                active={this.state.pdbInfoSrc === 'pdbe'}>pdbE</Button>
              </ButtonGroup>
            </div>
            
            <div className='col-12 col-lg-9 App-header-col2'>
              <Form onSubmit={this.submitAaClashQuery}>
                <FormGroup row>
                  <Col lg={3}>
                    {displayAaClashQueryExample(AaClashQueryInputInstruction)}
                  </Col>
                  <Col lg={8}>
                    <Label htmlFor="aaClashInput">AA-Clash query:</Label>
                    <Input type="textarea" id="aaClashInput" name="aaClashInput"
                    onChange={this.checkAaClashQueryInput}
                    rows="10" placeholder={AaClashQueryInputInstruction}
                    value={this.state.queryFormValue}>
                    </Input>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col lg={{size: 10, offset: 2}}>
                    <Button type="submit" color="warning">See results!</Button>
                  </Col>
                </FormGroup>
              </Form>
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
