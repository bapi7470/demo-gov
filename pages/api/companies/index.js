import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { stateId } = req.query
    const where = stateId ? { stateId } : {}
    const companies = await prisma.customCompany.findMany({ where })
    return res.status(200).json(companies)
  }

  if (req.method === 'POST') {
    const { id, stateId, name, type, industry, location, description, website, jobs, createdBy } = req.body
    const company = await prisma.customCompany.create({
      data: { id, stateId, name, type, industry, location, description, website, jobs, createdBy },
    })
    return res.status(201).json(company)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await prisma.customCompany.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
