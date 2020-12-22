import React, { Component } from 'react';
import $ from 'jquery';
import { Navbar, NavbarBrand } from 'reactstrap';
import {
  appendAsyncScript,
  removeAsyncScriptBySrc,
  processedPdbQuery,
} from '../shared/sharedUtils';
import '../css/JsMol.css';

class JsMol extends Component<MolProps, MolDisplayState> {
  constructor(props: MolProps) {
    super(props);
    this.state = {
      divHidden: true,
    };
    this.divToggle = this.divToggle.bind(this);
    this.renderJSmolHTML = this.renderJSmolHTML.bind(this);
  }

  divToggle() {
    this.setState((prevState) => ({
      ...prevState,
      divHidden: !prevState.divHidden,
    }));
  }

  renderJSmolHTML(pdbCode: string): void {
    let testJmol = 'myJmol';
    let JmolInfo = {
      width: '100%',
      height: '100%',
      color: '#E2F4F4',
      j2sPath: '/assets/JSmol/j2s',
      serverURL: '/assets/JSmol/php/jsmol.php',
      script: `set zoomlarge false; set antialiasDisplay; load =${pdbCode}`,
      use: 'html5',
    };
    $('#jsmol-container').html(Jmol.getAppletHtml(testJmol, JmolInfo));
  }

  componentDidMount() {
    appendAsyncScript('http://localhost:3000/assets/JSmol/JSmol-min.js');
  }

  componentDidUpdate() {
    if (this.state.divHidden === false) {
      let pdb_code = processedPdbQuery(this.props.pdbQuery);
      this.renderJSmolHTML(pdb_code);
    }
  }

  //remove all innerHTML elements of "jsmol" HTMLdiv when this component unmounts
  componentWillUnmount() {
    $('#jsmol-container').empty();
    removeAsyncScriptBySrc('http://localhost:3000/assets/JSmol/JSmol-min.js');
  }

  render() {
    return (
      <div id="jsmol-div">
        <Navbar dark color="primary">
          <div style={{ margin: '0 auto' }}>
            <NavbarBrand
              href="http://jmol.sourceforge.net/"
              target="_blank"
              className="jsmolNav"
            >
              See official doc of Jmol
            </NavbarBrand>
          </div>
        </Navbar>
        <button
          className="btn btn-success btn-sm molBtn"
          onClick={this.divToggle}
        >
          {this.state.divHidden
            ? `Show JSmol of pdbID ${processedPdbQuery(this.props.pdbQuery)}`
            : `Hide JSmol of pdbID ${processedPdbQuery(
                this.props.pdbQuery
              )} above`}
        </button>
        <div
          className="mol-container"
          id="jsmol-container"
          style={this.state.divHidden ? { display: 'none' } : {}}
        ></div>
      </div>
    );
  }
}

export default JsMol;
