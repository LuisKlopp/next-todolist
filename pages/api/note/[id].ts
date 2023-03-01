import { prisma } from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body.data);
  console.log(req.query.id);
  const noteId = req.query.id;

  if (req.method === 'DELETE') {
    const note = await prisma.note.delete({
      where: {
        id: Number(noteId),
      },
    });
    res.json(note);
  } else if (req.method === 'PUT') {
    const { title, content, id } = req.body.data;
    const note = await prisma.note.update({
      where: {
        id: Number(id),
      },
      data: {
        id,
        title,
        content,
      },
    });
    res.json(note);
  }
}
