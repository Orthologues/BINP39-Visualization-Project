// Apply react-router and react-transition-group here

import React, { Component } from 'react';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { connect } from 'react-redux';
import { Button, ButtonGroup, CardTitle, Form, FormGroup, Label, Input, Col, CardText } from 'reactstrap';
import * as ReduxActions from '../redux/ActionCreators';
import { PDB_CODE_ENTRY_REGEX, AA_SUB_ENTRY_REGEX, FILE_AA_SUB_REGEX } from '../shared/Consts';
import { processedCodeQueries, processedFileQuery } from '../shared/Funcs';
import AaClashResult from './AaClashResultComponent';
import Loading from './LoadingComponent';


const CodeQueryExample = `Example of PDB-Code Query:
>1asd  50Y A101S
115P 120
>2zxc
 34F 
L310R 487`

const FileQueryExample = `Example of PDB-File Query:
91 96I  99R 
 A101S
115P`

type MainProps = AppReduxState & { 
  handleCodeInput: (input: string) => PayloadAction,
  handleFileInput: (input: string) => PayloadAction,
  postCodeQuery: (aaClashQuery: PdbIdAaQuery[]) => ThunkAction<Promise<void>, any, undefined, any>,
  switchAaClashQueryMode: (newMode: 'PDB-CODE' | 'FILE') => PayloadAction
}
type MainState = { //define this instead of 'any' in order to do error handling for {Form} from 'reactstrap'
  codeFormTouched: boolean,
  codeQueryErrMsg: string,
  fileFormTouched: boolean,
  fileQueryErrMsg: string
}

const mapAppStateToProps = (state: AppReduxState) => ({
  aaClashQuery: state.aaClashQuery,
  rcsbGraphQl: state.rcsbGraphQl
});
const mapDispatchToProps = (dispatch: ThunkDispatch<
  AppReduxState,
  undefined,
  PayloadAction | ReturnType<ThunkAction<any, any, undefined, any>>>) => ({
  handleCodeInput: (input: string) => dispatch(ReduxActions.handleCodeQueryInput(input)),
  handleFileInput: (input: string) => dispatch(ReduxActions.handleFileQueryInput(input)),
  postCodeQuery: (aaClashQuery: PdbIdAaQuery[]) => dispatch(ReduxActions.postCodeQuery(aaClashQuery)),
  switchAaClashQueryMode: (newMode: 'PDB-CODE'|'FILE') => dispatch(ReduxActions.switchAaClashQueryMode(newMode))
});


class Main extends Component<MainProps, MainState> {

  constructor(props: MainProps) {
    super(props);
    this.state = {
      codeFormTouched: false,
      codeQueryErrMsg: '',
      fileFormTouched: false,
      fileQueryErrMsg: ''
    }
    this.handleAaClashQueryBlur = this.handleAaClashQueryBlur.bind(this);
    this.handleAaClashQueryInput = this.handleAaClashQueryInput.bind(this);
    this.clearAaClashQueryInput = this.clearAaClashQueryInput.bind(this);
    this.submitCodeQuery = this.submitCodeQuery.bind(this);
    this.submitFileQuery = this.submitFileQuery.bind(this);
  }

  validateCodeQuery = (aaClashQuery: string) => {
    const pdbCodeMatch = aaClashQuery.match(PDB_CODE_ENTRY_REGEX);
    const aaSubMatch = aaClashQuery.match(AA_SUB_ENTRY_REGEX); 
    if (pdbCodeMatch && !aaSubMatch) { 
      this.setState((prevState: MainState) => ({
        ...prevState, codeQueryErrMsg: `No sets of valid AA-substitution queries were found!`
      }));
    } else if ( !pdbCodeMatch ) {
      this.setState((prevState: MainState) => ({
        ...prevState, codeQueryErrMsg: `No valid PDB-ID queries were found!`
      }));
    } else if (pdbCodeMatch?.length !== aaSubMatch?.length) { 
      this.setState((prevState: MainState) => ({
        ...prevState, codeQueryErrMsg: `Valid PDB-ID queries didn't match valid sets of AA-substitution queries numerically!`
      }));
    } else {
      this.setState((prevState: MainState) => ({
        ...prevState, codeQueryErrMsg: ''
      }));
    }
  }

  validateFileQuery = (aaClashQuery: string) => {
    const aaSubMatch = aaClashQuery.match(FILE_AA_SUB_REGEX); 
    if (!aaSubMatch) { 
      this.setState((prevState: MainState) => ({
        ...prevState, fileQueryErrMsg: `No sets of valid AA-substitution queries were found!`
      }));
    } else {
      this.setState((prevState: MainState) => ({
        ...prevState, fileQueryErrMsg: ''
      }));
    }
  }

  handleAaClashQueryBlur = (evt: React.FormEvent<HTMLInputElement>) => {
    evt.preventDefault();
    if (this.props.aaClashQuery.queryMode === 'PDB-CODE') {
      this.setState((prevState: MainState) => ({
        ...prevState, codeFormTouched: true
      }));
      this.validateCodeQuery(this.props.aaClashQuery.codeQueryFormValue);
    } else {
      this.setState((prevState: MainState) => ({
        ...prevState, fileFormTouched: true
      }));
      this.validateFileQuery(this.props.aaClashQuery.fileQueryFormValue);
    }
  }

  handleAaClashQueryInput = (evt: React.FormEvent<HTMLInputElement>) => {
    evt.preventDefault();
    const inputValue = (evt.target as HTMLInputElement).value
    this.props.aaClashQuery.queryMode === 'PDB-CODE' ? 
    this.props.handleCodeInput(inputValue) :
    this.props.handleFileInput(inputValue);
    setTimeout(() => { 
      this.props.aaClashQuery.queryMode === 'PDB-CODE' ? 
      this.state.codeFormTouched && this.validateCodeQuery(this.props.aaClashQuery.codeQueryFormValue) :
      this.state.fileFormTouched && this.validateFileQuery(this.props.aaClashQuery.fileQueryFormValue) 
     }, 100); 
  }

  clearAaClashQueryInput = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    this.props.aaClashQuery.queryMode === 'PDB-CODE' ?
    this.props.handleCodeInput('') : this.props.handleFileInput(''); 
  }

  submitCodeQuery = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (this.state.codeQueryErrMsg === '' && this.state.codeFormTouched) {
      const pdbIds = this.props.aaClashQuery.codeQueryFormValue.match(PDB_CODE_ENTRY_REGEX);
      const aaSubsRaw = this.props.aaClashQuery.codeQueryFormValue.match(AA_SUB_ENTRY_REGEX); 
      (pdbIds && aaSubsRaw) && 
      this.props.postCodeQuery(processedCodeQueries(pdbIds, aaSubsRaw));
    } 
  }

  submitFileQuery = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (this.state.fileQueryErrMsg === '' && this.state.fileFormTouched) {
      const aaSubsRaw = this.props.aaClashQuery.fileQueryFormValue.match(FILE_AA_SUB_REGEX); 
      // aaSubsRaw && this.props.postFileQuery(processedFileQuery(aaSubsRaw));
    } 
  }


  componentDidMount() {}

  render() {
    const displayAaClashQueryExample = (textStr: string) => {
      if (textStr) {
        return (
        <React.Fragment>
          {textStr.split('\n').map((line, index) => 
          (
            <CardText 
            style={{ textAlign: 'left', margin: '0px' }}
            key={`exmpl_line_${index}`}>{line}</CardText>
          ))}
        </React.Fragment>) 
      }
      return (
        <React.Fragment>
          <CardText>Example in the text field</CardText>
        </React.Fragment>) 
    }
    
    if (this.props.aaClashQuery.isLoading) {
      return (
        <div className='container-fluid'>
          <div className='row' style={{ height: '360px' }}>
            <Loading text='Loading . . .'/>
          </div>
        </div>
      );
    }

    return (
      <div className='container-fluid'>

        <div className='row'>
          <div className='col-12 col-lg-3 App-body-col1'>
            <CardTitle tag="h5">Choose mode of AA-Clash query: </CardTitle>
            <ButtonGroup style={{ marginTop: '0.5rem' }}>
              <Button color="info" onClick={ () => this.props.switchAaClashQueryMode('PDB-CODE') }
              active={this.props.aaClashQuery.queryMode === 'PDB-CODE'}>PDB-CODE (default)</Button>
              <Button color="info" onClick={ () => this.props.switchAaClashQueryMode('FILE') }
              active={this.props.aaClashQuery.queryMode === 'FILE'}>PDB FILE</Button>
            </ButtonGroup>
          </div>
          
          <div className='col-12 col-lg-9 App-body-col2'>
            {this.props.aaClashQuery.queryMode === 'PDB-CODE' ? (
              <Form onSubmit={this.submitCodeQuery} onReset={this.clearAaClashQueryInput}>
              <FormGroup row>
                <Col lg={3}>
                  {displayAaClashQueryExample(CodeQueryExample)}
                  <CardText style={{ color: '#fd9a24', marginTop: '1rem' }}>
                  {this.state.codeQueryErrMsg}</CardText>
                </Col>
                <Col lg={8}>
                  <Label style={{ marginTop: '0.5rem' }} 
                  htmlFor="aaClashInput">AA-Clash query:</Label>
                  <Input type="textarea" id="aaClashInput" name="aaClashInput"
                  value={this.props.aaClashQuery.codeQueryFormValue}
                  onChange={this.handleAaClashQueryInput}
                  onBlur={this.handleAaClashQueryBlur}
                  valid={this.props.aaClashQuery.codeQueryFormValue.match(AA_SUB_ENTRY_REGEX) !== null}
                  invalid={!AA_SUB_ENTRY_REGEX.test(this.props.aaClashQuery.codeQueryFormValue)}
                  rows="11" placeholder={CodeQueryExample}>
                  </Input>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col lg={{ size: 1, offset: 3 }}>
                  <Button type="reset" color="warning">Clear</Button>
                </Col>
                <Col lg={{ size: 6 }}>
                  <Button type="submit" color="primary">See results!</Button>
                </Col>
              </FormGroup>
            </Form>
            ) : (
              <Form>
                <CardText>File query mode (To be continued)</CardText>
              </Form>
            )}
          </div>
        </div>

        <div className='row'>
          <AaClashResult />
        </div>

      </div>
    );
  }
}

export default connect(mapAppStateToProps, mapDispatchToProps)(Main);
