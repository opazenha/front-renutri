import type { TacoItem } from '@/types';

// Using dynamic import for JSON to work with Next.js
const foodJson = (() => {
  try {
    // This will be replaced by webpack with the actual JSON content
    return require('@/misc/food.json');
  } catch (e) {
    console.error('Failed to load food.json', e);
    return [];
  }
})();

type FoodJsonItem = {
  id: number;
  category: string;
  name: string;
  composition: Array<{
    component: string;
    amount: number | null;
    unit: string;
  }>;
};

type FoodJson = FoodJsonItem[];

interface FoodItem extends FoodJsonItem {
  id: number;
  category: string;
  name: string;
  composition: Array<{
    component: string;
    amount: number | null;
    unit: string;
  }>;
}

const getComponentValue = (components: FoodItem['composition'], componentName: string): number | null => {
  const component = components.find(c => c.component === componentName);
  return component?.amount ?? null;
};

export const foodData: TacoItem[] = (foodJson as FoodJson).map((item: FoodItem) => {
  return {
    id: item.id,
    alimento_descricao: item.name,
    categoria: item.category,
    umidade_percent: getComponentValue(item.composition, 'agua'),
    energia_kcal: getComponentValue(item.composition, 'energia'),
    energia_kj: null, // Not available in source data
    proteina_g: getComponentValue(item.composition, 'pro'),
    lipidios_g: getComponentValue(item.composition, 'lip'),
    colesterol_mg: getComponentValue(item.composition, 'col'),
    carboidrato_g: getComponentValue(item.composition, 'gli'),
    fibra_alimentar_g: getComponentValue(item.composition, 'fib'),
    cinzas_g: null, // Not available in source data
    
    // Minerals
    calcio_mg: getComponentValue(item.composition, 'ca'),
    magnesio_mg: getComponentValue(item.composition, 'mg'),
    manganes_mg: getComponentValue(item.composition, 'mn'),
    fosforo_mg: getComponentValue(item.composition, 'p'),
    ferro_mg: getComponentValue(item.composition, 'fe'),
    sodio_mg: getComponentValue(item.composition, 'na'),
    potassio_mg: getComponentValue(item.composition, 'k'),
    cobre_mg: getComponentValue(item.composition, 'cu'),
    zinco_mg: getComponentValue(item.composition, 'zn'),
    selenio_mcg: getComponentValue(item.composition, 'se'),
    iodo_mcg: getComponentValue(item.composition, 'i'),
    
    // Vitamins
    retinol_mcg: getComponentValue(item.composition, 'ret'),
    re_mcg: getComponentValue(item.composition, 'vit_a'), // RE (Retinol Equivalents)
    rae_mcg: getComponentValue(item.composition, 'vit_a'), // RAE (Retinol Activity Equivalents)
    tiamina_mg: getComponentValue(item.composition, 'vit_b1'),
    riboflavina_mg: getComponentValue(item.composition, 'vit_b2'),
    piridoxina_mg: getComponentValue(item.composition, 'vit_b6'),
    cobalamina_mcg: getComponentValue(item.composition, 'vit_b12'),
    niacina_mg: getComponentValue(item.composition, 'nia'),
    acido_pantotenico_mg: getComponentValue(item.composition, 'pan'),
    acido_folico_mcg: getComponentValue(item.composition, 'ac_fol'),
    vitamina_c_mg: getComponentValue(item.composition, 'vit_c'),
    vitamina_d_mcg: getComponentValue(item.composition, 'vit_d'),
    vitamina_e_mg: getComponentValue(item.composition, 'vit_e'),
    
    // Fatty acids
    '12:0': getComponentValue(item.composition, '12:0'),
    '14:0': getComponentValue(item.composition, '14:0'),
    '16:0': getComponentValue(item.composition, '16:0'),
    '16:1': getComponentValue(item.composition, '16:1'),
    '18:0': getComponentValue(item.composition, '18:0'),
    '18:1': getComponentValue(item.composition, 'mon'), // Mono-unsaturated
    '18:2 n-6': getComponentValue(item.composition, 'pol'), // Poly-unsaturated (n-6)
    '18:3 n-3': getComponentValue(item.composition, '18:3'), // Omega-3
    '20:4': getComponentValue(item.composition, '20:4'),
    '20:5': getComponentValue(item.composition, '20:5'), // EPA
    '22:5': getComponentValue(item.composition, '22:5'), // DPA
    '22:6': getComponentValue(item.composition, '22:6'), // DHA
    '18:1t': getComponentValue(item.composition, 'trans'), // Trans fats
    '18:2t': getComponentValue(item.composition, '18:2t'),
    
    // Additional fields
    acucar_g: getComponentValue(item.composition, 'acucar'), // If available
    acucar_adicionado_g: getComponentValue(item.composition, 'acucar_adicionado'), // If available
    '20:0': getComponentValue(item.composition, '20:0'),
    '22:0': getComponentValue(item.composition, '22:0'),
    '24:0': getComponentValue(item.composition, '24:0'),
    '14:1': getComponentValue(item.composition, '14:1'),
    '20:1': getComponentValue(item.composition, '20:1')
  };
});
