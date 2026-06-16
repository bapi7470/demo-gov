import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId } = req.query
      const where = stateId ? { stateId } : {}
      const [official, custom] = await Promise.all([
        prisma.exam.findMany({ where, orderBy: { createdAt: 'asc' } }),
        prisma.customExam.findMany({ where }),
      ])
      const customMapped = custom.map(e => ({ ...e, name: e.title, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch exams' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, description, date, lastDate, fee, eligibility, posts, category, createdBy } = req.body
      if (!stateId) {
        return res.status(400).json({ error: 'stateId is required' })
      }
      const exam = await prisma.customExam.create({
        data: { stateId, title, description, date, lastDate, fee, eligibility, posts, category, createdBy },
      })
      return res.status(201).json(exam)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create exam' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, stateId } = req.query
      if (!id) {
        return res.status(400).json({ error: 'id is required' })
      }
      const existing = await prisma.customExam.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ error: 'Exam not found' })
      }
      if (stateId && existing.stateId !== stateId) {
        return res.status(403).json({ error: 'Forbidden: stateId does not match' })
      }
      await prisma.customExam.delete({ where: { id } })
      return res.status(200).json({ message: 'Exam deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete exam' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
