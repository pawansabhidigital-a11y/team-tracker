import withAuth from 'next-auth/middleware';

// Everything is behind the login wall except the sign-in page itself, the
// NextAuth endpoints, and Next's static assets. Unauthenticated requests are
// redirected to /login before any page code runs, so this cannot be bypassed
// from the browser.
export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: ['/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)'],
};
