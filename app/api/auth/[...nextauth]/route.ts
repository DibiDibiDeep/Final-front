import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!
        })
    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT; account: any }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            session.accessToken = token.accessToken;
            return session;
        }
    }
};

// NextAuth 핸들러 생성
const handler = NextAuth(authOptions);

// GET 및 POST 요청 처리
export { handler as GET, handler as POST };
