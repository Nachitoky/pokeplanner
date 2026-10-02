import { describe, it, expect } from 'vitest';
import { CHART_GEN6, CHART_GEN2_5, CHART_GEN1, getChart, multiplier, defenseProfile } from './typeChart';

describe('multiplier', () => {
  it('doble tipo: Fuego/Volador es 4x débil a Roca', () => {
    expect(multiplier(CHART_GEN6, 'rock', ['fire', 'flying'])).toBe(4);
  });
  it('inmunidad anula debilidad: Tierra no afecta a Volador/Agua', () => {
    expect(multiplier(CHART_GEN6, 'ground', ['flying', 'water'])).toBe(0);
  });
});

describe('tablas por generación', () => {
  it('Gen V no tiene Hada', () => {
    expect(getChart(5).fairy).toBeUndefined();
  });
  it('Acero resiste Fantasma en Gen II-V pero no en Gen VI', () => {
    expect(multiplier(CHART_GEN2_5, 'ghost', ['steel'])).toBe(0.5);
    expect(multiplier(CHART_GEN6, 'ghost', ['steel'])).toBe(1);
  });
  it('Gen I: Fantasma no afecta a Psíquico', () => {
    expect(multiplier(CHART_GEN1, 'ghost', ['psychic'])).toBe(0);
  });
});

describe('defenseProfile', () => {
  it('cuenta debilidades acumuladas', () => {
    const team = [['fire'], ['grass'], ['bug']] as const;
    const p = defenseProfile(CHART_GEN6, team.map(t => [...t]));
    expect(p.fire?.weak).toBe(2); // Planta y Bicho
    expect(p.fire?.resist).toBe(1); // Fuego
  });
});