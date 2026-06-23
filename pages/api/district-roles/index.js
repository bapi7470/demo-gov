import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { stateId, district, role } = req.query
    const where = {}
    if (stateId) where.stateId = stateId
    if (district) where.district = district
    if (role) where.role = role
    const roles = await prisma.districtRole.findMany({ where })
    return res.status(200).json(roles)
  }

  if (req.method === 'POST') {
    try {
      const { id, stateId, district, role, fullName, name, username, mobile, email, password } = req.body
      const resolvedName = fullName || name || ''
      if (id) {
        const districtRole = await prisma.districtRole.upsert({
          where: { id },
          create: { id, stateId, district, role, name: resolvedName, mobile, email, password },
          update: { name: resolvedName, mobile, email, ...(password ? { password } : {}) },
        })
        return res.status(200).json(districtRole)
      } else {
        const districtRole = await prisma.districtRole.create({
          data: { stateId, district, role, name: resolvedName, mobile, email, password },
        })
        return res.status(200).json(districtRole)
      }
    } catch (error) {
      console.error('District role error:', error)
      return res.status(500).json({ error: 'Failed to save district role', details: error.message })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await prisma.districtRole.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
