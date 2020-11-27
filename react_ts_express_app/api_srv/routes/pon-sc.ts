import { ajax } from 'jquery';

export default async (req: any, res: any) => {
    await res.send({ answer: `Your query is '${req.params.pdb_id}'` });
}

export const tryPyStdout = (req: any, res: any) => {
    const pdb_id: string = req.params.pdb_id;
    res.send(
        `I received your get request. This is what you sent me: ${pdb_id.toUpperCase()}`,
    );
    ajax({
        type: 'POST',
        url: `/pon-sc/${pdb_id}/results`,
        contentType: 'application/json',
        // JSON.stringify(obj) converts object to string
        data: JSON.stringify({ results: `PON-SC prediction for ${pdb_id} is:` }),
        dataType: 'json',
        success: res => {
            console.log(res.status);
        }
    });
};