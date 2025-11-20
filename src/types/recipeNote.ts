export interface RecipeNote {
  _id: string;
  user_id: number;
  recipe: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecipeNoteDto {
  note: string;
}

export interface UpdateRecipeNoteDto {
  note?: string;
}
