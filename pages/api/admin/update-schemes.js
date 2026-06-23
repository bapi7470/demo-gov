import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const results = await Promise.all([
      prisma.scheme.update({
        where: { id: 'yuva-sathi' },
        data: { name: 'Varsha Bhata', nameBengali: 'বার্ষিক ভাতা' },
      }).catch(e => ({ error: e.message, id: 'yuva-sathi' })),
      prisma.scheme.update({
        where: { id: 'swasthya-sathi' },
        data: { name: 'Ayushman Bharat', nameBengali: 'আয়ুষ্মান ভারত' },
      }).catch(e => ({ error: e.message, id: 'swasthya-sathi' })),
    ])
    return res.status(200).json({ success: true, results })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
