export default (req: any, res: any) => {
  const pdb_id: string = req.params.pdb_id;
  res.send(`<h1>express: Requested PDBid is \"${pdb_id}\"</h1>`);
};