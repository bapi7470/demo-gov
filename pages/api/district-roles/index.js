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
    const { stateId, district, role, name, mobile, email, password } = req.body
    const districtRole = await prisma.districtRole.upsert({
      where: { stateId_district_role: { stateId, district, role } },
      update: { name, mobile, email, password },
      create: { stateId, district, role, name, mobile, email, password },
    })
    return res.status(200).json(districtRole)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await prisma.districtRole.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
