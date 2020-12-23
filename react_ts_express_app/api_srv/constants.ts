// define port number and url prefix of the api server
export const portNum = 3010;
const urlPrefix = `http://localhost:${portNum.toString()}`;
export default urlPrefix; 

// absolute path of python binary
export const pyPath = '/usr/local/Caskroom/miniconda/base/bin/python';
// absolute path of aaclash scripts
export const aaClashPrefix = '/Users/jiaweizhao/Desktop/BINP39/BINP39-Visualization-Project/react_ts_express_app/api_srv/dist/src/aaclash';

//pdbE 
export const pdbeWebPrefix = 'https://www.ebi.ac.uk/pdbe/entry/pdb';
export const pdbeApiPrefix = 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary';

// api-server authentication
export const AACLASH_API_AXIOS_AUTH = {
    user: 'jiawei_zhao',
    pwd: '7NEJEz69adpVqG3k'
};