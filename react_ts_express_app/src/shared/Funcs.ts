// a shared library of self-defined functions
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

export const processedPdbId = (pdbQuery: string): string => 
pdbQuery && pdbQuery.replace(/^\s+|\s+$/g, '').toUpperCase();

export const processedCodeQueries = (pdbIds: Array<string>, aaSubs: Array<string>) => {
  const results: Array<PdbIdAaQuery> = [];
  aaSubs.map((aaSub, index) => {
    let splitStrings = aaSub.toUpperCase().split(/\s+/).filter(str => str.length > 0);
    results.push({ pdbId: pdbIds[index], aaSubs: splitStrings });
  });
  return results;
}

export const processedFileQuery = (aaSubs: Array<string>) => {
  
}

export const uniquePdbIds = (queries: Array<PdbIdAaQuery>): Array<string> => {
  if (queries.length > 1) {
    const pdbIds: Array<string> = [];
    queries.map(query => pdbIds.push(query.pdbId));
    return pdbIds.filter((value, index, self) => self.indexOf(value) === index);
  } else if (queries.length === 1) {
    return [queries[0].pdbId]
  }
  return [];
}