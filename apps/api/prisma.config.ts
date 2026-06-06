import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('src', 'prisma', 'schema.prisma'),
  // Connection URL used by migration / introspection commands
  // (prisma migrate, db push, db pull, studio). Left undefined when
  // DATABASE_URL isn't set so `prisma generate` still works offline.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
