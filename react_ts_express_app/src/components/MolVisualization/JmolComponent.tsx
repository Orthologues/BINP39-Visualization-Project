import React, { Component } from 'react';
import $ from 'jquery';
import { Navbar, NavbarBrand } from 'reactstrap';
import { appendAsyncScript, removeAsyncScriptBySrc, processedPdbId } from '../../shared/Funcs';
import '../../css/JsMol.css';
import { FRONTEND_PREFIX } from '../../shared/Consts';

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
      j2sPath: `${FRONTEND_PREFIX}/assets/JSmol/j2s`,
      serverURL: `${FRONTEND_PREFIX}/assets/JSmol/php/jsmol.php`,
      script: `set zoomlarge false; set antialiasDisplay; load =${pdbCode}`,
      use: 'html5',
    };
    $('#jsmol-container').html(Jmol.getAppletHtml(testJmol, JmolInfo));
  }

  componentDidMount() {
    appendAsyncScript(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
  }

  componentDidUpdate() {
    if (this.state.divHidden === false) {
      let pdb_code = this.props.pdbQueries[0].pdbId;
      this.renderJSmolHTML(pdb_code);
    }
  }

  //remove all innerHTML elements of "jsmol" HTMLdiv when this component unmounts
  componentWillUnmount() {
    $('#jsmol-container').empty();
    removeAsyncScriptBySrc(`${FRONTEND_PREFIX}/assets/JSmol/JSmol-min.js`);
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
            ? `Show JSmol of pdbID ${processedPdbId(this.props.pdbQueries[0].pdbId)}`
            : `Hide JSmol of pdbID ${processedPdbId(
                this.props.pdbQueries[0].pdbId
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
