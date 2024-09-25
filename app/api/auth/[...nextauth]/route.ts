import NextAuth, { NextAuthOptions, Account, User } from "next-auth";
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
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    // device_id: "dev1",
                    // device_name: "development"
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account, user }: { token: JWT; account: Account | null; user: User | undefined }) {
            if (account && account.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            session.accessToken = token.accessToken;
            return session;
        }
    },
    pages: {
        signIn: '/home', // 로그인 페이지 URL
    },
};

// NextAuth 핸들러 생성
const handler = NextAuth(authOptions);

// GET 및 POST 요청 처리
export { handler as GET, handler as POST };
