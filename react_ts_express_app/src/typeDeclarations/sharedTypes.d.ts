// types declared here can be used universally without import

type MolProps = {
  aaPos?: number[]; //list of amino acid positions from client's query
  pdbQueries: PdbIdAaQuery[];
};

type MolDisplayState = {
  divHeight?: number;
  divWidth?: number;
  divHidden: boolean;
};

// type aminoAcid = 'A'|'R'|'N'|'D'|'C'|'Q'|'E'|'G'|'H'|'I'|'L'|'K'|'M'|'F'|'P'|'S'|'T'|'W'|'Y'|'V';
// such type checking is useless since ${typeof 'A'} would return to 'string'
type AaSub = {
  pos: number;
  // 'target' has to be one of the 20 amino acids
  target: string;
};

type PdbIdAaQuery = {
  pdbId: string;
  aaSubs: AaSub[] | Array<string>;
};

// Redux type declaration

type AaClashQueryState = {
  queries: PdbIdAaQuery[];
  isLoading: boolean;
  errMsg: string | null;
};

type PayloadAction = {
  type: string;
  payload?: T;
};

type PdbInfoSrcState = { pdbInfoSrc: 'pdbe' | 'rcsb' };

type AppReduxState = { aaClashQuery: AaClashQueryState } & PdbInfoSrcState;

// types about result of aa-clash prediction by Jelena's python codes
type AaClashPredData = {
  jobName?: string,
  angles?: object,
  goodAcids?: object,
  badAcids?: object,
  matrices?: object
}

type PyScriptResponse = {
  code?: number,
  signal?: string,
  finalText?: string
}

type AaClashDataToClient = {
  aaClash: AaClashPredData,
  pyRunInfo: PyScriptResponse
}
