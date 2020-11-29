import express from 'express';

export default function mapUniprotID(req: express.Request, res: express.Response) {
  const pdb_id: string = req.params.pdb_id;
  res.send(`<h1>express: Requested PDBid is \"${pdb_id}\"</h1>`);
};