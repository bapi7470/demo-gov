import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res);
  const { refNo } = req.query;
  const normalizedRefNo = refNo ? refNo.toUpperCase() : null;

  if (!normalizedRefNo) {
    return res.status(400).json({ error: 'Missing refNo' });
  }

  if (req.method === 'GET') {
    try {
      const application = await prisma.application.findUnique({
        where: { refNo: normalizedRefNo },
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      return res.status(200).json(application);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch application', details: error.message });
    }
  }

  if (req.method === 'PUT') {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing required field: status' });
    }

    try {
      const existing = await prisma.application.findUnique({
        where: { refNo: normalizedRefNo },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const now = new Date();
      const currentHistory = Array.isArray(existing.statusHistory) ? existing.statusHistory : [];

      const updatedHistory = [
        ...currentHistory,
        {
          status,
          note: note || '',
          timestamp: now.toISOString(),
        },
      ];

      const application = await prisma.application.update({
        where: { refNo: normalizedRefNo },
        data: {
          status,
          statusHistory: updatedHistory,
          updatedAt: now,
        },
      });

      return res.status(200).json(application);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update application', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
