import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db'; // Assuming you have a db.ts file for database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { diary_id, fairy_tale_id, user_id, content } = req.body;

    if (!diary_id || !user_id || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const result = await query(
        `INSERT INTO Memo (diary_id, fairy_tale_id, user_id, created_at, content) 
         VALUES (?, ?, ?, NOW(), ?)`,
        [diary_id, fairy_tale_id, user_id, content]
      );
      
      res.status(201).json({ memoId: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving memo' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}