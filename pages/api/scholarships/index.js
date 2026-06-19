import prisma from '../../../lib/prisma'

const isCustomId = (id) => !id || id.startsWith('custom-')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId, scope, id: scholId } = req.query

      if (scholId) {
        const scholarship = await prisma.scholarship.findUnique({ where: { id: scholId } })
        if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' })
        return res.status(200).json({ scholarship })
      }

      let where = {}
      if (scope === 'central') where = { scope: 'central' }
      else if (stateId) where = { stateId }

      const [official, custom] = await Promise.all([
        prisma.scholarship.findMany({ where, orderBy: { createdAt: 'asc' } }),
        stateId ? prisma.customScholarship.findMany({ where: { stateId } }) : Promise.resolve([]),
      ])
      const customMapped = custom.map(s => ({ ...s, name: s.title, benefit: s.amount, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch scholarships' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, name, description, amount, benefit, eligibility, lastDate, category, createdBy } = req.body
      if (!stateId) return res.status(400).json({ error: 'stateId is required' })
      const scholarship = await prisma.customScholarship.create({
        data: { stateId, title: name || title, description, amount: benefit || amount, eligibility, lastDate, category, createdBy },
      })
      return res.status(201).json({ ...scholarship, name: scholarship.title, benefit: scholarship.amount, isCustom: true })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create scholarship' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, isCustom, stateId, name, nameHindi, ministry, category, benefit, eligibility, icon, description, documents, formFields, color, badgeColor } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustom || isCustomId(id)) {
        const existing = await prisma.customScholarship.findUnique({ where: { id } })
        let updated
        if (existing) {
          updated = await prisma.customScholarship.update({
            where: { id },
            data: {
              title: name || existing.title,
              description: description ?? existing.description,
              amount: benefit ?? existing.amount,
              eligibility: eligibility ?? existing.eligibility,
              category: category ?? existing.category,
            },
          })
        } else {
          updated = await prisma.customScholarship.create({
            data: { id, stateId, title: name, description, amount: benefit, eligibility, category },
          })
        }
        return res.status(200).json({ ...updated, name: updated.title, benefit: updated.amount, isCustom: true })
      } else {
        const updated = await prisma.scholarship.update({
          where: { id },
          data: {
            ...(name        !== undefined && { name }),
            ...(nameHindi   !== undefined && { nameHindi }),
            ...(ministry    !== undefined && { ministry }),
            ...(category    !== undefined && { category }),
            ...(benefit     !== undefined && { benefit }),
            ...(eligibility !== undefined && { eligibility }),
            ...(icon        !== undefined && { icon }),
            ...(description !== undefined && { description }),
            ...(documents   !== undefined && { documents }),
            ...(formFields  !== undefined && { formFields }),
            ...(color       !== undefined && { color }),
            ...(badgeColor  !== undefined && { badgeColor }),
          },
        })
        return res.status(200).json(updated)
      }
    } catch (error) {
      console.error('Scholarship update error:', error)
      return res.status(500).json({ error: 'Failed to update scholarship' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustomId(id)) {
        await prisma.customScholarship.delete({ where: { id } })
      } else {
        await prisma.scholarship.delete({ where: { id } })
      }
      return res.status(200).json({ message: 'Scholarship deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete scholarship' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
