import express from "express";
import bodyParser from "body-parser";
import ponSC_result, { tryPyStdout } from "./routes/pon-sc.js";
import mapUniProtID from "./routes/pdbE.js";

const app = express();
const port = process.env.PORT || 3010;

// middle-wares 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// pdbE
app.get("/pdb-e/:pdb_id", mapUniProtID);

// run python scripts of PON-SC
app.get("/pon-sc/:pdb_id", tryPyStdout);
app.get("/pon-sc/:pdb_id/results", ponSC_result);
app.post("/pon-sc/:pdb_id/results", async (req: express.Request, res: express.Response) => {
    res.send(`${await req.body.results} received!`);
});

app.listen(port, () => console.log(`ExpressJs server is listening on port ${port}`));