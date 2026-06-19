import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const sectors = await prisma.govSector.findMany({ orderBy: { name: 'asc' } })
    return res.status(200).json(sectors)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sectors' })
  }
}
