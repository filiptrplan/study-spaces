import { readFileSync } from 'node:fs';
// The key lives outside the repo; it is read here and never logged or written anywhere.
export function key() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const line = readFileSync('/run/secrets/api_secrets', 'utf8').split('\n').find((l) => /^\s*(export\s+)?ELEVENLABS_API_KEY\s*=/.test(l));
  return line.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
}
export const headers = () => ({ 'xi-api-key': key() });
