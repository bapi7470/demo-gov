import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const [states, unionTerritories] = await Promise.all([
      prisma.state.findMany({ where: { type: 'state' }, orderBy: { name: 'asc' } }),
      prisma.state.findMany({ where: { type: 'union_territory' }, orderBy: { name: 'asc' } }),
    ])
    return res.status(200).json({ states, unionTerritories })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch states' })
  }
}
