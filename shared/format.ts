/** Formátování čísel v české konvenci (podle Statni-dluh/shared/format.ts). */

const LOCALE = 'cs-CZ';

/**
 * Zápis měny. Návrh používá malé „kč“; spisovně je to „Kč“.
 * Změna na jednom místě se propíše všude.
 */
const UNIT = 'kč';

/** Úzká nezlomitelná mezera (U+202F) – oddělovač tisíců. */
const THIN_NBSP = ' ';

const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/**
 * `48 000` — plná koruna, bez haléřů.
 * ICU podle verze vrací jako oddělovač U+00A0 nebo U+202F;
 * sjednocujeme na úzkou mezeru, aby výstup nezávisel na prohlížeči.
 */
export function czk(value: number): string {
  return integer.format(Math.round(value)).replace(/[   ]/g, THIN_NBSP);
}

/** `48 000 kč` — mezi číslem a jednotkou nezlomitelná mezera. */
export function czkWithUnit(value: number): string {
  return `${czk(value)} ${UNIT}`;
}

/** `7,1 %` */
export function percent(fraction: number, digits = 1): string {
  return `${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fraction * 100)} %`;
}
