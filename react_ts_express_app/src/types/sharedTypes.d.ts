// types declared here can be used universally without import

//Generic Redux-Action Type
type PayloadAction = { type: string, payload?: T }

// types about result of aa-clash prediction by Jelena's python codes
type AaClashPredData = {
  queryId: string,
  jobName: string,
  angles: object,
  goodAcids: object,
  badAcids: object,
  matrices: object
}
type PyScriptResponse = {
  code: number,
  signal?: string,
  finalText: string
}
type AaClashDataToClient = {
  aaClash: AaClashPredData | Array<AaClashPredData>,
  pyRunInfo: PyScriptResponse
}

// interface declaration for Pdb-File Query Form
interface PdbQueryFormData extends FormData {
  append(name: string, value: File, fileName?: string): void;
  set(name: string, value: File, fileName?: string): void;
}

// Redux type declaration for AA-Clash prediction
type PdbIdAaQuery = {
  queryId: string;
  pdbId: string;
  aaSubs: Array<string | AaSub>;
};
type PdbFileQueryStore = {
  fileName: string;
  queryId: string; 
  aaSubs: Array<string>; 
}

type AaClashCodePayload = { queries: Array<PdbIdAaQuery>, predResults: Array<AaClashPredData> };
type AaClashFilePayload = { query: PdbFileQueryStore, predResult: AaClashPredData };

type AaClashQueryState = {
  queryMode: 'PDB-CODE' | 'FILE';
  queries: Array<PdbIdAaQuery>;
  fileQuery: PdbFileQueryStore | null;
  queryHistory: Array<PdbIdAaQuery>;
  fileQueryHistory: Array<PdbFileQueryStore>;
  codePredResults: Array<AaClashPredData>;
  filePredResult: AaClashPredData | null;
  codePredResultHistory: Array<AaClashPredData>; 
  filePredResultHistory: Array<AaClashPredData>;
  isLoading: boolean;
  errMsg: string | Array<string> | null;
  codeQueryFormValue: string;
  fileQueryFormValue: string;
};

// type definitions for sub-components after aa-clash query
type RcsbGraphQlState = {
  displayMode: 'latest' | 'history',
  selectedPdbId?: string,
  indpPdbIdQueries: Array<string>
}
type AaSubDetailed = {
  chain: string;
  oldAa: string;
  pos: number;
  newAa: string;
  pred: 'good' | 'bad';
}
type AaSub = {
  chain: string;
  oldAa?: string;
  pos: number | string;
  // 'target' has to be one of the 20 amino acids
  target: string;
};
type JmolPdbAaSubs = {
  pdbToLoad: string,
  aaSubs: Array<AaSub|AaSubDetailed>,
  chainList?: string[];
  zoomedInAa?: AaSub|AaSubDetailed,
}
type Mol3DPdbAa = {
  pdbToLoad: string,
  aaPoses: Array<Omit<AaSub, 'target'|'oldAa'>>,
  chainList?: string[];
  zoomedInAa?: Omit<AaSub, 'target' | 'oldAa'>,
}
type IndpMolQueryPayload = { query: Array<JmolPdbAaSubs|Mol3DPdbAa>, mode: 'Jmol'|"3Dmol" }
type MolComponentState = {
  displayMode: 'latest' | 'history',
  molVisChoice: 'Jmol'|'3Dmol',
  jmolPdbAaSubs: JmolPdbAaSubs,
  mol3DPdbAa: Mol3DPdbAa,
  indpPdbIdQueries: {mol3d: Array<Mol3DPdbAa>, jmol: Array<JmolPdbAaSubs>}
}
type MolDisplayState = {
  divHidden: boolean;
};
type SubMolProps = { pdbId: string, aaPreds: { goodList: Array<AaSubDetailed>, badList: Array<AaSubDetailed> } }
type JmolDisplayOptions = {
  backboneOnly: boolean;
  alphaCbOnly: boolean;
  highLightSelected: boolean;
  wireFrameOnly: boolean;
  selectedChain: string; //select a whole sidechain and highlight it
}

// pdb to uniprot residue mapping
type PdbResidueToUniprot = {
  pdbId: string,
  pdbChain: string,
  pdbPos: string,
  pdbAa: string;
  uniId: string,
  uniPos: string|number,
  uniAa: string;
}

// combined store for App
type AppReduxState = { aaClashQuery: AaClashQueryState, rcsbGraphQl: RcsbGraphQlState, molVis: MolComponentState } 
