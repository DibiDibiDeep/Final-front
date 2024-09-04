import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id, diary_id, fairy_tale_id, user_id, content } = req.body;
      
      // 여기에 데이터베이스 업데이트 로직을 구현하세요
      // 예: const updatedMemo = await updateMemoInDatabase(id, content);

      // 임시 응답 (실제로는 데이터베이스에서 업데이트된 데이터를 반환해야 함)
      const updatedMemo = { id, diary_id, fairy_tale_id, user_id, content };

      res.status(200).json(updatedMemo);
    } catch (error) {
      res.status(500).json({ message: 'Error updating memo' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}