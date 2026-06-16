import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId } = req.query
      const where = stateId ? { stateId } : {}
      const [official, custom] = await Promise.all([
        prisma.tender.findMany({ where, orderBy: { createdAt: 'asc' } }),
        prisma.customTender.findMany({ where }),
      ])
      const customMapped = custom.map(t => ({ ...t, name: t.title, estimatedValue: t.value, bidDeadline: t.lastDate, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch tenders' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, description, value, lastDate, category, department, createdBy } = req.body
      if (!stateId) {
        return res.status(400).json({ error: 'stateId is required' })
      }
      const tender = await prisma.customTender.create({
        data: { stateId, title, description, value, lastDate, category, department, createdBy },
      })
      return res.status(201).json(tender)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create tender' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, stateId } = req.query
      if (!id) {
        return res.status(400).json({ error: 'id is required' })
      }
      const existing = await prisma.customTender.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ error: 'Tender not found' })
      }
      if (stateId && existing.stateId !== stateId) {
        return res.status(403).json({ error: 'Forbidden: stateId does not match' })
      }
      await prisma.customTender.delete({ where: { id } })
      return res.status(200).json({ message: 'Tender deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete tender' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
