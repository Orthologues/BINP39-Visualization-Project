import { Request, Response } from 'express';

export default function dlJobIdPdbFile(req: Request, res: Response) {
  const jobId: string = req.params.job_id;
};