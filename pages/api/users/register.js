import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    fullName,
    dob,
    gender,
    mobile,
    password,
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

  if (!fullName || !mobile || !password) {
    return res.status(400).json({ error: 'fullName, mobile, and password are required' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile },
          ...(aadhaar ? [{ aadhaar }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.mobile === mobile) {
        return res.status(409).json({ error: 'Mobile number already registered' });
      }
      if (aadhaar && existingUser.aadhaar === aadhaar) {
        return res.status(409).json({ error: 'Aadhaar number already registered' });
      }
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        dob: dob || null,
        gender: gender || null,
        mobile,
        password,
        email: email || null,
        aadhaar: aadhaar || null,
        pan: pan || null,
        category: category || null,
        education: education || null,
        address: address || null,
        state: state || null,
        district: district || null,
        bankAccount: bankAccount || null,
        ifsc: ifsc || null,
        rationCard: rationCard || null,
      },
    });

    return res.status(201).json({
      success: true,
      user: {
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
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
