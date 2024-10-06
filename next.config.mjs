import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [];
    },
    images: {
        domains: [
            'tinyurl.com',
            'test-mongeul-s3-0911.s3.ap-northeast-2.amazonaws.com',
            'mongeul.com'  // 새로운 도메인 추가
        ],
        remotePatterns:[
            {
                protocol: 'https',
                hostname: 'test-mongeul-s3-0911.s3.ap-northeast-2.amazonaws.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'mongeul.com',
                pathname: '/**',
            }
        ],
    },
    // 동적 라우팅을 위한 추가 설정
    pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
    trailingSlash: false,
    
    // // CSP 헤더 추가
    // async headers() {
    //     return [
    //         {
    //             source: '/:path*',
    //             headers: [
    //                 {
    //                     key: 'Content-Security-Policy',
    //                     value: "upgrade-insecure-requests; default-src 'self' https://mongeul.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mongeul.com; style-src 'self' 'unsafe-inline' https://mongeul.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://mongeul.com;"
    //                 },
    //             ],
    //         },
    //     ];
    // },
};

const pwaConfig = {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
};

export default withPWA(pwaConfig)({
    ...nextConfig,
    // 추가 설정이 필요한 경우 여기에 작성
});