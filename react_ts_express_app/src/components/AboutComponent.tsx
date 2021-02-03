import React, { FC } from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap';

const GENERAL_INTRO_TEXT = `This web-app was developed for protein variation analysis. With the help of this tool, structural reasons behind the loss of stability in protein structure due to amino acid substitution can be analysed; also, unknown protein variants can be modeled and conclusions on sterical effect of substitutions can be made.
AA-Clash Prediction(home) part of this web-app calculates the distances between atoms of the new substituted amino acids and the surrounding atoms in the protein structure and identifies if clashes in the structure would form or not. Clash is considered to be a strong overlap between van der Waals radii of the atoms.
Input for AA-Clash prediction can be provided in 2 ways: either uploading your own PDB format file or listing PDB database accession codes. In both cases, a list of specific positions and/or substitutions can be provided.
This web-app also provides molecular visualization for PDB-ID and specific AA-substitutions of AA-Clash code-queries by Jmol. Additionally, visualization by 3Dmol is available.
UI-access to RCSB-PDB's API to fetch basic information of PDB-IDs of AA-Clash code-queries, as well as mapping to relevant Uniprot-IDs, are available at this web-app as well.
`;

const CODE_QUERY_TEXT = `PDB accession codes and positions/substitutions of interest should be provided in an extended fasta format(multiple subs with space(s) as deliminator in one line would be possible).
Example:
>1asd
A101S 106I
115P
>2zxc
L310R
487`;

const FILE_QUERY_TEXT = `Submitted file should follow PDB format. Positions and substitutions of interest can be provided in the box(multiple subs with space(s) as deliminator in one line would be possible).
Example:
96L 99V
A101S
115P`;

const OUTPUT_INTRO_TEXT = `Output of the program is a table of analysed substitutions with identification if the clash would form or not and structural visualization of the protein structure and substitutions, as well as mapping to Uniprot-IDs, along with UI-access to basic functional and structural information from RCSB-PDB's API according to PDB-ID & Uniprot-ID queries. 
History of AA-Clash queries in PDB-CODE mode would be preserved in local storage until deletion by client side's clicking event. 
If an e-mail address is provided, the link with the output is sent to the user.
`;

const textWithNewLines = (textStr: string) => {
    if (textStr) {
      return (
      <React.Fragment>
        {textStr.split('\n').map((line, index) => 
        (
          <CardText style={{margin: 0}}
          key={`${line.substr(0, 5)}_${index}`}>
            {line.substr(0, 7) === 'Example' ? (<b>{line}</b>) : line}
          </CardText>
        ))}
      </React.Fragment>) 
    }
    return (<React.Fragment></React.Fragment>) 
  }

const AboutComponent: FC<any> = () => {
    return (
      <div className='container-fluid' style={{textAlign: 'left', marginTop: 72, marginBottom: 10}}>
        <div className='row'>
            <div className='col-12 col-lg-4'>
              <Card>
                <CardHeader><CardTitle tag='h3'>Amino acid substitution clash detection</CardTitle></CardHeader>
                <CardBody>{textWithNewLines(GENERAL_INTRO_TEXT)}</CardBody>
              </Card>
            </div>
            <div className='col-12 col-lg-4'>
              <Card>
                <CardHeader><CardTitle tag='h3'>Submit queries</CardTitle></CardHeader>
                <CardHeader>
                  <CardTitle tag='h5'>1. Submitting structures by PDB accession codes</CardTitle>  
                </CardHeader>
                <CardBody> 
                  {textWithNewLines(CODE_QUERY_TEXT)}  
                </CardBody>
                <CardHeader>
                  <CardTitle tag='h5'>2. Submitting a structure as a file</CardTitle>    
                </CardHeader>
                <CardBody>
                  {textWithNewLines(FILE_QUERY_TEXT)}
                  <a className='nav-link' href="http://www.wwpdb.org/documentation/file-format" 
                  target="_blank">
                  See instructions for PDB format here</a>
                </CardBody>
              </Card>
            </div>
            <div className='col-12 col-lg-4'>
              <Card>
                <CardHeader><CardTitle tag='h3'>Output</CardTitle></CardHeader>
                <CardBody>{textWithNewLines(OUTPUT_INTRO_TEXT)}</CardBody>
              </Card>
            </div>
        </div>
      </div>
    )
}

export default AboutComponent;