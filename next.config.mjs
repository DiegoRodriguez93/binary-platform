/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
    additionalData: `@import "variables"; @import "mixins";`,
  },
}

export default nextConfig;