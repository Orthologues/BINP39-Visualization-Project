// Apply react-router and react-transition-group here

import React, { Component } from 'react';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { connect, ConnectedProps } from 'react-redux';
import { Button, ButtonGroup, CardTitle, Form, FormGroup, Label, Input, Col, Card, CardHeader,
  CardText, FormText } from 'reactstrap';
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


const mapAppStateToProps = (state: AppReduxState) => ({
  aaClashQuery: state.aaClashQuery,
  rcsbGraphQl: state.rcsbGraphQl
});
const mapDispatchToProps = (dispatch: ThunkDispatch<
  AppReduxState,
  undefined,
  PayloadAction | ReturnType<ThunkAction<any, any, undefined, any>>>) => ({
  resetAppReduxState: () => dispatch(ReduxActions.resetAppReduxState()),
  handleCodeInput: (input: string) => dispatch(ReduxActions.handleCodeQueryInput(input)),
  handleFileInput: (input: string) => dispatch(ReduxActions.handleFileQueryInput(input)),
  postCodeQuery: (aaClashQuery: PdbIdAaQuery[]) => dispatch(ReduxActions.postCodeQuery(aaClashQuery)),
  postFileQuery: (aaClashQuery: PdbQueryFormData, queryStore: PdbFileQueryStore) => dispatch(ReduxActions.postFileQuery(aaClashQuery, queryStore)),
  switchAaClashQueryMode: (newMode: 'PDB-CODE'|'FILE') => dispatch(ReduxActions.switchAaClashQueryMode(newMode))
});
const mainConnector = connect(mapAppStateToProps, mapDispatchToProps);
type MainProps = ConnectedProps<typeof mainConnector>; //MainProps is mapped from Redux-Store
type MainState = { //define this instead of 'any' in order to do error handling for {Form} from 'reactstrap'
  codeFormTouched: boolean,
  codeQueryErrMsg: string,
  fileFormTouched: boolean,
  fileQueryErrMsg: string,
  selectedPdbFile: File | null
}


class Main extends Component<MainProps, MainState> {

  constructor(props: MainProps) {
    super(props);
    this.state = {
      codeFormTouched: false,
      codeQueryErrMsg: '',
      fileFormTouched: false,
      fileQueryErrMsg: '',
      selectedPdbFile: null,
    }
    this.handleAaClashQueryBlur = this.handleAaClashQueryBlur.bind(this);
    this.handleAaClashQueryInput = this.handleAaClashQueryInput.bind(this);
    this.clearAaClashQueryInput = this.clearAaClashQueryInput.bind(this);
    this.handlePdbChange = this.handlePdbChange.bind(this);
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
    setTimeout(() => {}, 50);
    if (this.state.codeQueryErrMsg !== '' || !this.state.codeFormTouched) {
      alert(`Your code-query is incorrectly formatted!`); return
    } 
    const pdbIds = this.props.aaClashQuery.codeQueryFormValue.match(PDB_CODE_ENTRY_REGEX);
    const aaSubsRaw = this.props.aaClashQuery.codeQueryFormValue.match(AA_SUB_ENTRY_REGEX); 
    (pdbIds && aaSubsRaw && aaSubsRaw.length > 0) && 
    this.props.postCodeQuery(processedCodeQueries(pdbIds, aaSubsRaw));
  }
  handlePdbChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = evt.target.files;
    if (!fileList) return;
    this.setState(prevState => {
      return { ...prevState, selectedPdbFile: fileList[0] }
    });
  };
  submitFileQuery = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setTimeout(() => {}, 50);
    if (! this.state.selectedPdbFile) { alert('No .pdb input file is uploaded!'); return }
    // such check would block unpublished .pdb files, don't use it //
    // if (! this.state.selectedPdbFile?.name.match(PDB_FILE_NAME_REGEX)) { 
    //   alert(`Prefix of the .pdb file you uploaded doesn't match PDB-id format!`); return 
    // } 
    const aaSubsRaw = this.props.aaClashQuery.fileQueryFormValue.match(FILE_AA_SUB_REGEX); 
    if (aaSubsRaw && aaSubsRaw.length > 0 && this.state.fileQueryErrMsg === '' && 
    this.state.fileFormTouched && this.state.selectedPdbFile) {
      const queryStore = processedFileQuery(this.state.selectedPdbFile.name, aaSubsRaw);
      if (queryStore) {
        const queryData = new FormData();
        queryData.append('pdbFile', this.state.selectedPdbFile);
        queryData.append('aaSubs', JSON.stringify(queryStore.aaSubs));
        queryData.append('queryId', queryStore.queryId);
        this.props.postFileQuery(queryData, queryStore);
      }
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
            <Loading text='Running scripts at backend . . .'/>
          </div>
        </div>
      );
    }

    return (
      <div className='container-fluid'>
        <Card>
          <CardHeader>
            <CardTitle tag='h5'>PON-SC+ for Amino Acid clash detection, Molecular visualization, UI access to RCSB-PDB's API, Mapping to UniprotID etc</CardTitle>
            <CardText style={{ textAlign: 'left' }}>This tool identifies if an amino acid substitution would cause clashes in protein structure or not. Taking PDB format file or PDB accession codes as input, for each position of interest substitutions are modeled using backbone-dependent rotamer library (<a target="_blank" href="https://pubmed.ncbi.nlm.nih.gov/21645855/">Shapovalov and Dunbrack, 2011</a>). Sterical clashes are calculated based on the distance between atoms.</CardText>
          </CardHeader>
        </Card>
        <div className='row'>
          <div className='col-12 col-lg-3 App-body-col1'>
            <CardTitle tag="h5">Choose mode of AA-Clash query: </CardTitle>
            <ButtonGroup>
              <Button color="info" onClick={ () => this.props.switchAaClashQueryMode('PDB-CODE') }
              active={this.props.aaClashQuery.queryMode === 'PDB-CODE'}>PDB-CODE (default)</Button>
              <Button color="info" onClick={ () => this.props.switchAaClashQueryMode('FILE') }
              active={this.props.aaClashQuery.queryMode === 'FILE'}>PDB FILE</Button>
            </ButtonGroup>
            <Button className='btn btn-secondary btn-sm' type='button'
            style={{ marginTop: '2rem' }} onClick={this.props.resetAppReduxState}
            >Reset App-state</Button>
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
                  htmlFor="aaClashInput">AA-Clash Code Query:</Label>
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
                  <Button type="reset" color="warning" style={{ marginBottom: '0.5rem' }}>Clear</Button>
                </Col>
                <Col lg={{ size: 6 }}>
                  <Button type="submit" color="primary">See results!</Button>
                </Col>
              </FormGroup>
            </Form>
            ) : (
            <Form onSubmit={this.submitFileQuery} onReset={this.clearAaClashQueryInput}>
              <FormGroup row>
                <Col lg={3}>
                  {displayAaClashQueryExample(FileQueryExample)}
                  <CardText style={{ color: '#fd9a24', marginTop: '1rem' }}>
                  {this.state.fileQueryErrMsg}</CardText>
                </Col>
                <Col lg={8}>
                  <Label style={{ marginTop: '0.5rem' }} 
                  htmlFor="aaClashFileInput">AA-Clash File Query:</Label>
                  <Input type="textarea" id="aaClashFileInput" name="aaClashFileInput"
                  value={this.props.aaClashQuery.fileQueryFormValue}
                  onChange={this.handleAaClashQueryInput}
                  onBlur={this.handleAaClashQueryBlur}
                  valid={this.props.aaClashQuery.fileQueryFormValue.match(FILE_AA_SUB_REGEX) !== null}
                  invalid={!FILE_AA_SUB_REGEX.test(this.props.aaClashQuery.fileQueryFormValue)}
                  rows="11" placeholder={FileQueryExample}>
                  </Input>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col lg={{ size: 1, offset: 3 }}>
                  <Button type="reset" color="warning" style={{ marginBottom: '0.5rem' }}>Clear</Button>
                </Col>
                <Col lg={{ size: 4, offset: 1 }}>
                  <Input style={{ fontSize: '1rem' }}
                  type="file" name="pdbFile" id="pdbFile" accept='.pdb' onChange={this.handlePdbChange}/>
                  <FormText color="muted">
                    Please upload a .pdb file
                  </FormText>
                </Col>
                <Col lg={{ size: 2 }}>
                  <Button type="submit" color="primary">See results!</Button>
                </Col>
              </FormGroup>
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

export default mainConnector(Main);
