// src/lib/nutrition-calculator.ts

import type { Gender } from "@/types"; // Assuming Gender is 'male' | 'female' | 'other'

// --- Type Definitions ---
export type GenderInternal = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "low_active"
  | "active"
  | "very_active";

export interface BasicPatientInfo {
  age: number; // years
  gender: GenderInternal;
  weightKg: number; // kg
  heightCm: number; // cm
}

export interface GETCalculationParameters extends BasicPatientInfo {
  activityLevel: ActivityLevel;
  isObeseChildOrAdolescent?: boolean; // For children/adolescents 3-18 years
  isPregnant?: boolean;
  pregnancyTrimester?: 1 | 2 | 3;
  isLactating?: boolean;
  lactationPeriod?: 'first6' | 'after6';
  // Add other relevant conditions like lactation period if needed for future GET adjustments
}

// --- Helper Functions ---

/**
 * Converts public Gender type to internal GenderInternal type.
 */
function mapGender(gender: Gender): GenderInternal {
  if (gender === "male") return "male";
  // Default 'other' to 'female' for calculation purposes, or handle as error/specific logic if preferred.
  return "female";
}

// --- GEB Calculation (IOM 2002) ---

/**
 * Calculates Basal Metabolic Rate (GEB) using IOM 2002 formulas.
 * @param info BasicPatientInfo object
 * @returns GEB in kcal/day
 */
export function calculateGEB_IOM2002(info: BasicPatientInfo): number {
  const { age, gender, weightKg, heightCm } = info;
  const heightM = heightCm / 100;

  if (gender === "male") {
    // Adult men: GEB (kcal/day) = 662 - (9.53 × Age) + [(15.91 × Weight) + (539.6 × Height)]
    return 662 - 9.53 * age + 15.91 * weightKg + 539.6 * heightM;
  } else {
    // Adult women: GEB (kcal/day) = 354 - (6.91 × Age) + [(9.36 × Weight) + (726 × Height)]
    return 354 - 6.91 * age + 9.36 * weightKg + 726 * heightM;
  }
  // Note: These formulas are for adults. The prompt did not specify IOM 2002 for children.
  // If GEB for children using IOM 2002 is needed, those formulas would have to be added.
}

// --- GET/VET Calculation (IOM 2005 - EER) ---

/**
 * Gets the Physical Activity (PA) coefficient based on IOM 2005.
 * @param gender 'male' | 'female'
 * @param activityLevel ActivityLevel enum
 * @returns PA coefficient
 */
export function getPAcoefficient_IOM2005(
  gender: GenderInternal,
  activityLevel: ActivityLevel
): number {
  if (gender === "male") {
    switch (activityLevel) {
      case "sedentary":
        return 1.0;
      case "low_active":
        return 1.11;
      case "active":
        return 1.25;
      case "very_active":
        return 1.48;
      default:
        return 1.0;
    }
  } else {
    // female
    switch (activityLevel) {
      case "sedentary":
        return 1.0;
      case "low_active":
        return 1.12;
      case "active":
        return 1.27;
      case "very_active":
        return 1.45;
      default:
        return 1.0;
    }
  }
}

/**
 * Calculates Total Energy Expenditure (GET/VET) using IOM 2005 formulas (EER).
 * @param params GETCalculationParameters object
 * @returns GET in kcal/day
 */
export function calculateGET_IOM2005(params: GETCalculationParameters): number {
  const {
    age,
    gender,
    weightKg,
    heightCm,
    activityLevel,
    isObeseChildOrAdolescent,
    isPregnant,
    pregnancyTrimester,
    isLactating,
    lactationPeriod,
  } = params;
  const heightM = heightCm / 100;
  const paCoefficient = getPAcoefficient_IOM2005(gender, activityLevel);

  let eer = 0;

  if (age >= 19) {
    // Adults
    if (gender === "male") {
      // Adult men: GET = 662 - (9.53 × Age) + PA × [(15.91 × Weight) + (539.6 × Height)]
      eer =
        662 - 9.53 * age + paCoefficient * (15.91 * weightKg + 539.6 * heightM);
    } else {
      // female adult
      // Adult women: GET = 354 - (6.91 × Age) + PA × [(9.36 × Weight) + (726 × Height)]
      eer =
        354 - 6.91 * age + paCoefficient * (9.36 * weightKg + 726 * heightM);

      if (isPregnant) {
        if (pregnancyTrimester === 1) {
          // No additional calories needed in the 1st trimester generally, based on IOM.
          // Some sources say +0, some small amounts. IOM DRI overview usually states increase in 2nd/3rd.
          // For safety and based on common DRI summaries, we'll add for 2nd and 3rd.
        } else if (pregnancyTrimester === 2) {
          eer += 340; // Additional kcal for 2nd trimester
        } else if (pregnancyTrimester === 3) {
          eer += 452; // Additional kcal for 3rd trimester
        }
      }
      if (isLactating) {
        if (lactationPeriod === 'first6') {
          eer += 500;
        } else if (lactationPeriod === 'after6') {
          eer += 400;
        } else {
          eer += 330; // fallback default
        }
      }
    }
  } else if (age >= 3 && age <= 18) {
    // Children and Adolescents
    if (gender === "male") {
      if (isObeseChildOrAdolescent) {
        // Obese boys (3-18 years): GET = 114 - (50.9 × Age) + PA × [(19.5 × Weight) + (1161.4 × Height)]
        eer =
          114 -
          50.9 * age +
          paCoefficient * (19.5 * weightKg + 1161.4 * heightM);
      } else {
        // Boys (3-18 years): GET = 88.5 - (61.9 × Age) + PA × [(26.7 × Weight) + (903 × Height)] + 25
        eer =
          88.5 -
          61.9 * age +
          paCoefficient * (26.7 * weightKg + 903 * heightM) +
          25;
      }
    } else {
      // female child/adolescent
      if (isObeseChildOrAdolescent) {
        // Obese girls (3-18 years): GET = 389 - (41.2 × Age) + PA × [(15.0 × Weight) + (701.6 × Height)]
        eer =
          389 -
          41.2 * age +
          paCoefficient * (15.0 * weightKg + 701.6 * heightM);
      } else {
        // Girls (3-18 years): GET = 135.3 - (30.8 × Age) + PA × [(10.0 × Weight) + (934 × Height)] + 20
        // Note: The prompt mentions +20 for girls, other sources might say +25. Sticking to prompt.
        eer =
          135.3 -
          30.8 * age +
          paCoefficient * (10.0 * weightKg + 934 * heightM) +
          20;
      }
    }
  }
  // Add a clause for age < 3 if formulas are available and needed. (BABY)
  return Math.round(eer);
}

// --- Macronutrient Distribution Calculation ---

export interface MacronutrientPercentageRanges {
  carbohydrates: { min: number; max: number };
  proteins: { min: number; max: number };
  lipids: { min: number; max: number };
}

export interface RangedMacronutrientGrams {
  carbohydrates: { minG: number; maxG: number };
  proteins: { minG: number; maxG: number };
  lipids: { minG: number; maxG: number };
}

export interface TargetMacronutrientDistribution {
  carbohydrate: number;
  protein: number;
  lipid: number;
}

export interface SimpleMacronutrientValues {
  cho: number;
  ptn: number;
  lip: number;
}

export interface CalculatedMacronutrientValues {
  grams: SimpleMacronutrientValues;
  kcal: SimpleMacronutrientValues;
  perKg?: SimpleMacronutrientValues;
}

/**
 * Calculates macronutrient ranges in grams based on VET and percentage ranges.
 * @param vet Valor Energético Total (kcal/day)
 * @param percentages MacronutrientPercentageRanges object
 * @returns RangedMacronutrientGrams object
 */
export function calculateMacronutrientRanges(
  vet: number,
  percentages: MacronutrientPercentageRanges = {
    carbohydrates: { min: 0.45, max: 0.65 },
    proteins: { min: 0.1, max: 0.35 },
    lipids: { min: 0.2, max: 0.35 },
  }
): RangedMacronutrientGrams {
  const { carbohydrates, proteins, lipids } = percentages;

  const choGrams = {
    minG: Math.round((vet * carbohydrates.min) / 4),
    maxG: Math.round((vet * carbohydrates.max) / 4),
  };
  const proGrams = {
    minG: Math.round((vet * proteins.min) / 4),
    maxG: Math.round((vet * proteins.max) / 4),
  };
  const lipGrams = {
    minG: Math.round((vet * lipids.min) / 9),
    maxG: Math.round((vet * lipids.max) / 9),
  };

  return {
    carbohydrates: choGrams,
    proteins: proGrams,
    lipids: lipGrams,
  };
}

/**
 * Calculates recommended macronutrient amounts (grams, kcal, g/kg) based on total kcal and target percentages.
 * @param totalKcal Total kilocalories for the day.
 * @param targets TargetMacronutrientDistribution object with percentages (0-100).
 * @param weightKg Optional patient weight in kg for g/kg calculation.
 * @returns CalculatedMacronutrientValues object.
 */
export function calculateRecommendedMacronutrients(
  totalKcal: number,
  targets: TargetMacronutrientDistribution,
  weightKg?: number
): CalculatedMacronutrientValues {
  const kcalCHO = (totalKcal * targets.carbohydrate) / 100;
  const kcalPTN = (totalKcal * targets.protein) / 100;
  const kcalLIP = (totalKcal * targets.lipid) / 100;

  const gramsCHO = kcalCHO / 4;
  const gramsPTN = kcalPTN / 4;
  const gramsLIP = kcalLIP / 9;

  const result: CalculatedMacronutrientValues = {
    grams: {
      cho: parseFloat(gramsCHO.toFixed(1)),
      ptn: parseFloat(gramsPTN.toFixed(1)),
      lip: parseFloat(gramsLIP.toFixed(1)),
    },
    kcal: {
      cho: parseFloat(kcalCHO.toFixed(0)),
      ptn: parseFloat(kcalPTN.toFixed(0)),
      lip: parseFloat(kcalLIP.toFixed(0)),
    },
  };

  if (weightKg && weightKg > 0) {
    result.perKg = {
      cho: parseFloat((gramsCHO / weightKg).toFixed(1)),
      ptn: parseFloat((gramsPTN / weightKg).toFixed(1)),
      lip: parseFloat((gramsLIP / weightKg).toFixed(1)),
    };
  }
  return result;
}

// --- Micronutrient Recommendation Calculations ---

export interface MicronutrientInput
  extends Omit<BasicPatientInfo, "heightCm" | "weightKg"> {
  isPregnant?: boolean;
  isLactating?: boolean;
  // specialConditions?: string[];
}

// --- MINERALS ---

/** 1. Calcium (mg/day) */
export function getCalciumRecommendation(params: MicronutrientInput): number {
  const { age, gender, isPregnant, isLactating } = params;
  if (isPregnant || isLactating) {
    return age < 19 ? 1300 : 1000;
  }
  if (gender === "female" && age >= 51) return 1200;
  if (gender === "male" && age >= 71) return 1200;
  if (age >= 19 && age <= 50) return 1000;
  if (gender === "male" && age >= 51 && age <= 70) return 1000;
  return 1000;
}

/** 2. Iron (mg/day) */
export function getIronRecommendation(params: MicronutrientInput): number {
  const { age, gender, isPregnant } = params;
  if (isPregnant) return 27;
  if (gender === "female") {
    if (age >= 19 && age <= 50) return 18;
    if (age >= 51) return 8;
  }
  if (gender === "male" && age >= 19) return 8;
  return 8;
}

/** 3. Zinc (mg/day) */
export function getZincRecommendation(params: MicronutrientInput): number {
  const { gender, isPregnant } = params;
  if (isPregnant) return 11;
  if (gender === "male") return 11;
  if (gender === "female") return 8;
  return 8;
}

/** 4. Magnesium (mg/day) */
export function getMagnesiumRecommendation(params: MicronutrientInput): number {
  const { age, gender } = params;
  if (gender === "male") {
    return age >= 19 && age <= 30 ? 400 : 420;
  }
  if (gender === "female") {
    return age >= 19 && age <= 30 ? 310 : 320;
  }
  return 310;
}

/** 5. Selenium (mcg/day) - Fixed Value */
export function getSeleniumRecommendation(): number {
  return 55;
}

/** 6. Iodine (mcg/day) */
export function getIodineRecommendation(params: MicronutrientInput): number {
  const { isPregnant } = params;
  if (isPregnant) return 220;
  return 150;
}

/** 7. Potassium (mg/day) - AI */
export function getPotassiumRecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 3400;
  if (gender === "female") return 2600;
  return 2600;
}

/** 8. Sodium (mg/day) - AI */
export function getSodiumRecommendation(): number {
  return 1500;
  // UL is 2300 mg/day, can be displayed separately if needed
}

/** 9. Phosphorus (mg/day) */
export function getPhosphorusRecommendation(): number {
  return 700;
}

/** 10. Copper (mcg/day) - Fixed Value */
export function getCopperRecommendation(): number {
  return 900;
}

/** 11. Chromium (mcg/day) - AI */
export function getChromiumRecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 35;
  if (gender === "female") return 25;
  return 25;
}

/** 12. Manganese (mg/day) - AI */
export function getManganeseRecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 2.3;
  if (gender === "female") return 1.8;
  return 1.8;
}

// --- VITAMINS ---

/** 1. Vitamin A (mcg RAE/day) */
export function getVitaminARecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 900;
  if (gender === "female") return 700;
  return 700;
}

/** 2. Vitamin D (mcg/day) */
export function getVitaminDRecommendation(params: MicronutrientInput): number {
  const { age } = params;
  if (age > 70) return 20;
  return 15;
}

/** 3. Vitamin E (mg/day α-Tocopherol) */
export function getVitaminERecommendation(): number {
  return 15;
}

/** 4. Vitamin C (mg/day) */
export function getVitaminCRecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 90;
  if (gender === "female") return 75;
  return 75;
}

/** 5. Thiamin (B1) (mg/day) */
export function getThiaminRecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 1.2;
  if (gender === "female") return 1.1;
  return 1.1;
}

/** 6. Riboflavin (B2) (mg/day) */
export function getRiboflavinRecommendation(
  params: MicronutrientInput
): number {
  const { gender } = params;
  if (gender === "male") return 1.3;
  if (gender === "female") return 1.1;
  return 1.1;
}

/** 7. Niacin (B3) (mg NE/day) */
export function getNiacinRecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 16;
  if (gender === "female") return 14;
  return 14;
}

/** 8. Pantothenic Acid (B5) (mg/day) - AI */
export function getPantothenicAcidRecommendation(): number {
  return 5;
}

/** 9. Pyridoxine (B6) (mg/day) */
export function getPyridoxineRecommendation(
  params: MicronutrientInput
): number {
  const { age, gender } = params;
  if (age >= 19 && age <= 50) return 1.3;
  if (gender === "male" && age >= 51) return 1.7;
  if (gender === "female" && age >= 51) return 1.5;
  return 1.3;
}

/** 10. Biotin (B7) (mcg/day) - AI */
export function getBiotinRecommendation(): number {
  return 30;
}

/** 11. Folate (B9) (mcg DFE/day) */
export function getFolateRecommendation(params: MicronutrientInput): number {
  const { isPregnant } = params;
  if (isPregnant) return 600;
  return 400;
}

/** 12. Cobalamin (B12) (mcg/day) - Fixed Value */
export function getCobalaminRecommendation(): number {
  return 2.4;
}

/** 13. Choline (mg/day) - AI */
export function getCholineRecommendation(params: MicronutrientInput): number {
  const { gender } = params;
  if (gender === "male") return 550;
  if (gender === "female") return 425;
  return 425;
}

// Placeholder for other nutrient functions - to be detailed in the next step
// Example:
// export function getCalciumRecommendation(age: number, gender: GenderInternal, isPregnant?: boolean, isLactating?: boolean): string { ... }

/**
 * Helper to map public Gender to internal GenderInternal for use with calculators.
 * This function will be used by components before calling the calculation functions.
 */
export function getInternalGender(publicGender: Gender): GenderInternal {
  if (publicGender === "male") return "male";
  return "female";
}

console.log("Nutrition calculator with micronutrients loaded");
