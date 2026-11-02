/**
 * Výpočetní jádro kalkulačky čisté mzdy (zaměstnanec, hlavní pracovní poměr).
 *
 * Čisté funkce bez závislostí na UI. Všechny částky v Kč za měsíc,
 * pokud název neříká jinak. Parametry roku jsou v `params2026.ts`.
 */

import { PARAMS_2026, type Params } from './params2026';

// ── Vstupy ────────────────────────────────────────────────────────────────

export interface ChildInput {
  /** Dítě je držitelem průkazu ZTP/P → dvojnásobná sleva. */
  ztpp?: boolean;
}

export type Disability = 'none' | 'deg12' | 'deg3';

export interface PayrollInput {
  /** Hrubá měsíční mzda. */
  gross: number;
  /** Podepsané prohlášení poplatníka; bez něj se neuplatní žádné slevy. Výchozí true. */
  declaration?: boolean;
  /** Plný úvazek → ZP se platí alespoň z minimální mzdy. Výchozí true. */
  fullTime?: boolean;
  /** Vyživované děti v pořadí 1., 2., 3. a další. */
  children?: ChildInput[];
  /** Invalidita poplatníka. Výchozí 'none'. */
  disability?: Disability;
  /** Poplatník je držitelem průkazu ZTP/P. */
  ztpp?: boolean;
}

/** Vstup pro obrácený výpočet – vše kromě hrubé mzdy. */
export type GrossFromNetOptions = Omit<PayrollInput, 'gross'>;

export interface SpouseInput {
  /** Vlastní roční příjem manžela/manželky (rozhoduje limit 68 000 Kč). */
  income: number;
  /** Manžel/ka je držitelem průkazu ZTP/P → dvojnásobná sleva. */
  ztpp?: boolean;
  /** Počet měsíců, kdy žil/a ve společné domácnosti. Výchozí 12. */
  months?: number;
}

export interface AnnualExtras {
  /** Příspěvky na penzijní spoření + životní pojištění za rok (strop 48 000 dohromady). */
  pensionAndLifeInsurance?: number;
  /** Zaplacené úroky z hypotéky za rok (strop 150 000). */
  mortgageInterest?: number;
  /** Dary za rok (min. 2 % nebo 1 000 Kč, max. 15 % základu). */
  donations?: number;
  /** Sleva na manžela/manželku. */
  spouse?: SpouseInput;
}

// ── Výstupy ───────────────────────────────────────────────────────────────

export interface CreditsBreakdown {
  /** Sleva na poplatníka. */
  taxpayer: number;
  /** Sleva na invaliditu. */
  disability: number;
  /** Sleva na držitele ZTP/P. */
  ztpp: number;
  /** Sleva na děti celkem (může přejít v bonus). */
  children: number;
}

export interface PayrollWarnings {
  /** Hrubá mzda je pod minimální mzdou. */
  belowMinimumWage: boolean;
  /** Bez prohlášení poplatníka – žádné slevy. */
  noDeclaration: boolean;
  /** Sleva na děti převyšuje daň, ale příjem nedosahuje hranice pro bonus. */
  bonusIncomeTooLow: boolean;
}

export interface PayrollResult {
  gross: number;
  /** Sociální pojištění zaměstnance (6,5 % + 0,6 %). */
  socialEmployee: number;
  /** Zdravotní pojištění zaměstnance včetně doplatku do minima. */
  healthEmployee: number;
  /** Z toho doplatek ZP do minimálního vyměřovacího základu. */
  healthTopUp: number;
  /** Základ daně (hrubá zaokrouhlená nahoru na koruny). */
  taxBase: number;
  /** Záloha na daň před slevami. */
  taxBeforeCredits: number;
  /** Nárok na slevy (nominálně, před omezením výší daně). */
  credits: CreditsBreakdown;
  /** Slevy skutečně uplatněné proti dani. */
  creditsApplied: number;
  /** Záloha na daň po slevách. */
  taxAdvance: number;
  /** Daňový bonus na děti. */
  childBonus: number;
  /** Čistá mzda = hrubá − SP − ZP − záloha + bonus. */
  net: number;
  /** Sociální pojištění zaměstnavatele. */
  socialEmployer: number;
  /** Zdravotní pojištění zaměstnavatele. */
  healthEmployer: number;
  /** Celkové mzdové náklady zaměstnavatele. */
  employerCost: number;
  warnings: PayrollWarnings;
}

export interface AnnualResult {
  /** Měsíční výpočet – roční zúčtování ho nemění. */
  monthly: PayrollResult;
  /** Roční základ daně (12× měsíční), zaokrouhlený dolů na stovky. */
  annualTaxBase: number;
  /** Uznané nezdanitelné části. */
  deductions: {
    pensionAndLife: number;
    mortgage: number;
    donations: number;
    total: number;
  };
  /** Uznaná roční sleva na manžela/manželku. */
  spouseCredit: number;
  /** Roční daň po slevách mínus bonus bez odpočtů (= součet měsíčních záloh − bonusů). */
  liabilityBefore: number;
  /** Totéž po odpočtech a slevě na manžela/ku. */
  liabilityAfter: number;
  /** Odhad vratky z ročního zúčtování. */
  refund: number;
  /** Roční čistý příjem včetně vratky. */
  annualNetWithRefund: number;
}

// ── Pomocné funkce ────────────────────────────────────────────────────────

/** Částka na haléře jako celé číslo (vyhne se chybám plovoucí čárky). */
const toHaler = (kc: number) => Math.round(kc * 100);
/** Sazba v desetitisícinách (0,071 → 710). */
const toBp = (rate: number) => Math.round(rate * 10_000);
/** Celočíselné dělení zaokrouhlené nahoru (pro nezáporná celá čísla). */
const ceilDiv = (a: number, b: number) => Math.floor((a + b - 1) / b);

/** ⌈částka × sazba⌉ v celých korunách, přesně. */
function ceilPercent(amount: number, rate: number): number {
  return ceilDiv(toHaler(amount) * toBp(rate), 1_000_000);
}

function normalize(input: PayrollInput) {
  return {
    gross: Math.max(0, input.gross),
    declaration: input.declaration ?? true,
    fullTime: input.fullTime ?? true,
    children: input.children ?? [],
    disability: input.disability ?? 'none',
    ztpp: input.ztpp ?? false,
  };
}

function childCredits(children: ChildInput[], p: Params): number {
  return children.reduce((sum, child, i) => {
    const base = p.creditChild[Math.min(i, p.creditChild.length - 1)];
    return sum + (child.ztpp ? base * p.creditChildZtppMultiplier : base);
  }, 0);
}

function creditsFor(input: ReturnType<typeof normalize>, p: Params): CreditsBreakdown {
  if (!input.declaration) return { taxpayer: 0, disability: 0, ztpp: 0, children: 0 };
  return {
    taxpayer: p.creditTaxpayer,
    disability:
      input.disability === 'deg3'
        ? p.creditDisability3
        : input.disability === 'deg12'
          ? p.creditDisability12
          : 0,
    ztpp: input.ztpp ? p.creditZtpp : 0,
    children: childCredits(input.children, p),
  };
}

/**
 * Uplatnění slev: slevy poplatníka snižují daň nejvýš na nulu,
 * sleva na děti pokračuje a co přebývá, je bonus (jen při dostatečném příjmu).
 */
function applyCredits(tax: number, c: CreditsBreakdown, bonusAllowed: boolean) {
  const personal = c.taxpayer + c.disability + c.ztpp;
  const afterPersonal = Math.max(0, tax - personal);
  const childApplied = Math.min(afterPersonal, c.children);
  const taxAfter = afterPersonal - childApplied;
  const leftover = c.children - childApplied;
  return {
    taxAfter,
    applied: tax - taxAfter,
    bonus: bonusAllowed ? leftover : 0,
    bonusLost: !bonusAllowed && leftover > 0,
  };
}

// ── Měsíční výpočet ───────────────────────────────────────────────────────

export function computeNet(rawInput: PayrollInput, p: Params = PARAMS_2026): PayrollResult {
  const input = normalize(rawInput);
  const { gross } = input;

  // Sociální pojištění – z hrubé do výše stropu, zaokrouhleno nahoru.
  const socialBase = Math.min(gross, p.socialCapMonthly);
  const socialEmployee = ceilPercent(socialBase, p.socialPensionEmployee + p.socialSicknessEmployee);
  const socialEmployer = ceilPercent(socialBase, p.socialEmployer);

  // Zdravotní pojištění – celkové z hrubé, zaměstnanec ⌈třetina⌉, zaměstnavatel zbytek.
  // Pod minimální mzdou (plný úvazek) doplácí rozdíl do minima zaměstnanec.
  const healthActual = ceilPercent(gross, p.healthTotal);
  const healthEmployer = healthActual - ceilDiv(healthActual, 3);
  const healthMinimum =
    input.fullTime && gross < p.minimumWage ? ceilPercent(p.minimumWage, p.healthTotal) : healthActual;
  const healthTopUp = healthMinimum - healthActual;
  const healthEmployee = healthMinimum - healthEmployer;

  // Daň – základ zaokrouhlený nahoru na koruny, 15 % do hranice + 23 % nad ní.
  const taxBase = Math.ceil(gross);
  const lowPart = Math.min(taxBase, p.taxHighThresholdMonthly);
  const highPart = Math.max(0, taxBase - p.taxHighThresholdMonthly);
  const taxBeforeCredits = ceilDiv(
    lowPart * toBp(p.taxRate) + highPart * toBp(p.taxRateHigh),
    10_000,
  );

  const credits = creditsFor(input, p);
  const { taxAfter, applied, bonus, bonusLost } = applyCredits(
    taxBeforeCredits,
    credits,
    gross >= p.bonusMinIncomeMonthly,
  );

  const net = gross - socialEmployee - healthEmployee - taxAfter + bonus;

  return {
    gross,
    socialEmployee,
    healthEmployee,
    healthTopUp,
    taxBase,
    taxBeforeCredits,
    credits,
    creditsApplied: applied,
    taxAdvance: taxAfter,
    childBonus: bonus,
    net,
    socialEmployer,
    healthEmployer,
    employerCost: gross + socialEmployer + healthEmployer,
    warnings: {
      belowMinimumWage: gross < p.minimumWage,
      noDeclaration: !input.declaration,
      bonusIncomeTooLow: bonusLost,
    },
  };
}

// ── Roční zúčtování ───────────────────────────────────────────────────────

/** Roční daň: základ zaokrouhlený dolů na stovky, 15 % / 23 % nad 36× průměrnou mzdu. */
function annualTax(base: number, p: Params): number {
  const low = Math.min(base, p.taxHighThresholdAnnual);
  const high = Math.max(0, base - p.taxHighThresholdAnnual);
  return ceilDiv(low * toBp(p.taxRate) + high * toBp(p.taxRateHigh), 10_000);
}

/**
 * Odhad vratky v ročním zúčtování za předpokladu stejné mzdy po celý rok.
 * Porovná roční povinnost (daň po slevách − bonus) bez a s odpočty
 * nezdanitelných částí a slevou na manžela/ku. Měsíční čistou nemění.
 */
export function computeAnnual(
  input: PayrollInput,
  extras: AnnualExtras = {},
  p: Params = PARAMS_2026,
): AnnualResult {
  const monthly = computeNet(input, p);
  const norm = normalize(input);
  const annualIncome = monthly.taxBase * 12;
  const annualTaxBase = Math.floor(annualIncome / 100) * 100;

  const pensionAndLife = Math.min(Math.max(0, extras.pensionAndLifeInsurance ?? 0), p.deductionPensionLifeMax);
  const mortgage = Math.min(Math.max(0, extras.mortgageInterest ?? 0), p.deductionMortgageMax);
  const donated = Math.max(0, extras.donations ?? 0);
  const donationMin = Math.min(p.donationMinAbsolute, annualIncome * p.donationMinShare);
  const donations =
    donated > 0 && donated >= donationMin ? Math.min(donated, Math.floor(annualIncome * p.donationMaxShare)) : 0;
  // Odpočty nemohou základ snížit pod nulu.
  const total = Math.min(pensionAndLife + mortgage + donations, annualIncome);

  const spouse = extras.spouse;
  const spouseCredit =
    norm.declaration && spouse && spouse.income <= p.spouseIncomeLimitAnnual
      ? Math.round(
          ((spouse.ztpp ? p.creditSpouseZtppAnnual : p.creditSpouseAnnual) *
            Math.min(12, Math.max(0, spouse.months ?? 12))) /
            12,
        )
      : 0;

  const yearly = (c: CreditsBreakdown): CreditsBreakdown => ({
    taxpayer: c.taxpayer * 12,
    disability: c.disability * 12,
    ztpp: c.ztpp * 12,
    children: c.children * 12,
  });
  const credits = yearly(monthly.credits);
  const bonusAllowed = annualIncome >= p.bonusMinIncomeAnnual;

  const liability = (base: number, extraCredit: number) => {
    const r = applyCredits(
      annualTax(base, p),
      { ...credits, taxpayer: credits.taxpayer + extraCredit },
      bonusAllowed,
    );
    return r.taxAfter - r.bonus;
  };

  const liabilityBefore = liability(annualTaxBase, 0);
  const reducedBase = Math.floor(Math.max(0, annualIncome - total) / 100) * 100;
  const liabilityAfter = liability(reducedBase, spouseCredit);
  const refund = Math.max(0, liabilityBefore - liabilityAfter);

  return {
    monthly,
    annualTaxBase,
    deductions: { pensionAndLife, mortgage, donations, total },
    spouseCredit,
    liabilityBefore,
    liabilityAfter,
    refund,
    annualNetWithRefund: monthly.net * 12 + refund,
  };
}

// ── Obrácený výpočet ──────────────────────────────────────────────────────

/**
 * Šířka okna, ve kterém se po binárním hledání ještě hledá níž.
 * Zaokrouhlování SP, ZP i daně nahoru dělá čistou lokálně nemonotónní
 * (o pár korun), a na hranici bonusu 11 200 Kč čistá skočí. Při sklonu
 * čisté ≥ ~0,6 Kč na 1 Kč hrubé stačí okno o řád větší, než jsou výkyvy.
 */
const SEARCH_WINDOW = 200;

/** Nejnižší celá hrubá mzda, pro kterou je čistá ≥ cílová. */
export function grossFromNet(
  targetNet: number,
  options: GrossFromNetOptions = {},
  p: Params = PARAMS_2026,
): number {
  const netOf = (gross: number) => computeNet({ ...options, gross }, p).net;
  if (netOf(0) >= targetNet) return 0;

  let hi = Math.max(1_000, Math.ceil(targetNet * 2));
  while (netOf(hi) < targetNet) hi *= 2;
  let lo = 0; // netOf(lo) < cíl

  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (netOf(mid) >= targetNet) hi = mid;
    else lo = mid;
  }

  // Dohledání níž kvůli lokální nemonotónnosti.
  let best = hi;
  for (let g = hi - 1; g >= Math.max(0, hi - SEARCH_WINDOW); g--) {
    if (netOf(g) >= targetNet) best = g;
  }

  // Hranice bonusu: těsně pod 11 200 Kč bonus není, od 11 200 čistá skočí nahoru.
  // Kdyby bisekce skončila nad hranicí, ověř i nejnižší mzdu s bonusem.
  const threshold = p.bonusMinIncomeMonthly;
  if (best > threshold && netOf(threshold) >= targetNet) {
    for (let g = threshold; g < best; g++) {
      if (netOf(g) >= targetNet) return g;
    }
  }
  return best;
}
