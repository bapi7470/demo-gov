import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const beneficiaries = await prisma.beneficiary.findMany()
    return res.status(200).json(beneficiaries)
  }

  if (req.method === 'POST') {
    const { pan, name, mobile, schemes, status, employer, appliedOn } = req.body

    const existing = await prisma.beneficiary.findUnique({ where: { pan } })

    if (existing) {
      const mergedSchemes = Array.isArray(existing.schemes) && Array.isArray(schemes)
        ? [...new Set([...existing.schemes, ...schemes])]
        : schemes ?? existing.schemes

      const updated = await prisma.beneficiary.update({
        where: { pan },
        data: {
          name: name ?? existing.name,
          mobile: mobile ?? existing.mobile,
          schemes: mergedSchemes,
          status: status ?? existing.status,
          employer: employer ?? existing.employer,
          appliedOn: appliedOn ? new Date(appliedOn) : existing.appliedOn,
        },
      })
      return res.status(200).json(updated)
    }

    const created = await prisma.beneficiary.create({
      data: {
        pan,
        name,
        mobile,
        schemes: schemes ?? [],
        status,
        employer: employer ?? {},
        appliedOn: appliedOn ? new Date(appliedOn) : new Date(),
      },
    })
    return res.status(201).json(created)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
