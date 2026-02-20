import { z } from 'zod';

// Battle Action Validation
export const battleActionSchema = z.object({
  pokemonIndex: z.number().int().min(0).max(2, 'Invalid Pokemon index'),
  moveIndex: z.number().int().min(0).max(3, 'Invalid move index'),
  targetIndex: z.number().int().min(0).max(2, 'Invalid target index'),
});

export type BattleAction = z.infer<typeof battleActionSchema>;

// Energy Selection Validation
export const energySelectionSchema = z.object({
  selectedTypes: z.array(
    z.enum(['grass', 'fire', 'water', 'electric', 'psychic', 'fighting', 'darkness', 'metal', 'dragon'])
  ).length(4, 'Must select exactly 4 energy types'),
});

export type EnergySelection = z.infer<typeof energySelectionSchema>;

// Item Usage Validation
export const itemUsageSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  targetIndex: z.number().int().min(0).max(2, 'Invalid target index'),
});

export type ItemUsage = z.infer<typeof itemUsageSchema>;

// Evolution Validation
export const evolutionSchema = z.object({
  pokemonIndex: z.number().int().min(0).max(2, 'Invalid Pokemon index'),
});

export type Evolution = z.infer<typeof evolutionSchema>;

// Battle Result Validation
export const battleResultSchema = z.object({
  battleId: z.string().uuid('Invalid battle ID'),
  winner: z.enum(['player1', 'player2']),
  turns: z.number().int().positive('Turns must be positive'),
  player1Damage: z.number().int().nonnegative('Damage cannot be negative'),
  player2Damage: z.number().int().nonnegative('Damage cannot be negative'),
  duration: z.number().int().positive('Duration must be positive'),
});

export type BattleResult = z.infer<typeof battleResultSchema>;

// Team Selection Validation
export const teamSelectionSchema = z.object({
  pokemon: z.array(
    z.object({
      id: z.number().int().positive('Invalid Pokemon ID'),
      position: z.number().int().min(0).max(2, 'Invalid position'),
    })
  ).length(3, 'Team must have exactly 3 Pokemon'),
});

export type TeamSelection = z.infer<typeof teamSelectionSchema>;

// Matchmaking Validation
export const matchmakingSchema = z.object({
  queueType: z.enum(['casual', 'ranked', 'tournament']),
  teamId: z.string().uuid('Invalid team ID').optional(),
});

export type Matchmaking = z.infer<typeof matchmakingSchema>;

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { 
        success: false, 
        error: firstError.message || 'Validation failed' 
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

// Safe validation (returns null on error)
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}
