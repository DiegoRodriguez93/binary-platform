/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
    additionalData: `@import "variables"; @import "mixins";`,
  },
  transpilePackages: ['@next-auth/typeorm-adapter'],
}

export default nextConfig;