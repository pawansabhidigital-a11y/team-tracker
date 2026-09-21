// Generates the auth environment variables for this app.
//
//   node scripts/gen-auth.mjs            -> default team from lib/data.ts
//   node scripts/gen-auth.mjs a@b.com:admin c@d.com:executive
//
// Passwords are random and printed ONCE. Copy them somewhere safe, then paste
// NEXTAUTH_SECRET and APP_USERS into .env.local (local) and into the Vercel
// project's Environment Variables (production).

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

const DEFAULT_TEAM = [
  { email: 'pawan@sabhi.com', name: 'Pawan', role: 'admin' },
  { email: 'priya@sabhi.com', name: 'Priya', role: 'coordinator' },
  { email: 'yuvraj@sabhi.com', name: 'Yuvraj', role: 'executive' },
];

const VALID_ROLES = ['admin', 'coordinator', 'executive'];

function parseArgs(argv) {
  if (argv.length === 0) return DEFAULT_TEAM;

  return argv.map((arg) => {
    const [email, role] = arg.split(':');
    if (!email || !role) {
      throw new Error(`Expected email:role, got "${arg}"`);
    }
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Unknown role "${role}". Use one of: ${VALID_ROLES.join(', ')}`);
    }
    const name = email.split('@')[0];
    return { email, name: name.charAt(0).toUpperCase() + name.slice(1), role };
  });
}

function randomPassword() {
  return randomBytes(12).toString('base64url');
}

const team = parseArgs(process.argv.slice(2));
const plaintext = [];

const users = await Promise.all(
  team.map(async (member) => {
    const password = randomPassword();
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
