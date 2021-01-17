import React, { FC } from 'react';

const Loading: FC<any> = () => {
    return(
        <div className="col-12 App-body-col1">
            <span className="fa fa-spinner fa-pulse fa-3x fa-fw text-primary"></span>
            <p>Loading . . .</p>
        </div>
    );
};

export default Loading;