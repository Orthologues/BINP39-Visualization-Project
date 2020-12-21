// types declared here can be used universally without import

type molProps = {
  aaPos?: number[]; //list of amino acid positions from client's query
  pdbQuery: string;
};

type molDisplayState = {
  divHeight?: number;
  divWidth?: number;
  divHidden: boolean;
};

// type aminoAcid = 'A'|'R'|'N'|'D'|'C'|'Q'|'E'|'G'|'H'|'I'|'L'|'K'|'M'|'F'|'P'|'S'|'T'|'W'|'Y'|'V';
// such type checking is useless since ${typeof 'A'} would return to 'string'
type aaSub = {
  pos: number,
  // 'target' has to be one of the 20 amino acids
  target: string
}

type pdbIdAaQuery = {
  pdbId: string,
  aaSubs: aaSub[]
}
