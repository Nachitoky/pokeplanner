export type Generation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy',
] as const;
export type PokemonType = (typeof POKEMON_TYPES)[number];

export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
export type StatKey = (typeof STAT_KEYS)[number];
export type Stats = Record<StatKey, number>;

export type EvolutionMethod = 'level' | 'stone' | 'trade' | 'friendship' | 'other';

export interface EvolutionLink {
  to: number;            // id nacional de la especie destino
  method: EvolutionMethod;
  level?: number;        // solo si method === 'level'
}

/** Datos de la especie, iguales en todas las versiones. */
export interface Species {
  id: number;            // número de Pokédex nacional
  slug: string;          // 'gardevoir'
  names: { en: string; es: string };
  evolutions: EvolutionLink[];
  isLegendary: boolean;  // legendarios y singulares
}

/** Datos que cambian según la generación. */
export interface SpeciesGenData {
  speciesId: number;
  types: PokemonType[];
  baseStats: Stats;
  abilities: string[];   // vacío en Gen I-II
}

/** Cómo se consigue una especie en una versión concreta. */
export interface Availability {
  speciesId: number;
  method: 'wild' | 'gift' | 'static' | 'trade' | 'fossil';
  location: string;
  minBadges: number;     // 0-8: medallas necesarias para llegar
}

export interface GameVersion {
  id: string;            // 'emerald'
  generation: Generation;
  names: { en: string; es: string };
  pokedex: number[];     // ids legales en la historia
  availability: Availability[];
  levelByBadges: number[]; // nivel estimado del equipo según medallas (9 valores)
  exclusives: Record<number, string[]>; // especie -> versiones donde aparece
}