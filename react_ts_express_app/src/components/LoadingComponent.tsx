import React from 'react';

const Loading = (): JSX.Element => {
    return(
        <div className="col-12 App-header-col1">
            <span className="fa fa-spinner fa-pulse fa-3x fa-fw text-primary"></span>
            <p>Loading . . .</p>
        </div>
    );
};

export default Loading;