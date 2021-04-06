import React, { FC } from 'react';

type LoadingProps = { text: string; }

const Loading: FC<LoadingProps> = (props) => {
    return(
        <div className="col-12 App-body-col1">
            <span className="fa fa-spinner fa-pulse fa-3x fa-fw text-primary"></span>
            <p>{props.text}</p>
        </div>
    );
};

export default Loading;