// generateCritiques.ts
// This file is now deprecated because critiques come from the backend.
// Keeping it for compatibility, but it returns an empty array.

import type { CritiqueItem, CritiqueCategory } from "../types";

export function generateCritiques(
  _activeCategories: CritiqueCategory[]
): CritiqueItem[] {
  return [];
}
