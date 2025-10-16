// Basic nutrition profile information
export interface BasicInfo {
  age: number;
  gender: 'male' | 'female';
  height: number; // in inches
  weight: number; // in pounds
  bodyFatPercentage?: number;
}

// Activity and goals information
export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type FitnessGoal =
  | 'lose_weight'
  | 'maintain_weight'
  | 'gain_weight'
  | 'build_muscle'
  | 'cut'
  | 'bulk';

export interface ActivityGoals {
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  mealsPerDay: number;
}

// Calculated nutrition information
export interface MacroDistribution {
  grams: number;
  percentage: number;
}

export interface CalculatedNutrition {
  basalMetabolicRate: number; // BMR in calories
  totalDailyEnergyExpenditure: number; // TDEE in calories
  recommendedCalories: number; // Daily calorie target
  macros: {
    protein: MacroDistribution;
    carbohydrates: MacroDistribution;
    fats: MacroDistribution;
  };
  bodyFatCategory?: string; // e.g., 'Athletes', 'Fitness', 'Average', etc.
}

export interface TargetMacros {
  protein: number; // grams
  carbohydrates: number; // grams
  fats: number; // grams
}

// Main nutrition profile
export interface NutritionProfile {
  _id: string;
  user_id: number;
  basicInfo: BasicInfo;
  activityGoals: ActivityGoals;
  calculatedNutrition?: CalculatedNutrition;
  targetMacros?: TargetMacros;
  created_at: string;
  updated_at: string;
}

// DTOs for API requests
export interface CreateNutritionProfileRequest {
  basicInfo: BasicInfo;
  activityGoals: ActivityGoals;
}

export interface UpdateNutritionProfileRequest {
  basicInfo?: Partial<BasicInfo>;
  activityGoals?: Partial<ActivityGoals>;
}

export interface UpdateTargetMacrosRequest {
  protein: number; // grams
  carbohydrates: number; // grams
  fats: number; // grams
}

export interface AnalyzeBodyFatRequest {
  imageData: string; // Base64 encoded image data
  mimeType?: string; // e.g., 'image/jpeg', 'image/png'
}

// API Response types
export interface AnalyzeBodyFatResponse {
  estimatedBodyFat: number;
  category: string;
  confidence: number;
  recommendations: string;
}

export interface AIAdviceResponse {
  advice: string;
  recommendations?: string[];
}
