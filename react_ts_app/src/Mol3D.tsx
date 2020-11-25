import React, { useState, useEffect } from 'react';
// import { render } from 'react-dom';
// import $ from 'jquery';

type molProps = {
    id: string;
    pdbQuery: string;
}

type molDisplayState = {
    divHeight: number;
    divHidden: boolean;
}

function Mol3D(props: molProps) {

    const [molState, setMolState] = useState<molDisplayState>({ divHeight: 0, divHidden: true });
    const pdb_code = props.pdbQuery.replace(/^\s+|\s+$/g, '').toUpperCase();

    function divToggle() {
        setMolState(prevState => {
            return {
                ...prevState,
                divHidden: !prevState.divHidden
            }
        });
    }

    useEffect((): void => { 
        console.log("display status changes");
    }, [molState]);

    return (
        <div id="Mol3D-div">
            <button id="3DmolBtn"
                className="btn btn-warning btn-sm"
                onClick={divToggle}>
                {molState.divHidden ? `Show 3Dmol of pdbID ${pdb_code}` : `Hide 3Dmol of pdbID ${pdb_code} below`}
            </button>
            <div className="mol-container"
                style={molState.divHidden ? { display: 'none' } : {}}
            ></div>
        </div>
    );
}

export default Mol3D;

// class Mol extends Component {

//     componentDidMount() {
//         $(".mol-container").hide();
//         $("#3dmolBtn").click(() => {
//             $(".mol-container").show();
//             let pdb_code: string = " 6vxx";
//             pdb_code = pdb_code.replace(/^\s+|\s+$/g, '');
//             console.log(pdb_code);
//             // 3dmol
//             let element = $(".mol-container");
//             let config: Object = {
//                 backgroundColor: 0xfffffff
//             };
//             let viewer: any = $3dmol.createViewer(element, config);
//             $3dmol.download(`pdb:${pdb_code}`, viewer, {
//                 onemol: true,
//                 multimodel: true
//             }, (m) => {
//                 m.setStyle({
//                     'cartoon': {
//                         colorscheme: {
//                             prop: 'ss',
//                             map: $3dmol.ssColors.Jmol
//                         }
//                     }
//                 });
//                 viewer.zoomTo();
//                 viewer.render();
//             });
//             viewer.setBackgroundColor('lightgrey');
//             viewer.zoom(1, 2000);
//         });
//     }

//     render() {
//         return (
//             <div className="mol-container">
//                 <button id="3dmolBtn" className="btn btn-warning btn-sm">See 3Dmol of 6VXX</button>
//             </div>
//         );
//     }
// }
