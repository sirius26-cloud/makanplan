import { afterEach, describe, expect, it, vi } from "vitest";

import { generateWeeklyPlan, regenerateMealDay } from "../lib/mealGenerator";
import type { Recipe } from "../lib/types";

const recipes: Recipe[] = [
  {
    id: "main-chicken",
    name: "Chicken Main",
    type: "protein_main",
    protein: "chicken",
    hasVeg: true,
    isRice: false,
    isFavourite: false,
    isStaple: false,
    ingredients: ["chicken"],
    instructions: "Cook.",
    servings: 4,
    cuisineType: "Cantonese",
    spiceLevel: "light",
    createdAt: 1,
  },
  {
    id: "one-pot-rice",
    name: "One-Pot Rice",
    type: "rice_noodle_one_pot",
    protein: "chicken",
    hasVeg: true,
    isRice: true,
    isFavourite: false,
    isStaple: false,
    ingredients: ["rice"],
    instructions: "Cook.",
    servings: 4,
    cuisineType: "Japanese",
    spiceLevel: "light",
    createdAt: 2,
  },
  {
    id: "veg-side",
    name: "Veg Side",
    type: "veg_side",
    protein: "tofu",
    hasVeg: true,
    isRice: false,
    isFavourite: false,
    isStaple: false,
    ingredients: ["greens"],
    instructions: "Cook.",
    servings: 4,
    cuisineType: "Cantonese",
    spiceLevel: "light",
    createdAt: 3,
  },
];

afterEach(() => vi.restoreAllMocks());

describe("one-pot format choice", () => {
  it("decides every freshly generated day independently instead of reserving a fixed day index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);

    const plan = generateWeeklyPlan(recipes, 4, 5, undefined, true);

    expect(plan.days.map((day) => day.format)).toEqual([
      "main-veg",
      "main-veg",
      "main-veg",
      "main-veg",
      "main-veg",
    ]);
  });

  it("allows a normal reshuffle to select one-pot even for a day that was not previously one-pot", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const plan = generateWeeklyPlan(recipes, 4, 5, undefined, true);

    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const reshuffledDay = regenerateMealDay(recipes, plan, 0);

    expect(reshuffledDay.format).toBe("one-pot");
    expect(reshuffledDay.main.type).toBe("rice_noodle_one_pot");
  });
});
