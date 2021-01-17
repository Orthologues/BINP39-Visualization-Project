// Apply react-router and react-transition-group here

import React, { Component } from 'react';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { connect } from 'react-redux';
import { Button, ButtonGroup, CardTitle, Form, FormGroup, Label, Input, Col, CardText } from 'reactstrap';
import * as ReduxActions from '../redux/ActionCreators';
import { PDB_CODE_ENTRY_REGEX, AA_SUB_ENTRY_REGEX } from '../shared/Consts';
import { processedPdbIdAaQueries } from '../shared/Funcs';
import AaClashResult from './AaClashResultComponent';
import Loading from './LoadingComponent';


const AaClashQueryExample = `Example:
>1asd  50Y A101S
115P 120
>2zxc
 34F 
L310R 487`

type MainProps = AppReduxState & { 
  // addPdbQuery: (aaClashQuery: PdbIdAaQuery[]) => PayloadAction
  postPdbAaQuery: (aaClashQuery: PdbIdAaQuery[]) => ThunkAction<Promise<void>, any, undefined, any>,
  switchAaClashQueryMode: (newMode: 'PDB-CODE' | 'FILE') => PayloadAction
}
type MainState = { //define this instead of 'any' in order to do error handling for {Form} from 'reactstrap'
  queryFormTouched: boolean,
  queryFormValue: string,
  queryErrMsg: string,
  aaClashQueryMode: 'PDB-CODE' | 'FILE'
}

const mapAppStateToProps = (state: AppReduxState) => ({
  aaClashQuery: state.aaClashQuery,
  rcsbGraphQl: state.rcsbGraphQl
});
const mapDispatchToProps = (dispatch: ThunkDispatch<
  AppReduxState,
  undefined,
  PayloadAction | ReturnType<ThunkAction<any, any, undefined, any>>>) => ({
  // addPdbQuery: (aaClashQuery: PdbIdAaQuery[]) => dispatch(ReduxActions.addPdbQuery(aaClashQuery)),
  postPdbAaQuery: (aaClashQuery: PdbIdAaQuery[]) => dispatch(ReduxActions.postPdbAaQuery(aaClashQuery)),
  switchAaClashQueryMode: (newMode: 'PDB-CODE'|'FILE') => dispatch(ReduxActions.switchAaClashQueryMode(newMode))
});


class Main extends Component<MainProps, MainState> {

  constructor(props: MainProps) {
    super(props);
    this.state = {
      queryFormTouched: false,
      queryFormValue: '',
      queryErrMsg: '',
      aaClashQueryMode: 'PDB-CODE'
    }
    this.submitAaClashQuery = this.submitAaClashQuery.bind(this);
    this.handleAaClashQueryBlur = this.handleAaClashQueryBlur.bind(this);
    this.handleAaClashQueryInput = this.handleAaClashQueryInput.bind(this);
  }

  switchAaClashQueryMode = (newMode: 'PDB-CODE' | 'FILE') => {
    this.setState((prevState: MainState) => ({ ...prevState, aaClashQueryMode: newMode }));
  }

  validateAAClashQuery = (aaClashQuery: string) => {
    const pdbCodeMatch = aaClashQuery.match(PDB_CODE_ENTRY_REGEX);
    const aaSubMatch = aaClashQuery.match(AA_SUB_ENTRY_REGEX); 
    if (pdbCodeMatch && !aaSubMatch) { 
      this.setState((prevState: MainState) => ({
        ...prevState, queryErrMsg: `No sets of valid AA-substitution queries were found!`
      }));
    } else if ( !pdbCodeMatch ) {
      this.setState((prevState: MainState) => ({
        ...prevState, queryErrMsg: `No valid PDB-ID queries were found!`
      }));
    } else if (pdbCodeMatch?.length !== aaSubMatch?.length) { 
      this.setState((prevState: MainState) => ({
        ...prevState, queryErrMsg: `Valid PDB-ID queries didn't match valid sets of AA-substitution queries numerically!`
      }));
    } else {
      this.setState((prevState: MainState) => ({
        ...prevState, queryErrMsg: ''
      }));
    }
  }

  handleAaClashQueryBlur = (evt: React.FormEvent<HTMLInputElement>) => {
    evt.preventDefault();
    this.setState((prevState: MainState) => ({
      ...prevState, queryFormTouched: true
    }));
    this.validateAAClashQuery(this.state.queryFormValue);
  }

  handleAaClashQueryInput = (evt: React.FormEvent<HTMLInputElement>) => {
    // Using DOM: 
    // const inputValue = (document.getElementById('aaClashInput') as HTMLInputElement).value; //
    evt.preventDefault();
    const inputValue = (evt.target as HTMLInputElement).value
    if (inputValue) {
      this.setState((prevState: MainState) => ({
        ...prevState, queryFormValue: inputValue
      }));
    }
    setTimeout(() => { 
      this.state.queryFormTouched && this.validateAAClashQuery(this.state.queryFormValue);
     }, 100);
  }

  submitAaClashQuery = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (this.state.queryErrMsg === '' && this.state.queryFormTouched) {
      const pdbIds = this.state.queryFormValue.match(PDB_CODE_ENTRY_REGEX);
      const aaSubsRaw = this.state.queryFormValue.match(AA_SUB_ENTRY_REGEX); 
      (pdbIds && aaSubsRaw) && 
      this.props.postPdbAaQuery(processedPdbIdAaQueries(pdbIds, aaSubsRaw));
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
            <Loading />
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
              <Button color="info" onClick={ () => this.props.switchAaClashQueryMode('PDB-CODE') &&
              this.switchAaClashQueryMode('PDB-CODE') }
              active={this.state.aaClashQueryMode === 'PDB-CODE'}>PDB-CODE (default)</Button>
              <Button color="info" onClick={ () => this.props.switchAaClashQueryMode('FILE') &&
              this.switchAaClashQueryMode('FILE') }
              active={this.state.aaClashQueryMode === 'FILE'}>PDB FILE</Button>
            </ButtonGroup>
          </div>
          
          <div className='col-12 col-lg-9 App-body-col2'>
            {this.props.aaClashQuery.queryMode === 'PDB-CODE' ? (
              <Form onSubmit={this.submitAaClashQuery}>
              <FormGroup row>
                <Col lg={3}>
                  {displayAaClashQueryExample(AaClashQueryExample)}
                  <CardText style={{ color: '#fd9a24', marginTop: '1rem' }}>
                  {this.state.queryErrMsg}</CardText>
                </Col>
                <Col lg={8}>
                  <Label style={{ marginTop: '0.5rem' }} 
                  htmlFor="aaClashInput">AA-Clash query:</Label>
                  <Input type="textarea" id="aaClashInput" name="aaClashInput"
                  onChange={this.handleAaClashQueryInput}
                  onBlur={this.handleAaClashQueryBlur}
                  valid={this.state.queryFormValue.match(AA_SUB_ENTRY_REGEX) !== null}
                  invalid={!AA_SUB_ENTRY_REGEX.test(this.state.queryFormValue)}
                  rows="11" placeholder={AaClashQueryExample}>
                  </Input>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col lg={{ size: 10, offset: 2 }}>
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
