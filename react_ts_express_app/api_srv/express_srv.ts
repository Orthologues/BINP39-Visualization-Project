import bodyParser from "body-parser";
import express from "express";
import ponSC_result, { tryPyStdout } from "./routes/pon-sc";
import mapUniProtID from "./routes/pdbE";

const app = express();
const port = process.env.PORT || 3010;

// middle-wares 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('./assets'));

// pdbE
app.get("/pdb-e/:pdb_id", mapUniProtID);

// run python scripts of PON-SC
app.get("/pon-sc/:pdb_id/results", ponSC_result);
app.get("/pon-sc/:pdb_id", tryPyStdout);
app.post("/pon-sc/:pdb_id/results", async (req: any, res: any) => {
    let postResp = await req.body;
    console.log(postResp.results);
});

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`ExpressJs server is listening on port ${port}`));