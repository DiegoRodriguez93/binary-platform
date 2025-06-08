import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect trading routes
        if (req.nextUrl.pathname.startsWith('/trade')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/trade/:path*', '/trade-v2/:path*']
};