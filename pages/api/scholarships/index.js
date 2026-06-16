import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId } = req.query
      const where = stateId ? { stateId } : {}
      const [official, custom] = await Promise.all([
        prisma.scholarship.findMany({ where, orderBy: { createdAt: 'asc' } }),
        prisma.customScholarship.findMany({ where }),
      ])
      const customMapped = custom.map(s => ({ ...s, name: s.title, benefit: s.amount, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch scholarships' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, description, amount, eligibility, lastDate, category, createdBy } = req.body
      if (!stateId) {
        return res.status(400).json({ error: 'stateId is required' })
      }
      const scholarship = await prisma.customScholarship.create({
        data: { stateId, title, description, amount, eligibility, lastDate, category, createdBy },
      })
      return res.status(201).json(scholarship)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create scholarship' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, stateId } = req.query
      if (!id) {
        return res.status(400).json({ error: 'id is required' })
      }
      const existing = await prisma.customScholarship.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ error: 'Scholarship not found' })
      }
      if (stateId && existing.stateId !== stateId) {
        return res.status(403).json({ error: 'Forbidden: stateId does not match' })
      }
      await prisma.customScholarship.delete({ where: { id } })
      return res.status(200).json({ message: 'Scholarship deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete scholarship' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
