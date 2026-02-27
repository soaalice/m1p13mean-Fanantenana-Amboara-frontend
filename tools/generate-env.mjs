import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const apiUrl = process.env.NG_APP_API_URL;

if (!apiUrl) {
  throw new Error('NG_APP_API_URL is not defined. Set it in Vercel Environment Variables.');
}

const targetPath = 'src/environments/environment.prod.ts';
mkdirSync(dirname(targetPath), { recursive: true });

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

writeFileSync(targetPath, content, 'utf8');
console.log(`Generated ${targetPath}`);