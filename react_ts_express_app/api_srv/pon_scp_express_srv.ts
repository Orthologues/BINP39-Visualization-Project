import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import multer from 'multer';
import { PORT_NUM, AA_CLASH_PREFIX } from './constants.js';
import handlePdbCodeQuery, { handlePdbFileQuery } from './routes/aaClashPred.js'; 
import dlJobIdPdbFile from './routes/jobIdToPdbFile.js';
import pdbResidueToUniprot from './routes/pdbToUnipResMapping.js'

const app = express();
const PORT = process.env.PORT || PORT_NUM;

// middle-wares 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// run python scripts of PON-SC
app.post("/pon-scp/pred/code", handlePdbCodeQuery);

const pdbMulter = multer({ dest: `${AA_CLASH_PREFIX}/extra_files/` });
app.post("/pon-scp/pred/file", pdbMulter.single('pdbFile'), handlePdbFileQuery);

// download pdb-file of finished aa-clash queries according to job_id & pdb_id & chain & AA-sub
app.post("/pon-scp/pdb/:job_id", dlJobIdPdbFile);

// use tool at https://github.com/mgalardini/pdb2uniprot for residue-level mapping for variant identification
app.get("/pon-scp/pdb-to-unip/:pdb_id", pdbResidueToUniprot);

app.listen(PORT, () => console.log(`Express.js server for PON-SC+ is listening on port ${PORT}`));