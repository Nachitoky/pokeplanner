import { POKEMON_TYPES, type Generation, type PokemonType } from './types';

// chart[atacante][defensor] = multiplicador. Si falta, vale 1.
export type TypeChart = Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>>;

// Tabla actual (generacion VI en adelante).
export const CHART_GEN6: TypeChart = {
  normal:   { rock: 0.5, steel: 0.5, ghost: 0 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

// Copia la tabla quitando tipos que no existían y aplicando cambios [atq, def, mult].
function derive(
  base: TypeChart,
  removed: PokemonType[],
  patches: [PokemonType, PokemonType, number][] = [],
): TypeChart {
  const out: TypeChart = {};
  for (const atk of POKEMON_TYPES) {
    if (removed.includes(atk)) continue;
    const row: Partial<Record<PokemonType, number>> = {};
    for (const [def, m] of Object.entries(base[atk] ?? {}) as [PokemonType, number][]) {
      if (!removed.includes(def)) row[def] = m;
    }
    out[atk] = row;
  }
  for (const [atk, def, m] of patches) {
    const row = (out[atk] ??= {});
    if (m === 1) delete row[def];
    else row[def] = m;
  }
  return out;
}

// generacion II-V: sin tipo Hada. Acero resiste Fantasma y Siniestro.
export const CHART_GEN2_5 = derive(CHART_GEN6, ['fairy'], [
  ['ghost', 'steel', 0.5],
  ['dark', 'steel', 0.5],
]);

// generacion I: sin Siniestro, Acero ni Hada.
export const CHART_GEN1 = derive(CHART_GEN6, ['dark', 'steel', 'fairy'], [
  ['ghost', 'psychic', 0],  // fallo famoso de Gen I
  ['poison', 'bug', 2],
  ['bug', 'poison', 2],
  ['ice', 'fire', 1],
]);

export function getChart(gen: Generation): TypeChart {
  if (gen === 1) return CHART_GEN1;
  if (gen <= 5) return CHART_GEN2_5;
  return CHART_GEN6;
}

// Multiplicador de un ataque `atk` contra un Pokémon con tipos `defTypes`
export function multiplier(chart: TypeChart, atk: PokemonType, defTypes: PokemonType[]): number {
  return defTypes.reduce((acc, def) => acc * (chart[atk]?.[def] ?? 1), 1);
}

export interface DefenseProfile {
  weak: number;    // miembros que reciben más de 1x
  resist: number;  // miembros que reciben menos de 1x (sin ser inmunes)
  immune: number;  // miembros que reciben 0x
}

// Por cada tipo atacante, cuántos miembros del equipo son débiles, resisten o son inmunes.
export function defenseProfile(
  chart: TypeChart,
  team: PokemonType[][],
): Partial<Record<PokemonType, DefenseProfile>> {
  const result: Partial<Record<PokemonType, DefenseProfile>> = {};
  for (const atk of POKEMON_TYPES) {
    if (!chart[atk]) continue; // tipo inexistente en esa generación
    const p: DefenseProfile = { weak: 0, resist: 0, immune: 0 };
    for (const types of team) {
      const m = multiplier(chart, atk, types);
      if (m === 0) p.immune++;
      else if (m > 1) p.weak++;
      else if (m < 1) p.resist++;
    }
    result[atk] = p;
  }
  return result;
}