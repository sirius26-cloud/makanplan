import { Recipe } from './types';

/**
 * Family favourite recipes from user's collection
 */
export const FAMILY_FAVOURITE_RECIPES: Recipe[] = [
  {
    id: 'chicken_broccoli',
    name: 'Chicken with Broccoli',
    type: 'protein_main',
    protein: 'chicken',
    hasVeg: true,
    isRice: false,
    isFavourite: true,
    isStaple: true,
    ingredients: [
      'chicken breast',
      'broccoli florets',
      'carrots',
      'cornstarch',
      'soy sauce',
      'oyster sauce',
      'garlic',
      'ginger',
      'green onion',
      'sesame oil',
    ],
    instructions:
      'Marinate chicken with cornstarch, soy sauce, oyster sauce. Blanch broccoli. Velvet chicken in wok, then stir-fry with broccoli, carrots, and aromatics. Add sauce and cornstarch slurry. Finish with sesame oil.',
    servings: 4,
    cuisineType: 'Cantonese',
    spiceLevel: 'light',
    createdAt: Date.now(),
  },
  {
    id: 'three_cup_chicken',
    name: 'Three-Cup Chicken Claypot',
    type: 'protein_main',
    protein: 'chicken',
    hasVeg: false,
    isRice: false,
    isFavourite: true,
    isStaple: true,
    ingredients: [
      'chicken thighs',
      'garlic cloves',
      'ginger slices',
      'shallots',
      'dried red chilli',
      'green onion',
      'basil stalks',
      'rice wine',
      'dark soy sauce',
      'light soy sauce',
      'sesame oil',
      'Shaoxing wine',
      'sugar',
    ],
    instructions:
      'Marinate chicken. Fry aromatics in wok, brown chicken. Caramelize with sugar and half the gravy. Transfer to claypot with basil and remaining gravy. Stew 3-4 minutes on low heat. Drizzle Shaoxing wine and serve.',
    servings: 4,
    cuisineType: 'Mixed',
    spiceLevel: 'light-medium',
    createdAt: Date.now(),
  },
  {
    id: 'salmon_one_pot_rice',
    name: 'Savoury Garlic Soy Salmon One-Pot Rice',
    type: 'rice_noodle_one_pot',
    protein: 'fish',
    hasVeg: true,
    isRice: true,
    isFavourite: true,
    isStaple: true,
    ingredients: [
      'salmon fillet',
      'rice',
      'cabbage',
      'mushrooms',
      'garlic',
      'soy sauce',
      'sake',
      'sugar',
      'salt',
      'oil',
    ],
    instructions:
      'Cook rice with sake in rice cooker. Sauté garlic, mushrooms, and cabbage. Pan-fry salmon skin-side down, add sauce when half-cooked. Serve salmon and vegetables over rice.',
    servings: 3,
    cuisineType: 'Japanese',
    spiceLevel: 'light',
    createdAt: Date.now(),
  },
];

/**
 * Similar dishes to suggest when a recipe is selected
 * Maps recipe ID to similar recipe IDs
 */
export const SIMILAR_DISHES: Record<string, string[]> = {
  chicken_broccoli: ['thai_chicken_basil', 'cantonese_chicken_soy', 'chicken_teriyaki'],
  three_cup_chicken: ['cantonese_chicken_soy', 'chicken_teriyaki', 'vietnamese_chicken_lemongrass'],
  salmon_one_pot_rice: ['chicken_rice_claypot', 'chicken_noodle_soup', 'pad_thai'],
  chicken_teriyaki: ['chicken_broccoli', 'three_cup_chicken', 'thai_chicken_basil'],
  thai_chicken_basil: ['chicken_broccoli', 'thai_shrimp_paste', 'pad_thai'],
  cantonese_chicken_soy: ['three_cup_chicken', 'chicken_broccoli', 'steamed_fish_with_ginger'],
  fish_miso_butter: ['salmon_one_pot_rice', 'cantonese_steamed_fish', 'thai_fish_curry'],
  pad_thai: ['chicken_noodle_soup', 'salmon_one_pot_rice', 'chicken_rice_claypot'],
};
