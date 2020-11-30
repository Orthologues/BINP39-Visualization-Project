import React, { Component } from 'react';
// import { render } from 'react-dom';
import $ from 'jquery';
import { molProps, molDisplayState } from '../sharedTypesInterfaces/sharedTypes'

class JsMol extends Component<molProps, molDisplayState> {

  constructor(props: molProps) {
    super(props);
    this.state = {
      divHeight: 0,
      divHidden: true,
    } as molDisplayState;
    this.divToggle = this.divToggle.bind(this);
  }

  divToggle() {
    this.setState((prevState) => ({
      ...prevState,
      divHidden: !prevState.divHidden
    }));
  }

  processedPdbQuery(): string {
    return this.props.pdbQuery.replace(/^\s+|\s+$/g, '').toUpperCase();
  }

  componentDidUpdate() {

    if (this.state.divHidden === false) {
      let testJmol: string = 'myJmol';
      let pdb_code = this.processedPdbQuery();
      let JmolInfo: object = {
        width: '100%',
        height: '100%',
        color: '#E2F4F4',
        j2sPath: '/assets/JSmol/j2s',
        serverURL: '/assets/JSmol/php/jsmol.php',
        script: `set zoomlarge false; set antialiasDisplay; load =${pdb_code}`,
        use: 'html5'
      }
      $('#jsmol-container').html(Jmol.getAppletHtml(testJmol, JmolInfo));
    }
  }

  render() {
    return (
      <div id="jsmol-div">
        <div className="mol-container"
          id="jsmol-container"
          style={this.state.divHidden ? { display: 'none' } : {}}
        ></div>
        <button
          className="btn btn-success btn-sm molBtn"
          onClick={this.divToggle}>
          {this.state.divHidden ? `Show JSmol of pdbID ${this.processedPdbQuery()}` : `Hide JSmol of pdbID ${this.processedPdbQuery()} above`}
        </button>
      </div>
    );
  }
}

export default JsMol;