import type { SortOption, SortOrder } from '@/components/foods/FoodSort';
import type { Food } from '@/types';

export const sortFoods = (
  foods: Food[],
  sortBy: SortOption,
  order: SortOrder
): Food[] => {
  const sortedFoods = [...foods];

  sortedFoods.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'ja');
        break;
      case 'expiryDate':
        comparison =
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        break;
      case 'registeredAt':
        comparison = a.registeredAt.seconds - b.registeredAt.seconds;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category, 'ja');
        break;
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sortedFoods;
};
