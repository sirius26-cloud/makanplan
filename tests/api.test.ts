import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
vi.mock('@vercel/blob', () => ({
  get: vi.fn(async (p: string) =>
    store.has(p) ? { statusCode: 200, stream: new Response(store.get(p)!).body } : null),
  put: vi.fn(async (p: string, body: string) => { store.set(p, body); return { pathname: p }; }),
}));

import recipes from '../api/recipes';
import parse from '../api/parse-recipe';

function call(handler: any, method: string, body?: any, key = 'secret') {
  return new Promise<{ status: number; body: any }>((resolve) => {
    const res: any = { headers: {}, setHeader() {}, status(c: number) { this.code = c; return this; }, json(b: any) { resolve({ status: this.code ?? 200, body: b }); } };
    handler({ method, headers: { 'x-sync-key': key }, body }, res);
  });
}
const recipe = (id: string) => ({ id, name: id, type: 'protein_main', protein: 'fish', hasVeg: false, isRice: false, isFavourite: false, isStaple: false, ingredients: ['a'], instructions: 'b', servings: 2, cuisineType: 'Mixed', spiceLevel: 'light', createdAt: 1 });

beforeEach(() => { store.clear(); process.env.MAKANPLAN_SYNC_KEY = 'secret'; process.env.ANTHROPIC_API_KEY = 'k'; });

describe('/api/recipes', () => {
  it('rejects a wrong passcode', async () => {
    expect((await call(recipes, 'GET', undefined, 'nope')).status).toBe(401);
  });
  it('merges two devices without losing either, and writes a daily snapshot', async () => {
    await call(recipes, 'POST', { recipes: [recipe('a')], deleted: {} });
    const out = await call(recipes, 'POST', { recipes: [recipe('b')], deleted: {} });
    expect(out.body.recipes.map((r: any) => r.id).sort()).toEqual(['a', 'b']);
    expect([...store.keys()].some((k) => k.startsWith('backups/recipes-'))).toBe(true);
    expect((await call(recipes, 'GET')).body.recipes).toHaveLength(2);
  });
});

describe('/api/parse-recipe', () => {
  it('returns a sanitised recipe from the model tool call', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ content: [{ type: 'tool_use', input: {
      name: ' Chicken Rice ', type: 'bogus', protein: 'chicken', hasVeg: false, isRice: true, cuisineType: 'Cantonese',
      spiceLevel: 'light', servings: 2, ingredients: ['1 chicken', ''], instructions: '1) cook', courseType: 'none', reviewNotes: ['x'] } }] }))));
    const out = await call(parse, 'POST', { text: 'chicken rice recipe: cook chicken with rice for a while' });
    expect(out.status).toBe(200);
    expect(out.body).toMatchObject({ name: 'Chicken Rice', type: 'protein_main', ingredients: ['1 chicken'], courseType: undefined });
  });
  it('rejects too-short text', async () => {
    expect((await call(parse, 'POST', { text: 'hi' })).status).toBe(400);
  });
});
