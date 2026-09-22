// Generates the auth environment variables for this app.
//
//   node scripts/gen-auth.mjs                      -> the team below
//   node scripts/gen-auth.mjs a@b.com:admin        -> custom list
//   node scripts/gen-auth.mjs a@b.com:admin:"A B"  -> custom display name
//
// Passwords are random and printed ONCE. Copy them somewhere safe, then put
// NEXTAUTH_SECRET and APP_USERS in .env.local (local) and in the Vercel
// project's Environment Variables (production).

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

const DEFAULT_TEAM = [
  { email: 'pawan@sabhi.com', name: 'Pawan', role: 'admin' },
  { email: 'aditya@sabhi.com', name: 'Aditya Sankhla', role: 'coordinator' },
  { email: 'jatin@sabhi.com', name: 'Jatin', role: 'coordinator' },
  { email: 'lalita@sabhi.com', name: 'Lalita', role: 'operator' },
  { email: 'khushwant@sabhi.com', name: 'Khushwant', role: 'operator' },
  { email: 'sanu@sabhi.com', name: 'Sanu', role: 'operator' },
  { email: 'minal@sabhi.com', name: 'Minal', role: 'operator' },
];

const VALID_ROLES = ['admin', 'coordinator', 'operator'];

function parseArgs(argv) {
  if (argv.length === 0) return DEFAULT_TEAM;

  return argv.map((arg) => {
    const [email, role, ...nameParts] = arg.split(':');
    if (!email || !role) {
      throw new Error(`Expected email:role[:name], got "${arg}"`);
    }
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Unknown role "${role}". Use one of: ${VALID_ROLES.join(', ')}`);
    }
    const fallback = email.split('@')[0];
    const name = nameParts.join(':').trim() || fallback.charAt(0).toUpperCase() + fallback.slice(1);
    return { email, name, role };
  });
}

const team = parseArgs(process.argv.slice(2));
const plaintext = [];

const users = await Promise.all(
  team.map(async (member) => {
    const password = randomBytes(12).toString('base64url');
    plaintext.push({ email: member.email, role: member.role, password });
    return { ...member, passwordHash: await bcrypt.hash(password, 10) };
  })
);

console.log('\n=== Passwords (shown once - save these now) ===\n');
for (const entry of plaintext) {
  console.log(`  ${entry.email.padEnd(24)} ${entry.role.padEnd(13)} ${entry.password}`);
}

// base64, so the `$` characters in the bcrypt hashes are not eaten by
// variable expansion when this lands in a .env file.
const appUsers = Buffer.from(JSON.stringify(users), 'utf8').toString('base64');

console.log('\n=== Environment variables ===\n');
console.log(`NEXTAUTH_SECRET=${randomBytes(32).toString('base64')}`);
console.log(`APP_USERS=${appUsers}`);
console.log('');
