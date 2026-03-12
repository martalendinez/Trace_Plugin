import { critiqueLibrary } from "../data/critiqueRules";
import type { CritiqueCategory, CritiqueItem } from "../types";

export function generateCritiques(
  activeCategories: CritiqueCategory[]
): CritiqueItem[] {
  return critiqueLibrary.filter((item) =>
    activeCategories.includes(item.category)
  );
}