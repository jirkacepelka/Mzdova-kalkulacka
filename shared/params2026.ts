/**
 * Zákonné parametry pro výpočet mzdy v roce 2026.
 *
 * Všechny částky jsou v Kč. Sazby jsou zlomky (0,071 = 7,1 %).
 * Při změně legislativy se upravuje jen tento soubor.
 */

export const PARAMS_2026 = {
  year: 2026,

  // ── Mzdy ────────────────────────────────────────────────────────────────

  /** Minimální mzda (nařízení vlády č. 567/2006 Sb., ve znění pro rok 2026). */
  minimumWage: 22_400,
  /**
   * Průměrná mzda pro účely pojistných zákonů (nařízení vlády č. 365/2025 Sb.).
   * Odvozuje se z ní strop SP i hranice 23% sazby daně. Není to skutečná
   * průměrná mzda – ta je v `averageWageCsu`.
   */
  averageWage: 48_967,
  /**
   * Skutečná průměrná hrubá mzda podle ČSÚ za 2. čtvrtletí 2026 (předběžně).
   * Jen pro čip rychlé volby a výchozí hodnotu, do výpočtu nevstupuje.
   */
  averageWageCsu: 51_966,
  /**
   * Medián mezd podle ČSÚ za rok 2025 – novější ČSÚ zatím nezveřejňuje
   * (přechod na jednotné měsíční hlášení). Jen pro čip rychlé volby.
   */
  medianWage: 45_523,

  // ── Sociální pojištění (zákon č. 589/1992 Sb. a č. 187/2006 Sb.) ────────

  /** Důchodové pojištění placené zaměstnancem (§ 7 zák. č. 589/1992 Sb.). */
  socialPensionEmployee: 0.065,
  /** Nemocenské pojištění placené zaměstnancem (od 2024, § 7 zák. č. 589/1992 Sb.). */
  socialSicknessEmployee: 0.006,
  /** Sociální pojištění zaměstnavatele celkem (§ 7 zák. č. 589/1992 Sb.). */
  socialEmployer: 0.248,
  /** Maximální roční vyměřovací základ = 48× průměrná mzda (§ 15a zák. č. 589/1992 Sb.). */
  socialCapAnnual: 2_350_416,
  /** Měsíční podíl stropu (2 350 416 / 12) – kalkulačka počítá s jedním měsícem. */
  socialCapMonthly: 195_868,

  // ── Zdravotní pojištění (zákon č. 592/1992 Sb.) ─────────────────────────

  /** Sazba zdravotního pojištění celkem (§ 2 zák. č. 592/1992 Sb.). */
  healthTotal: 0.135,
  /** Podíl zaměstnance – jedna třetina pojistného (§ 9 zák. č. 592/1992 Sb.). */
  healthEmployeeShare: 1 / 3,
  /** Podíl zaměstnavatele – dvě třetiny, tj. 9 % (§ 9 zák. č. 592/1992 Sb.). */
  healthEmployer: 0.09,

  // ── Daň z příjmů (zákon č. 586/1992 Sb.) ────────────────────────────────

  /** Základní sazba daně (§ 16 zák. č. 586/1992 Sb.). */
  taxRate: 0.15,
  /** Zvýšená sazba nad hranicí (§ 16 zák. č. 586/1992 Sb.). */
  taxRateHigh: 0.23,
  /** Hranice 23% sazby za měsíc = 3× průměrná mzda (§ 38h odst. 2). */
  taxHighThresholdMonthly: 146_901,
  /** Hranice 23% sazby za rok = 36× průměrná mzda (§ 16 odst. 2). */
  taxHighThresholdAnnual: 1_762_812,

  // ── Měsíční slevy na dani (§ 35ba a § 35c) ──────────────────────────────

  /** Základní sleva na poplatníka, 30 840 Kč/rok (§ 35ba odst. 1 písm. a). */
  creditTaxpayer: 2_570,
  /** Sleva na invaliditu 1. a 2. stupně, 2 520 Kč/rok (§ 35ba odst. 1 písm. c). */
  creditDisability12: 210,
  /** Sleva na invaliditu 3. stupně, 5 040 Kč/rok (§ 35ba odst. 1 písm. d). */
  creditDisability3: 420,
  /** Sleva na držitele průkazu ZTP/P, 16 140 Kč/rok (§ 35ba odst. 1 písm. e). */
  creditZtpp: 1_345,
  /** Sleva na 1., 2., 3. a další dítě – 15 204 / 22 320 / 27 840 Kč/rok (§ 35c odst. 1). */
  creditChild: [1_267, 1_860, 2_320] as const,
  /** Dítě s průkazem ZTP/P má slevu dvojnásobnou (§ 35c odst. 2). */
  creditChildZtppMultiplier: 2,
  /**
   * Daňový bonus za měsíc jen při příjmu alespoň ½ minimální mzdy
   * (§ 35d odst. 4). Horní strop bonusu od 2025 není.
   */
  bonusMinIncomeMonthly: 11_200,
  /** Pro roční zúčtování: příjem alespoň 6× minimální mzda (§ 35c odst. 4). */
  bonusMinIncomeAnnual: 134_400,

  // ── Roční položky (roční zúčtování) ─────────────────────────────────────

  /** Sleva na manžela/manželku (§ 35ba odst. 1 písm. b). */
  creditSpouseAnnual: 24_840,
  /** Sleva na manžela/manželku s průkazem ZTP/P – dvojnásobek (§ 35ba odst. 1 písm. b). */
  creditSpouseZtppAnnual: 49_680,
  /** Vlastní příjem manžela/manželky musí být nejvýše 68 000 Kč/rok (§ 35ba odst. 1 písm. b). */
  spouseIncomeLimitAnnual: 68_000,
  /** Penzijní spoření + soukromé životní pojištění dohromady (§ 15 odst. 5, 6, od 2024). */
  deductionPensionLifeMax: 48_000,
  /** Úroky z úvěru na bydlení (§ 15 odst. 3, smlouvy od 2021). */
  deductionMortgageMax: 150_000,
  /** Dary: minimum 2 % základu daně… (§ 15 odst. 1) */
  donationMinShare: 0.02,
  /** …nebo alespoň 1 000 Kč (§ 15 odst. 1). */
  donationMinAbsolute: 1_000,
  /** Dary: maximum 15 % základu daně (§ 15 odst. 1). */
  donationMaxShare: 0.15,
} as const;

export type Params = typeof PARAMS_2026;
