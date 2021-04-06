import React, { FC } from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap';

const DISCLAIMER_TEXT = `This non-profit server, its associated data and services are for research purposes only. The responsibility of Protein Structure and Bioinformatics Group, Lund University is limited to applying the best efforts in providing and publishing good programs and data. The developers have no responsibility for the usage of results, data or information which this server has provided.
`;
const LIABILITY_TEXT = `In preparation of this site and service, every effort has been made to offer the most current and correct information possible. We render no warranty, express or implied, as to its accuracy or that the information is fit for a particular purpose, and will not be held responsible for any direct, indirect, putative, special, or consequential damages arising out of any inaccuracies or omissions. In utilizing this service, individuals, organizations, and companies absolve Lund University or any of their employees or agents from responsibility for the effect of any process, method or product or that may be produced or adopted by any part, notwithstanding that the formulation of such process, method or product may be based upon information provided here.
`;

const DisclaimerComponent: FC<any> = () => {
    return (
      <div className='container-fluid' style={{textAlign: 'left', marginTop: 72, marginBottom: 10}}>
        <div className='row'>
            <div className='col-12 col-lg-6'>
              <Card>
                <CardHeader><CardTitle tag='h3'>Disclaimer</CardTitle></CardHeader>
                <CardBody><CardText>{DISCLAIMER_TEXT}</CardText></CardBody>
              </Card>
            </div>
            <div className='col-12 col-lg-6'>
              <Card>
                <CardHeader><CardTitle tag='h3'>Liability</CardTitle></CardHeader>
                <CardBody><CardText>{LIABILITY_TEXT}</CardText></CardBody>
              </Card>
            </div>
        </div>
      </div>
    )
}

export default DisclaimerComponent;