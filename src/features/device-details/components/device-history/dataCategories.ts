
import { DataCategory } from './types';

export const getDataCategories = (t: (category: string, key: string) => string): Record<string, DataCategory> => ({
  wholeGrain: {
    title: t('general', 'dataCategoryWholeGrain'),
    icon: "🌾",
    color: "bg-green-50 border-green-200",
    fields: ['class1', 'class2', 'class3', 'short_grain', 'slender_kernel']
  },
  composition: {
    title: t('general', 'dataCategoryComposition'),
    icon: "🔬",
    color: "bg-purple-50 border-purple-200", 
    fields: ['whole_kernels', 'head_rice', 'total_brokens', 'small_brokens', 'small_brokens_c1']
  },
  characteristics: {
    title: t('general', 'dataCategoryCharacteristics'),
    icon: "⚠️",
    color: "bg-orange-50 border-orange-200",
    fields: [
      'whiteness', 'red_line_rate', 'parboiled_red_line', 'parboiled_white_rice', 'honey_rice',
      'yellow_rice_rate', 'black_kernel', 'partly_black_peck', 'partly_black',
      'imperfection_rate', 'sticky_rice_rate', 'impurity_num', 'paddy_rate',
      'process_precision'
    ]
  }
});
