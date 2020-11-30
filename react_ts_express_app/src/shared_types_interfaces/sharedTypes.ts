export type molProps = {
    aaPos?: string[]; //list of amino acid positions from client's query
    pdbQuery: string;
}

export type molDisplayState = {
    divHeight?: number; 
    divHidden: boolean;
}