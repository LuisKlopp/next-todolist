import { prisma } from '../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'DELETE') {
    const id = req.query.id;
    const note = await prisma.note.delete({
      where: {
        id: Number(id),
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
