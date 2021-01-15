// types declared here can be used universally without import

type MolProps = {
  aaPos?: Array<number>; //list of amino acid positions from client's query
  pdbQueries: Array<PdbIdAaQuery>;
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
  aaSubs: Array<AaSub | string>;
};

// Redux type declaration
type AaClashPayload = { queries: Array<PdbIdAaQuery>, predResults: Array<AaClashPredData> };

type PayloadAction = {
  type: string;
  payload?: T;
};

type AaClashQueryState = {
  queryMode: string;
  queries: Array<PdbIdAaQuery>;
  queryHistory: Array<PdbIdAaQuery>;
  predResults: Array<AaClashPredData>;
  predResultsHistory: Array<AaClashPredData>; 
  isLoading: boolean;
  errMsg: string | Array<string> | null;
};

type RcsbGraphQlState = {
  displayMode: string,
  selectedQuery?: PdbIdAaQuery
}

type AppReduxState = { aaClashQuery: AaClashQueryState, rcsbGraphQl: RcsbGraphQlState } 

// types about result of aa-clash prediction by Jelena's python codes
type AaClashPredData = {
  jobName?: string,
  angles?: object,
  goodAcids?: object,
  badAcids?: object,
  matrices?: object
}

type PyScriptResponse = {
  code: number,
  signal?: string,
  finalText: string
}

type AaClashDataToClient = {
  aaClash: AaClashPredData,
  pyRunInfo: PyScriptResponse
}
