/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
    additionalData: `@import "variables"; @import "mixins";`,
  },
  transpilePackages: ['@next-auth/typeorm-adapter'],
  compiler: {
    experimentalDecorators: true,
  },
  experimental: {
    swcPlugins: [
      ['@swc/plugin-transform-imports', {
        'typeorm': {
          transform: 'typeorm/{{member}}',
          preventFullImport: true,
        },
      }],
    ],
  },
}

export default nextConfig;