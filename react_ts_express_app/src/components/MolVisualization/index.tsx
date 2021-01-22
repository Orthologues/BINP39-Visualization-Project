import React, { FC } from 'react';
import JsMol from './JmolComponent';
import Mol3D from './Mol3dComponent';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';

const MolComponent: FC<any> = () => {

    const queries = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queries);
    const queryHistory = useSelector<AppReduxState, Array<PdbIdAaQuery>>(state => state.aaClashQuery.queryHistory);
    const dispatch = useDispatch<Dispatch<PayloadAction>>();
    
    return (
        <div className="mol-div">
          <JsMol key={`mol_js_`} pdbQueries={queries.length > 0 ? queries : [{queryId: '', pdbId: '', aaSubs: []}]} />
          <Mol3D key={`mol_3d_`} pdbQueries={queries.length > 0 ? queries : [{queryId: '', pdbId: '', aaSubs: []}]} />
        </div>
    )
}

export default MolComponent;