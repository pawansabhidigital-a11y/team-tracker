import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { normalizeRole, type Role } from '@/lib/rbac';

interface AppUser {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
}

// A bcrypt hash of a value nobody knows, compared against when the email is
// unknown so a wrong email and a wrong password cost the same time.
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * APP_USERS holds the sign-in list. It is normally base64-encoded JSON,
 * because a raw bcrypt hash contains `$` and dotenv expands `$NAME` inside
 * .env files - which silently truncates the hash. Plain JSON is still accepted
 * for platforms that pass values through untouched.
 */
function decodePayload(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  return JSON.parse(Buffer.from(trimmed, 'base64').toString('utf8'));
}

function loadUsers(): AppUser[] {
  const raw = process.env.APP_USERS;
  if (!raw) {
    console.error('[auth] APP_USERS is not set - nobody can sign in.');
    return [];
  }

  let parsed: unknown;
  try {
    parsed = decodePayload(raw);
  } catch {
    console.error(
      '[auth] APP_USERS is neither base64-encoded JSON nor plain JSON. ' +
        'Regenerate it with `npm run gen-auth`.'
    );
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.error('[auth] APP_USERS must decode to a JSON array.');
    return [];
  }

  const users: AppUser[] = [];
  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { email, name, role, passwordHash } = entry as Record<string, unknown>;

    // normalizeRole, not isRole: a stored "executive" has to become "operator"
    // here, or the permission lookup gets a role it does not know.
    const normalizedRole = normalizeRole(role);

    if (
      typeof email !== 'string' ||
      typeof name !== 'string' ||
      typeof passwordHash !== 'string' ||
      !normalizedRole
    ) {
      console.error('[auth] Skipping malformed APP_USERS entry.');
      continue;
    }

    if (!BCRYPT_RE.test(passwordHash)) {
      console.error(
        `[auth] passwordHash for ${email} is not a valid bcrypt hash. ` +
          'If APP_USERS is plain JSON in a .env file, the `$` characters were ' +
          'eaten by variable expansion - use the base64 form from `npm run gen-auth`.'
      );
      continue;
    }

    users.push({ email: email.toLowerCase(), name, role: normalizedRole, passwordHash });
  }

  return users;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = loadUsers().find((candidate) => candidate.email === email);
        const hash = user?.passwordHash ?? DUMMY_HASH;
        const ok = await bcrypt.compare(password, hash);

        if (!ok || !user) return null;

        return {
          id: user.email,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const role = user && normalizeRole(user.role);
      if (role) {
        token.role = role;
      }
      return token;
    },
    session({ session, token }) {
      // Normalized again so a JWT minted before the rename still resolves.
      const role = normalizeRole(token.role);
      if (session.user && role) {
        session.user.role = role;
      }
      return session;
    },
  },
};
