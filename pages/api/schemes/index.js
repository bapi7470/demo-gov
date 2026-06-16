import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId } = req.query
      const where = stateId ? { stateId } : {}
      const [official, custom] = await Promise.all([
        prisma.scheme.findMany({ where, orderBy: { createdAt: 'asc' } }),
        prisma.customScheme.findMany({ where }),
      ])
      const customMapped = custom.map(s => ({ ...s, name: s.title, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch schemes' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, description, benefit, eligibility, documents, deadline, category, formFields, createdBy } = req.body
      if (!stateId) {
        return res.status(400).json({ error: 'stateId is required' })
      }
      const scheme = await prisma.customScheme.create({
        data: { stateId, title, description, benefit, eligibility, documents, deadline, category, formFields, createdBy },
      })
      return res.status(201).json(scheme)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create scheme' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, stateId } = req.query
      if (!id) {
        return res.status(400).json({ error: 'id is required' })
      }
      const existing = await prisma.customScheme.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ error: 'Scheme not found' })
      }
      if (stateId && existing.stateId !== stateId) {
        return res.status(403).json({ error: 'Forbidden: stateId does not match' })
      }
      await prisma.customScheme.delete({ where: { id } })
      return res.status(200).json({ message: 'Scheme deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete scheme' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
