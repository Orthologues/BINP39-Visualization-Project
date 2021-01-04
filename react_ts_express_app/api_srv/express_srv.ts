import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import { PORT_NUM } from './constants.js';
import handlePdbCodeQuery, { handlePdbFileQuery } from './routes/aaClashPred.js'; 
import dlJobIdPdbFile from './routes/jodId-pdbFile.js';

const app = express();
const PORT = process.env.PORT || PORT_NUM;

// middle-wares 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// run python scripts of PON-SC
app.post("/pon-scp/pred/code", handlePdbCodeQuery);
app.post("/pon-scp/pred/file", handlePdbFileQuery);

// download pdb-file of finished aa-clash queries according to job_id & pdb_id & chain & AA-sub
app.post("/pon-scp/pdb/:job_id", dlJobIdPdbFile);

app.listen(PORT, () => console.log(`ExpressJs server is listening on port ${PORT}`));