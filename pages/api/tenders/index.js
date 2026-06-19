import prisma from '../../../lib/prisma'

const isCustomId = (id) => !id || id.startsWith('custom-')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId, scope, id: tenderId } = req.query

      if (tenderId) {
        const tender = await prisma.tender.findUnique({ where: { id: tenderId } })
        if (!tender) return res.status(404).json({ error: 'Tender not found' })
        return res.status(200).json({ tender })
      }

      let where = {}
      if (scope === 'central') where = { stateId: 'central' }
      else if (stateId) where = { stateId }

      const [official, custom] = await Promise.all([
        prisma.tender.findMany({ where, orderBy: { createdAt: 'asc' } }),
        stateId && stateId !== 'central'
          ? prisma.customTender.findMany({ where: { stateId } })
          : Promise.resolve([]),
      ])
      const customMapped = custom.map(t => ({ ...t, name: t.title, estimatedValue: t.value, bidDeadline: t.lastDate, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch tenders' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, name, description, value, estimatedValue, lastDate, bidDeadline, category, department, createdBy } = req.body
      if (!stateId) return res.status(400).json({ error: 'stateId is required' })
      const tender = await prisma.customTender.create({
        data: {
          stateId,
          title: name || title,
          description, category, department, createdBy,
          value: estimatedValue || value,
          lastDate: bidDeadline || lastDate,
        },
      })
      return res.status(201).json({ ...tender, name: tender.title, estimatedValue: tender.value, bidDeadline: tender.lastDate, isCustom: true })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create tender' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, isCustom, stateId, name, department, category, estimatedValue, bidDeadline, workDescription, eligibility, tenderNo, status, icon, description, documents, formFields, color, badgeColor } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustom || isCustomId(id)) {
        const existing = await prisma.customTender.findUnique({ where: { id } })
        let updated
        if (existing) {
          updated = await prisma.customTender.update({
            where: { id },
            data: {
              title: name || existing.title,
              description: description ?? existing.description,
              value: estimatedValue ?? existing.value,
              lastDate: bidDeadline ?? existing.lastDate,
              category: category ?? existing.category,
              department: department ?? existing.department,
            },
          })
        } else {
          updated = await prisma.customTender.create({
            data: { id, stateId, title: name, description, value: estimatedValue, lastDate: bidDeadline, category, department },
          })
        }
        return res.status(200).json({ ...updated, name: updated.title, estimatedValue: updated.value, bidDeadline: updated.lastDate, isCustom: true })
      } else {
        const updated = await prisma.tender.update({
          where: { id },
          data: {
            ...(name            !== undefined && { name }),
            ...(department      !== undefined && { department }),
            ...(category        !== undefined && { category }),
            ...(estimatedValue  !== undefined && { estimatedValue }),
            ...(bidDeadline     !== undefined && { bidDeadline }),
            ...(workDescription !== undefined && { workDescription }),
            ...(eligibility     !== undefined && { eligibility }),
            ...(tenderNo        !== undefined && { tenderNo }),
            ...(status          !== undefined && { status }),
            ...(icon            !== undefined && { icon }),
            ...(description     !== undefined && { description }),
            ...(formFields      !== undefined && { formFields }),
            ...(color           !== undefined && { color }),
            ...(badgeColor      !== undefined && { badgeColor }),
          },
        })
        return res.status(200).json(updated)
      }
    } catch (error) {
      console.error('Tender update error:', error)
      return res.status(500).json({ error: 'Failed to update tender' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustomId(id)) {
        await prisma.customTender.delete({ where: { id } })
      } else {
        await prisma.tender.delete({ where: { id } })
      }
      return res.status(200).json({ message: 'Tender deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete tender' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
