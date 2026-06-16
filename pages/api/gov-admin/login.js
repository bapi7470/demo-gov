import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const admin = await prisma.govAdmin.findUnique({
      where: { username: username.trim() },
    });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      success: true,
      admin: {
        username: admin.username,
        stateId: admin.stateId,
        stateName: admin.stateName,
        emoji: admin.emoji,
        level: admin.level,
      },
    });
  } catch (error) {
    console.error('Gov admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
