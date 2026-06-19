import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { stateId } = req.query
    if (!stateId) return res.status(400).json({ error: 'stateId is required' })
    const districts = await prisma.district.findMany({
      where: { stateId },
      orderBy: { name: 'asc' },
      select: { name: true },
    })
    return res.status(200).json(districts.map(d => d.name))
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch districts' })
  }
}
