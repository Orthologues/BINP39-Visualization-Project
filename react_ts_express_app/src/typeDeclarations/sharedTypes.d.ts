// types declared here can be used universally without import

type MolProps = {
  aaPos?: number[]; //list of amino acid positions from client's query
  pdbQuery: string;
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
  aaSubs: AaSub[];
};

// Redux type declaration

type AaClashQueryState = {
  queries: PdbIdAaQuery[],
  isLoading: boolean,
  errMsg: string | null,
}

type ReduxAction = (args: T) => {
  type: string;
  payload?: T;
};

type DispatchReduxAction = (action: ReduxAction) => action;
