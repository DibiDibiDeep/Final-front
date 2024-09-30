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
            'test-mongeul-s3-0911.s3.ap-northeast-2.amazonaws.com'
        ],
    remotePatterns:[
        {
            protocol: 'https',
            hostname: 'test-mongeul-s3-0911.s3.ap-northeast-2.amazonaws.com',
            pathname: '/**',
        }
    ],
    },
    // 동적 라우팅을 위한 추가 설정
    pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
    trailingSlash: false,
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