import { guard, readMaster, writeMaster, type Req, type Res } from './_lib';
import { mergeMaster, sanitizeIncoming } from '../lib/recipeMerge';

/**
 * GET  /api/recipes  -> the master recipe library
 * POST /api/recipes  -> merge the caller's recipes/deletions into the master,
 *                       save it, and return the merged result.
 * POST never removes a recipe unless the caller sends an explicit deletion.
 */
export default async function handler(req: Req, res: Res) {
  if (!guard(req, res)) return;
  try {
    if (req.method === 'GET') {
      res.status(200).json(await readMaster());
      return;
    }
    if (req.method === 'POST') {
      const incoming = sanitizeIncoming(req.body);
      const current = await readMaster();
      const merged = mergeMaster(current, incoming);
      merged.updatedAt = Date.now();
      await writeMaster(merged);
      res.status(200).json(merged);
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('recipes api error', error);
    res.status(500).json({ error: 'Could not reach the recipe store.' });
  }
}
