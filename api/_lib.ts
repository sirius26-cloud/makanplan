import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { get, put } from '@vercel/blob';
import { emptyMaster, sanitizeIncoming, type MasterData } from '../lib/recipeMerge';

export interface Req extends IncomingMessage {
  body?: any;
}
export interface Res extends ServerResponse {
  status(code: number): Res;
  json(body: unknown): void;
}

const MASTER_PATH = 'master/recipes.json';

/** CORS + shared-passcode check. Returns true if the request may continue. */
export function guard(req: Req, res: Res): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-sync-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).json(null);
    return false;
  }

  const expected = process.env.MAKANPLAN_SYNC_KEY;
  if (!expected) {
    res.status(500).json({ error: 'Server is missing MAKANPLAN_SYNC_KEY.' });
    return false;
  }
  const provided = String(req.headers['x-sync-key'] ?? '');
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: 'Wrong sync passcode.' });
    return false;
  }
  return true;
}

export async function readMaster(): Promise<MasterData> {
  const result = await get(MASTER_PATH, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200) return emptyMaster();
  const text = await new Response(result.stream).text();
  return sanitizeIncoming(JSON.parse(text));
}

export async function writeMaster(data: MasterData): Promise<void> {
  const body = JSON.stringify(data);
  const options = {
    access: 'private' as const,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  };
  await put(MASTER_PATH, body, options);
  // Rolling safety copy: one snapshot per day, so a bad edit is recoverable.
  const day = new Date().toISOString().slice(0, 10);
  await put(`backups/recipes-${day}.json`, body, options);
}
