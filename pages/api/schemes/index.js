import prisma from '../../../lib/prisma'

const isCustomId = (id) => !id || id.startsWith('custom-')

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { stateId, scope, id: schemeId } = req.query

      if (schemeId) {
        const scheme = await prisma.scheme.findUnique({ where: { id: schemeId } })
        if (!scheme) return res.status(404).json({ error: 'Scheme not found' })
        return res.status(200).json({ scheme })
      }

      let where = {}
      if (scope === 'central') where = { scope: 'central' }
      else if (stateId) where = { stateId }

      const [official, custom] = await Promise.all([
        prisma.scheme.findMany({ where, orderBy: { createdAt: 'asc' } }),
        stateId ? prisma.customScheme.findMany({ where: { stateId } }) : Promise.resolve([]),
      ])
      const customMapped = custom.map(s => ({ ...s, name: s.title, isCustom: true }))
      return res.status(200).json([...official, ...customMapped])
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch schemes' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { stateId, title, name, description, benefit, eligibility, documents, deadline, category, formFields, createdBy, icon, color, badgeColor, nameHindi, ministry } = req.body
      if (!stateId) return res.status(400).json({ error: 'stateId is required' })
      const scheme = await prisma.customScheme.create({
        data: {
          stateId,
          title: name || title,
          description, benefit, eligibility,
          documents: documents || [],
          deadline, category,
          formFields: formFields || [],
          createdBy,
        },
      })
      return res.status(201).json({ ...scheme, name: scheme.title, isCustom: true })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create scheme' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, isCustom, stateId, name, nameHindi, ministry, category, benefit, eligibility, icon, description, documents, formFields, color, badgeColor } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustom || isCustomId(id)) {
        // Update CustomScheme
        const existing = await prisma.customScheme.findUnique({ where: { id } })
        let updated
        if (existing) {
          updated = await prisma.customScheme.update({
            where: { id },
            data: {
              title: name || existing.title,
              description: description ?? existing.description,
              benefit: benefit ?? existing.benefit,
              eligibility: eligibility ?? existing.eligibility,
              category: category ?? existing.category,
              documents: documents ?? existing.documents,
              formFields: formFields ?? existing.formFields,
            },
          })
        } else {
          updated = await prisma.customScheme.create({
            data: {
              id, stateId, title: name, description, benefit, eligibility, category,
              documents: documents || [], formFields: formFields || [],
            },
          })
        }
        return res.status(200).json({ ...updated, name: updated.title, isCustom: true })
      } else {
        // Update built-in Scheme
        const updated = await prisma.scheme.update({
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
      console.error('Scheme update error:', error)
      return res.status(500).json({ error: 'Failed to update scheme' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id is required' })

      if (isCustomId(id)) {
        await prisma.customScheme.delete({ where: { id } })
      } else {
        await prisma.scheme.delete({ where: { id } })
      }
      return res.status(200).json({ message: 'Scheme deleted successfully' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete scheme' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
