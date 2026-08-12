import { describe, expect, it } from "vitest";

import { USER_RECIPES } from "../lib/userRecipes";

describe("44-recipe master seed", () => {
  it("contains exactly 44 uniquely identified recipes", () => {
    expect(USER_RECIPES).toHaveLength(44);
    expect(new Set(USER_RECIPES.map((recipe) => recipe.id)).size).toBe(44);
  });
});
