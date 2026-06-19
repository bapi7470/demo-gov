import prisma from '../../../lib/prisma'

const isCustomId = (id) => !id || id.startsWith('custom-')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId, scope, id: examId } = req.query

      if (examId) {
        const exam = await prisma.exam.findUnique({ where: { id: examId } })
        if (!exam) return res.status(404).json({ error: 'Exam not found' })
        return res.status(200).json({ exam })
      }

      let where = {}
      if (scope === 'central') where = { scope: 'central' }
      else if (stateId) where = { stateId }

      const [official, custom] = await Promise.all([
        prisma.exam.findMany({ where, orderBy: { createdAt: 'asc' } }),
        stateId ? prisma.customExam.findMany({ where: { stateId } }) : Promise.resolve([]),
      ])
      const customMapped = custom.map(e => ({ ...e, name: e.title, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch exams' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, name, description, date, lastDate, fee, eligibility, posts, category, createdBy } = req.body
      if (!stateId) return res.status(400).json({ error: 'stateId is required' })
      const exam = await prisma.customExam.create({
        data: { stateId, title: name || title, description, date, lastDate, fee, eligibility, posts, category, createdBy },
      })
      return res.status(201).json({ ...exam, name: exam.title, isCustom: true })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create exam' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, isCustom, stateId, name, conductedBy, category, benefit, eligibility, posts, applicationFee, nextExam, applicationDeadline, status, icon, description, documents, formFields, color, badgeColor } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustom || isCustomId(id)) {
        const existing = await prisma.customExam.findUnique({ where: { id } })
        let updated
        if (existing) {
          updated = await prisma.customExam.update({
            where: { id },
            data: {
              title: name || existing.title,
              description: description ?? existing.description,
              eligibility: eligibility ?? existing.eligibility,
              category: category ?? existing.category,
              fee: applicationFee ?? existing.fee,
              lastDate: applicationDeadline ?? existing.lastDate,
            },
          })
        } else {
          updated = await prisma.customExam.create({
            data: { id, stateId, title: name, description, eligibility, category, fee: applicationFee, lastDate: applicationDeadline },
          })
        }
        return res.status(200).json({ ...updated, name: updated.title, isCustom: true })
      } else {
        const updated = await prisma.exam.update({
          where: { id },
          data: {
            ...(name                !== undefined && { name }),
            ...(conductedBy        !== undefined && { conductedBy }),
            ...(category           !== undefined && { category }),
            ...(eligibility        !== undefined && { eligibility }),
            ...(posts              !== undefined && { posts }),
            ...(applicationFee     !== undefined && { applicationFee }),
            ...(nextExam           !== undefined && { nextExam }),
            ...(applicationDeadline!== undefined && { applicationDeadline }),
            ...(status             !== undefined && { status }),
            ...(icon               !== undefined && { icon }),
            ...(description        !== undefined && { description }),
            ...(formFields         !== undefined && { formFields }),
            ...(color              !== undefined && { color }),
            ...(badgeColor         !== undefined && { badgeColor }),
          },
        })
        return res.status(200).json(updated)
      }
    } catch (error) {
      console.error('Exam update error:', error)
      return res.status(500).json({ error: 'Failed to update exam' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustomId(id)) {
        await prisma.customExam.delete({ where: { id } })
      } else {
        await prisma.exam.delete({ where: { id } })
      }
      return res.status(200).json({ message: 'Exam deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete exam' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
