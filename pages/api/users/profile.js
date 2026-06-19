import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        aadhaar: user.aadhaar,
        pan: user.pan,
        gender: user.gender,
        dob: user.dob,
        category: user.category,
        education: user.education,
        address: user.address,
        state: user.state,
        district: user.district,
        bankAccount: user.bankAccount,
        ifsc: user.ifsc,
        rationCard: user.rationCard,
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const {
      fullName,
      dob,
      gender,
      email,
      aadhaar,
      pan,
      category,
      education,
      address,
      state,
      district,
      bankAccount,
      ifsc,
      rationCard,
    } = req.body;

    const updateData = {};
    const orNull = (v) => v || null;

    if (fullName) updateData.fullName = fullName;
    if (dob !== undefined) updateData.dob = orNull(dob);
    if (gender !== undefined) updateData.gender = orNull(gender);
    if (email !== undefined) updateData.email = orNull(email);
    if (aadhaar !== undefined) updateData.aadhaar = orNull(aadhaar);
    if (pan !== undefined) updateData.pan = orNull(pan);
    if (category !== undefined) updateData.category = orNull(category);
    if (education !== undefined) updateData.education = orNull(education);
    if (address !== undefined) updateData.address = orNull(address);
    if (state !== undefined) updateData.state = orNull(state);
    if (district !== undefined) updateData.district = orNull(district);
    if (bankAccount !== undefined) updateData.bankAccount = orNull(bankAccount);
    if (ifsc !== undefined) updateData.ifsc = orNull(ifsc);
    if (rationCard !== undefined) updateData.rationCard = orNull(rationCard);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return res.status(200).json({
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        aadhaar: user.aadhaar,
        pan: user.pan,
        gender: user.gender,
        dob: user.dob,
        category: user.category,
        education: user.education,
        address: user.address,
        state: user.state,
        district: user.district,
        bankAccount: user.bankAccount,
        ifsc: user.ifsc,
        rationCard: user.rationCard,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
