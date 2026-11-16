import { describe, expect, it } from "vitest";

import { BASELINE_TIME, USER_RECIPES } from "../lib/userRecipes";

describe("63-recipe baseline", () => {
  it("contains exactly 63 uniquely identified recipes", () => {
    expect(USER_RECIPES).toHaveLength(63);
    expect(new Set(USER_RECIPES.map((recipe) => recipe.id)).size).toBe(63);
    expect(new Set(USER_RECIPES.map((recipe) => recipe.name.trim().toLowerCase())).size).toBe(63);
  });

  it("stamps every baseline recipe with the backup export time", () => {
    expect(BASELINE_TIME).toBe(Date.parse("2026-10-08T16:41:09.724Z"));
    expect(USER_RECIPES.every((recipe) => recipe.updatedAt === BASELINE_TIME)).toBe(true);
  });
});
