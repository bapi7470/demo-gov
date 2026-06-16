import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { orgId } = req.query
    if (!orgId) return res.status(400).json({ error: 'orgId is required' })
    const employees = await prisma.companyEmployee.findMany({ where: { orgId } })
    return res.status(200).json(employees)
  }

  if (req.method === 'POST') {
    const { orgId, pan, name, mobile, email } = req.body
    const uid = `${orgId}_${pan.toUpperCase()}`

    const employee = await prisma.companyEmployee.upsert({
      where: { uid },
      update: {},
      create: { uid, orgId, pan: pan.toUpperCase(), name, mobile, email },
    })
    return res.status(200).json(employee)
  }

  if (req.method === 'DELETE') {
    const { uid } = req.query
    if (!uid) return res.status(400).json({ error: 'uid is required' })
    await prisma.companyEmployee.delete({ where: { uid } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
