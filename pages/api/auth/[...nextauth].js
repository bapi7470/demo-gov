import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../lib/prisma';

const DEMO_USERS = [
  { id: 'demo-1', mobile: '9800000001', password: 'demo123', fullName: 'Rahul Kumar Das' },
  { id: 'demo-2', mobile: '9800000002', password: 'demo456', fullName: 'Priya Sharma' },
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        mobile: { label: 'Mobile Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) {
          return null;
        }

        const { mobile, password } = credentials;

        // Check demo users first
        const demoUser = DEMO_USERS.find(
          (u) => u.mobile === mobile && u.password === password
        );
        if (demoUser) {
          return {
            id: demoUser.id,
            fullName: demoUser.fullName,
            mobile: demoUser.mobile,
            email: null,
            aadhaar: null,
            pan: null,
            gender: null,
            dob: null,
            category: null,
            education: null,
            address: null,
            state: null,
            district: null,
            bankAccount: null,
            ifsc: null,
            rationCard: null,
          };
        }

        // Query database
        try {
          const user = await prisma.user.findFirst({
            where: {
              mobile,
              password,
            },
          });

          if (!user) {
            return null;
          }

          return {
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
          };
        } catch (error) {
          console.error('Database error during authentication:', error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user, session, trigger }) {
      // When updateSession() is called from the client, merge the new data into the token
      if (trigger === 'update' && session?.user) {
        return { ...token, ...session.user };
      }
      if (user) {
        token.id = user.id;
        token.fullName = user.fullName;
        token.mobile = user.mobile;
        token.email = user.email;
        token.aadhaar = user.aadhaar;
        token.pan = user.pan;
        token.gender = user.gender;
        token.dob = user.dob;
        token.category = user.category;
        token.education = user.education;
        token.address = user.address;
        token.state = user.state;
        token.district = user.district;
        token.bankAccount = user.bankAccount;
        token.ifsc = user.ifsc;
        token.rationCard = user.rationCard;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.fullName = token.fullName;
        session.user.mobile = token.mobile;
        session.user.email = token.email;
        session.user.aadhaar = token.aadhaar;
        session.user.pan = token.pan;
        session.user.gender = token.gender;
        session.user.dob = token.dob;
        session.user.category = token.category;
        session.user.education = token.education;
        session.user.address = token.address;
        session.user.state = token.state;
        session.user.district = token.district;
        session.user.bankAccount = token.bankAccount;
        session.user.ifsc = token.ifsc;
        session.user.rationCard = token.rationCard;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login/public',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
