# How to Add Your Own Recipes to MakanPlan

MakanPlan stores all recipes in a local file on your device. You can add your own recipes by editing the recipe file directly. Here's how:

## Option 1: Add Recipes via the App (Coming Soon)

In a future update, we'll add a "Add Recipe" button in the app. For now, use Option 2.

## Option 2: Add Recipes by Editing the Code

This method requires you to have the project files on your computer.

### Step 1: Locate the Recipe File

Open the project folder and find this file:
```
makanplan/lib/seedRecipes.ts
```

### Step 2: Understand the Recipe Format

Each recipe follows this structure:

```typescript
{
  id: 'unique_recipe_id',                    // Unique identifier (lowercase, no spaces)
  name: 'Recipe Name',                       // Display name
  type: 'protein_main',                      // Type: 'protein_main', 'veg_side', or 'rice_noodle_one_pot'
  protein: 'chicken',                        // Protein: 'chicken', 'fish', 'beef', 'seafood', or 'tofu'
  hasVeg: false,                             // Does the recipe already include vegetables?
  isRice: false,                             // Is it a rice-based one-pot? (vs noodle/soup)
  isFavourite: false,                        // Mark as favourite? (appears more often)
  isStaple: false,                           // Mark as staple? (appears more often)
  ingredients: [
    '600g chicken breast',                   // Include QUANTITIES (e.g., "600g", "3 tbsp", "2 cups")
    '4 cloves garlic',
    '2 tbsp soy sauce',
  ],
  instructions: 'Pan-fry chicken...',        // Cooking instructions
  servings: 4,                               // Default servings (usually 4)
  cuisineType: 'Japanese',                   // Cuisine: 'Japanese', 'Thai', 'Cantonese', 'Vietnamese', 'Western', or 'Mixed'
  spiceLevel: 'light',                       // Spice level: 'light', 'light-medium', or 'medium'
  createdAt: Date.now(),                     // Leave as-is
}
```

### Step 3: Add Your Recipe

Open `makanplan/lib/seedRecipes.ts` and add your recipe to the `SEED_RECIPES` array. For example:

```typescript
{
  id: 'my_chicken_dish',
  name: 'My Favourite Chicken Dish',
  type: 'protein_main',
  protein: 'chicken',
  hasVeg: false,
  isRice: false,
  isFavourite: true,        // Mark as favourite so it appears often
  isStaple: true,           // Mark as staple for even higher frequency
  ingredients: [
    '600g chicken thighs',
    '3 tbsp soy sauce',
    '2 tbsp oyster sauce',
    '4 cloves garlic',
    '2 slices ginger',
  ],
  instructions: 'Braise chicken in soy and oyster sauce until tender. Serve with rice.',
  servings: 4,
  cuisineType: 'Cantonese',
  spiceLevel: 'light',
  createdAt: Date.now(),
}
```

### Step 4: Save and Test

1. Save the file
2. The app will automatically reload with your new recipe
3. Generate a weekly plan to see your recipe in the suggestions

## Important Notes

### Ingredient Quantities

**Always include quantities** so recipe scaling works correctly:

✅ Good:
- `'600g chicken breast'`
- `'3 tbsp soy sauce'`
- `'2 cups broccoli'`
- `'1 can coconut milk'`

❌ Bad:
- `'chicken breast'` (no quantity)
- `'soy sauce'` (no quantity)

### Recipe Types

| Type | Description | Example |
|------|-------------|---------|
| `protein_main` | Main protein dish (needs a veg side unless `hasVeg: true`) | Chicken Teriyaki, Miso Fish |
| `veg_side` | Vegetable side dish | Garlic Broccoli, Stir-Fried Cabbage |
| `rice_noodle_one_pot` | Rice or noodle dish (complete meal) | Chicken Rice Claypot, Pad Thai |

### Protein Types

- `chicken` — Chicken dishes
- `fish` — Fish and white fish fillets
- `beef` — Beef dishes
- `seafood` — Shrimp, squid, clams, etc.
- `tofu` — Tofu dishes

### Favourite vs Staple

- **Favourite** (`isFavourite: true`): Recipe appears 2× more often
- **Staple** (`isStaple: true`): Recipe appears 3× more often
- **Both**: Recipe appears 6× more often (3 × 2)

Mark your family's favourite dishes as both `isFavourite: true` and `isStaple: true` so they appear frequently in meal suggestions.

### Cuisine Types

- `Japanese` — Japanese cuisine
- `Thai` — Thai cuisine
- `Cantonese` — Cantonese/Hong Kong cuisine
- `Vietnamese` — Vietnamese cuisine
- `Western` — Western/European cuisine
- `Mixed` — Mixed or other cuisines

### Spice Levels

- `light` — No spice or very mild (your preference)
- `light-medium` — Mild to moderate spice
- `medium` — Moderate spice

## Example: Adding Your Three Family Favourites

If you want to add the three family favourite recipes you provided earlier:

```typescript
{
  id: 'family_chicken_broccoli',
  name: 'Chicken with Broccoli',
  type: 'protein_main',
  protein: 'chicken',
  hasVeg: true,              // Already includes broccoli
  isRice: false,
  isFavourite: true,
  isStaple: true,            // Make it a staple
  ingredients: [
    '600g chicken breast',
    '500g broccoli',
    '1 tbsp cornstarch',
    '3 cloves garlic',
    '2 tbsp oyster sauce',
    '1 tbsp soy sauce',
  ],
  instructions: 'Marinate chicken with cornstarch. Blanch broccoli. Stir-fry chicken and broccoli with garlic and sauce.',
  servings: 4,
  cuisineType: 'Cantonese',
  spiceLevel: 'light',
  createdAt: Date.now(),
}
```

## Troubleshooting

### Recipe doesn't appear in suggestions

1. Check the `id` is unique (no duplicates)
2. Verify the `protein` type is valid (chicken, fish, beef, seafood, tofu)
3. Make sure `type` is one of: `protein_main`, `veg_side`, `rice_noodle_one_pot`
4. Reload the app or restart the dev server

### Ingredient quantities not scaling

1. Make sure each ingredient has a quantity (e.g., "600g", "3 tbsp")
2. Quantities must be at the start of the ingredient string
3. Format: `"<number><unit> <ingredient>"` (e.g., "2 tbsp soy sauce")

### Recipe appears too often or not often enough

- Adjust `isFavourite` and `isStaple` flags
- `isStaple: true` = 3× frequency
- `isFavourite: true` = 2× frequency
- Both = 6× frequency

## Next Steps

Once you've added your recipes, you can:

1. **Generate weekly plans** with your custom recipes
2. **Mark recipes as favourites** in the app (tap the ⭐ icon)
3. **Export grocery lists** with your custom ingredients

Happy cooking! 🍳
