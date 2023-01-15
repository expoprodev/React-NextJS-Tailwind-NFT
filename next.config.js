const withTM = require('next-transpile-modules')(['kalidokit'])

const isProd = process.env.NODE_ENV === 'production'
const nextConfig = {
    env: {
        NEXT_PUBLIC_URL: isProd ? 'https://crossworld.metaprints.com' : 'http://localhost:3000',
        PROJECT_ROOT: __dirname,
        NEXT_PUBLIC_PAGE_LENGTH: 1,
        OPERATOR_ADDRESS: '0x1b04023a95188F60B58CDDe9B26C9e10DB0DCb70',
        JWT_SECRET: 'uRGQgsW9QuU5i30kF5dP',
        API_KEY: '1LzMt7JFnhrQ6tkwlGnTqUru5wFN1H0QPX8dUY3oKBgryF9T52'
    },
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: ['localhost', 'ipfs.io', '*.vercel.app'],
    },
    swcMinify: false,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: { and: [/\.(js|ts|md)x?$/] },
            use: [
                {
                    loader: '@svgr/webpack',
                    options: {
                        prettier: false,
                        svgo: true,
                        svgoConfig: { plugins: [{ removeViewBox: false }] },
                        titleProp: true,
                    },
                },
            ],
        });
        return config;
    },

    async headers() {
        return [
            {
                // matching all API routes
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value:
                            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            },
        ]
    },
}

module.exports = withTM({ ...nextConfig })
