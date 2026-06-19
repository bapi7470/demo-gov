import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { stateId, pan } = req.query
    if (pan) {
      const emp = await prisma.govEmployee.findUnique({ where: { pan } })
      if (!emp) return res.status(404).json({ error: 'Employee not found' })
      return res.status(200).json(emp)
    }
    const where = stateId ? { stateId } : {}
    const employees = await prisma.govEmployee.findMany({ where, orderBy: { name: 'asc' } })
    return res.status(200).json(employees)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch government employees' })
  }
}
