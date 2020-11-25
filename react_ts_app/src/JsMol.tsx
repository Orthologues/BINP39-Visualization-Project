import React, { Component } from 'react';
// import { render } from 'react-dom';
import $ from 'jquery';

type molProps = {
    id: string;
    pdbQuery: string;
}

type molDisplayState = {
    divHeight: number;
    divHidden: boolean;
    pdbID: string;
}

class JsMol extends Component<molProps, molDisplayState> {

    constructor(props: molProps) {
        super(props);
        this.state = {
            divHeight: 0,
            divHidden: true,
            pdbID: this.props.pdbQuery.replace(/^\s+|\s+$/g, '').toUpperCase()
        } as molDisplayState;
        this.divToggle = this.divToggle.bind(this);
    }

    divToggle() {
        this.setState((prevState) => ({
            ...prevState,
            divHidden: !prevState.divHidden
        }));
    }

    componentDidUpdate() {
        if (this.state.divHidden === false) {
            let testJmol: string = 'myJmol';
            let pdb_code: string = this.props.pdbQuery;
            pdb_code = pdb_code.replace(/^\s+|\s+$/g, '').toUpperCase();
            let JmolInfo: object = {
                width: '100%',
                height: '100%',
                color: '#E2F4F4',
                j2sPath: '/assets/JSmol/j2s',
                serverURL: '/assets/JSmol/php/jsmol.php',
                script: `set zoomlarge false; set antialiasDisplay; load =${pdb_code}`,
                use: 'html5'
            }
            $('.mol-container').html(Jmol.getAppletHtml(testJmol, JmolInfo));
        }
    }

    render() {
        return (
            <div id="jsmol-div">
                <button id="jsmolBtn"
                    className="btn btn-success btn-sm"
                    onClick={this.divToggle}>
                    {this.state.divHidden ? `Show JSmol of pdbID ${this.state.pdbID}` : `Hide JSmol of pdbID ${this.state.pdbID} below`}
                </button>
                <div className="mol-container"
                    style={this.state.divHidden ? { display: 'none' } : {}}
                ></div>
            </div>
        );
    }
}

export default JsMol;