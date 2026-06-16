import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res);

  if (req.method === 'GET') {
    const { userId, stateId } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (stateId) where.stateId = stateId;

    try {
      const applications = await prisma.application.findMany({ where });
      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
    }
  }

  if (req.method === 'POST') {
    const { refNo, userId, stateId, schemeId, schemeName, formData, status } = req.body;

    if (!refNo || !userId || !stateId || !schemeId || !schemeName) {
      return res.status(400).json({ error: 'Missing required fields: refNo, userId, stateId, schemeId, schemeName' });
    }

    try {
      const existing = await prisma.application.findUnique({
        where: { refNo },
      });

      if (existing) {
        return res.status(200).json(existing);
      }

      const now = new Date();
      const initialStatus = status || 'PENDING';

      const application = await prisma.application.create({
        data: {
          refNo,
          userId,
          stateId,
          schemeId,
          schemeName,
          formData: formData || {},
          status: initialStatus,
          statusHistory: [
            {
              status: initialStatus,
              note: 'Application created',
              timestamp: now.toISOString(),
            },
          ],
          createdAt: now,
          updatedAt: now,
        },
      });

      return res.status(201).json(application);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create application', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
