// a shared library of self-defined functions
import { AMINO_ACIDS, AA_1_TO_3, AA_3_TO_1 } from './Consts';
import { Dictionary, isEmpty } from 'lodash';

// functions for lifecycle methods/useLayoutEffect hooks in MolComponents
export const appendSyncScript = (scriptToAppend: string): void => {
  const script: HTMLScriptElement = document.createElement('script');
  script.className = 'embeddedSyncJS';
  script.src = scriptToAppend;
  script.async = false;
  document.body.appendChild(script);
};
export const appendAsyncScript = (scriptToAppend: string): void => {
  const script: HTMLScriptElement = document.createElement('script');
  script.className = 'embeddedAsyncJS';
  script.src = scriptToAppend;
  script.async = true;
  document.body.appendChild(script);
};
export const removeSyncScriptBySrc = (givenSrc: string): void => {
  const scripts: HTMLCollectionOf<Element> = document.getElementsByClassName(
    'embeddedSyncJS'
  );
  if (scripts.length === 0) {
    console.log(`No embedded sync scripts were found, can't remove any!`);
  } else {
    for (let i = scripts.length - 1; i >= 0; i--) {
      const foundScript: Element = scripts[i];
      if (
        foundScript.nodeName === 'SCRIPT' &&
        (foundScript as HTMLScriptElement).async === false &&
        (foundScript as HTMLScriptElement).src === givenSrc
      ) {
        document.body.removeChild(foundScript);
        break;
      }
      console.log(
        `This element with a className "embeddedSyncJS" isn't a sync script element with 'src' as "${givenSrc}" !`
      );
    }
  }
};
export const removeAsyncScriptBySrc = (givenSrc: string): void => {
  const scripts: HTMLCollectionOf<Element> = document.getElementsByClassName(
    'embeddedAsyncJS'
  );
  if (scripts.length === 0) {
    console.log(`No embedded async scripts were found, can't remove any!`);
  } else {
    for (let i = scripts.length - 1; i >= 0; i--) {
      const foundScript: Element = scripts[i];
      // console.log(`${foundScript.nodeName}  ${(foundScript as HTMLScriptElement).async}  ${(foundScript as HTMLScriptElement).src}`)
      if (
        foundScript.nodeName === 'SCRIPT' &&
        (foundScript as HTMLScriptElement).async === true &&
        (foundScript as HTMLScriptElement).src === givenSrc
      ) {
        document.body.removeChild(foundScript);
        // alert(`"${givenSrc}" removed!`);
        break;
      }
      console.log(
        `This element with a className "embeddedAsyncJS" isn't an async script element with 'src' as "${givenSrc}" !`
      );
    }
  }
};
export const removeAllSyncScripts = (): void => {
  const scripts: HTMLCollectionOf<Element> = document.getElementsByClassName(
    'embeddedSyncJS'
  );
  if (scripts.length === 0) {
    console.log(`No embedded sync scripts were found, can't remove any!`);
  } else {
    for (let i = scripts.length - 1; i >= 0; i--) {
      const foundScript: Element = scripts[i];
      foundScript.nodeName === 'SCRIPT' &&
      (foundScript as HTMLScriptElement).async === false
        ? document.body.removeChild(foundScript)
        : console.log(
            `This element with a className "embeddedSyncJS" isn't a sync script element!`
          );
    }
  }
};
export const removeAllAsyncScripts = (): void => {
  const scripts: HTMLCollectionOf<Element> = document.getElementsByClassName(
    'embeddedAsyncJS'
  );
  if (scripts.length === 0) {
    console.log(`No embedded async scripts were found, can't remove any!`);
  } else {
    for (let i = scripts.length - 1; i >= 0; i--) {
      const foundScript: Element = scripts[i];
      foundScript.nodeName === 'SCRIPT' &&
      (foundScript as HTMLScriptElement).async === true
        ? document.body.removeChild(foundScript)
        : console.log(
            `This element with a className "embeddedAsyncJS" isn't an async script element!`
          );
    }
  }
};

// functions for processing of aaClash queries in both pdb-code and pdb-file mode
export const processedPdbId = (pdbQuery: string): string => 
pdbQuery && pdbQuery.replace(/^\s+|\s+$/g, '').toUpperCase();
export const processedCodeQueries = (pdbIds: Array<string>, aaSubs: Array<string>) => {
  const codeQueries: Array<PdbIdAaQuery> = [];
  aaSubs.map((aaSub, index) => {
    const splitStrings = aaSub.toUpperCase().split(/\s+/).filter(str => str.length > 0);
    const JOB_TIME = new Date().toISOString();
    const RANDOM_SUFFIX = Math.round(Math.random() * 1E8);
    const QUERY_ID = `${pdbIds[index]}_${JOB_TIME}${RANDOM_SUFFIX}`.replace(/[-:\.\/]/gi,'');
    codeQueries.push({ pdbId: pdbIds[index], aaSubs: splitStrings, queryId: QUERY_ID });
  });
  return codeQueries;
}
export const processedFileQuery = (fileName: string|undefined|null, aaSubs: Array<string>): 
PdbFileQueryStore | null => {
  const aaSubArray: Array<string> = [];
  fileName && aaSubs.map(aaSub => {
    aaSub && aaSubArray.push(aaSub.replace(/^\s+|\s+$/g, '').toUpperCase());
  });
  if(fileName) {
    const JOB_TIME = new Date().toISOString();
    const RANDOM_SUFFIX = Math.round(Math.random() * 1E8);
    const QUERY_ID = `${JOB_TIME}${RANDOM_SUFFIX}_${fileName}`.replace(/[-:\.\/]/gi,'');
    return { fileName: fileName, aaSubs: aaSubArray, queryId: QUERY_ID };
  }
  return null;
}
export const uniquePdbIds = (queries: Array<PdbIdAaQuery>): Array<string> => {
  if (queries.length > 1) {
    const pdbIds: Array<string> = [];
    queries.map(query => pdbIds.push(query.pdbId.toUpperCase()));
    return pdbIds.filter((value, index, self) => self.indexOf(value) === index);
  } else if (queries.length === 1) {
    return [queries[0].pdbId.toUpperCase()]
  }
  return [];
}
export const uniqueStrings = (query: Array<string>): Array<string> => {
  if (query.length > 1) {
    return query.filter((value, index, self) => self.indexOf(value) === index);
  } else if(query.length === 1) {
    return query
  }
  return [];
}

// function(s) to beautify & format results of AA-Clash prediction
export const formattedAaClashPred = (aaClashPred: AaClashPredData): 
{ goodList: Array<string>, badList: Array<string> } => {
   const goodAAs = aaClashPred.goodAcids as Dictionary<Dictionary<string>>;
   const badAAs = aaClashPred.badAcids as Dictionary<string[]>;
   const output = { goodList: <Array<string>>[] , badList: <Array<string>>[] };
   Object.keys(goodAAs).map(chain_pos => {
     let chain=''; 
     let pos='';
     let old_aa='';
     const CHAIN_REG_MATCH = chain_pos.match(/([A-Z])(?=_\w\d+)/i);
     if (CHAIN_REG_MATCH) { chain = CHAIN_REG_MATCH[0] }
     const POS_REG_MATCH = chain_pos.match(/(?<=[A-Z]_)(\w\d+)/i);
     if (POS_REG_MATCH) { 
       pos = POS_REG_MATCH[0]; 
       const OLD_AA_MATCH = pos.match(/\w(?=\d+)/i);
       if (OLD_AA_MATCH) { old_aa = OLD_AA_MATCH[0] }
     }
 
     if ( !isEmpty(goodAAs[chain_pos]) ) {
       Object.keys(goodAAs[chain_pos]).map(goodAA => {
         (chain.length > 0 && pos.length > 0) && 
         output.goodList.push(`chain: ${chain}, original(substituted) amino acid: ${AA_1_TO_3[old_aa]}(${old_aa}), position: ${pos.substring(1, pos.length)}, new amino acid: ${goodAA}(${AA_3_TO_1[goodAA]})`)
       });
     } 
     if (badAAs[chain_pos].length > 0){
       badAAs[chain_pos].map(badAA => {
         (chain.length > 0 && pos.length > 0) && 
         output.badList.push(`chain: ${chain}, original(substituted) amino acid: ${AA_1_TO_3[old_aa]}(${old_aa}), position: ${pos.substring(1, pos.length)}, new amino acid: ${badAA}(${AA_3_TO_1[badAA]})`)
       })
     }
   });
   return output;
}
export const aaClashPredGoodBad = (aaClashPred: AaClashPredData): 
{ goodList: Array<string>, badList: Array<string> } => {
   const goodAAs = aaClashPred.goodAcids as Dictionary<Dictionary<string>>;
   const badAAs = aaClashPred.badAcids as Dictionary<string[]>;
   const output = { goodList: <Array<string>>[] , badList: <Array<string>>[] };
   Object.keys(goodAAs).map(chain_pos => {
     let chain=''; 
     let pos='';
     let old_aa='';
     const CHAIN_REG_MATCH = chain_pos.match(/([A-Z])(?=_\w\d+)/i);
     if (CHAIN_REG_MATCH) { chain = CHAIN_REG_MATCH[0] }
     const POS_REG_MATCH = chain_pos.match(/(?<=[A-Z]_)(\w\d+)/i);
     if (POS_REG_MATCH) { 
       pos = POS_REG_MATCH[0]; 
       const OLD_AA_MATCH = pos.match(/\w(?=\d+)/i);
       if (OLD_AA_MATCH) { old_aa = OLD_AA_MATCH[0] }
     }
 
     if ( !isEmpty(goodAAs[chain_pos]) ) {
       Object.keys(goodAAs[chain_pos]).map(goodAA => {
         (chain.length > 0 && pos.length > 0) && 
         output.goodList.push(`chain${chain}_${old_aa}${pos.substring(1, pos.length)}${AA_3_TO_1[goodAA]}`)
       });
     } 
     if (badAAs[chain_pos].length > 0){
       badAAs[chain_pos].map(badAA => {
         (chain.length > 0 && pos.length > 0) && 
         output.badList.push(`chain${chain}_${old_aa}${pos.substring(1, pos.length)}${AA_3_TO_1[badAA]}`)
       })
    }
   });
   return output;
}
 