import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { id, stateId } = req.query
    if (id) {
      const org = await prisma.privateOrg.findUnique({ where: { id } })
      if (!org) return res.status(404).json({ error: 'Organisation not found' })
      return res.status(200).json(org)
    }
    const where = stateId ? { stateId } : {}
    const orgs = await prisma.privateOrg.findMany({ where, orderBy: { name: 'asc' } })
    return res.status(200).json(orgs)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch organisations' })
  }
}
