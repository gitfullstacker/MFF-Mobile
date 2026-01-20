export enum PrintFormat {
  PDF = 'pdf',
  HTML = 'html',
}

export interface PrintRecipeRequest {
  recipe_id: number;
  format?: PrintFormat;
  isPreview?: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

export interface PrintHistory {
  recipe_id: number;
  recipe_name: string;
  printed_at: string;
}

export interface PrintQuotaInfo {
  weekly_limit: number;
  current_usage: number;
  remaining: number;
  reset_date: string;
  print_history: PrintHistory[];
}

export interface CanPrintResponse {
  can_print: boolean;
  message: string;
}

export interface PrintAnalytics {
  recipe_id: number;
  recipe_name: string;
  total_prints: number;
  unique_users: number;
  last_printed: string;
}

export interface RecipePrintStats {
  recipe_id: number;
  recipe_name: string;
  total_prints: number;
  unique_users: number;
  last_printed: string;
}

export interface OverallPrintStats {
  total_prints: number;
  total_recipes_printed: number;
  total_unique_users: number;
  most_printed_recipe: PrintAnalytics | null;
}
