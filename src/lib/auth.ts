import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { TypeORMAdapter } from "next-auth-typeorm-adapter";
import { AppDataSource } from "./database";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: TypeORMAdapter(AppDataSource),
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Twitter Provider
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    
    // Email/Password Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userRepository = AppDataSource.getRepository(User);
          const user = await userRepository.findOne({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          // Actualizar último login
          await userRepository.update(user.id, { lastLoginAt: new Date() });

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: user.avatar,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "twitter") {
        try {
          const userRepository = AppDataSource.getRepository(User);
          
          // Buscar usuario existente
          let existingUser = await userRepository.findOne({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Crear nuevo usuario con bonus de bienvenida
            existingUser = userRepository.create({
              email: user.email!,
              firstName: user.name?.split(' ')[0],
              lastName: user.name?.split(' ').slice(1).join(' '),
              avatar: user.image,
              authProvider: account.provider as any,
              providerId: account.providerAccountId,
              balance: 5000, // Bonus de bienvenida
              hasReceivedWelcomeBonus: true,
              emailVerified: true,
              lastLoginAt: new Date()
            });
            
            await userRepository.save(existingUser);
          } else {
            // Actualizar último login
            await userRepository.update(existingUser.id, { 
              lastLoginAt: new Date(),
              avatar: user.image || existingUser.avatar
            });
          }
        } catch (error) {
          console.error("SignIn callback error:", error);
          return false;
        }
      }
      
      return true;
    },
    
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const userRepository = AppDataSource.getRepository(User);
          const user = await userRepository.findOne({
            where: { email: session.user.email }
          });
          
          if (user) {
            session.user.id = user.id;
            session.user.balance = user.balance;
            session.user.role = user.role;
          }
        } catch (error) {
          console.error("Session callback error:", error);
        }
      }
      
      return session;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  
  session: {
    strategy: "jwt",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);