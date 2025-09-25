import 'next-auth';
import 'next-auth/jwt';

// 1. Extend the User type
declare module 'next-auth' {
  /**
   * The shape of the user object returned in the `authorize` callback
   */
  interface User {
    rememberMe?: boolean | string;
  }

  interface Session {
    user?: {
      provider?: string;
    } & DefaultSession["user"];
  }
}

// 2. Extend the JWT type
declare module 'next-auth/jwt' {
  /**
   * The shape of the JWT token returned in the `jwt` callback
   */
  interface JWT {
    rememberMe?: boolean;
  }
}