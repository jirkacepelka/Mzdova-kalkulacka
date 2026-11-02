import { describe, expect, it } from 'vitest';
import { czk, czkWithUnit } from './format';
import { computeAnnual, computeNet, grossFromNet } from './payroll';

/*
 * Konvence ručních výpočtů:
 *   SP  = ⌈min(hrubá, 195 868) × 7,1 %⌉
 *   ZP  = ⌈max(hrubá, 22 400) × 13,5 %⌉, zaměstnavatel = ZP_z_hrubé − ⌈ZP_z_hrubé / 3⌉,
 *         zaměstnanec = ZP − podíl zaměstnavatele
 *   daň = ⌈15 % × min(základ, 146 901) + 23 % × přebytek⌉
 *   čistá = hrubá − SP − ZP_zam − záloha + bonus
 */

describe('computeNet', () => {
  it('48 000 Kč, bez dětí', () => {
    // SP: 48 000 × 0,071 = 3 408
    // ZP: 48 000 × 0,135 = 6 480; zaměstnanec 6 480 / 3 = 2 160; zaměstnavatel 4 320
    // daň: 48 000 × 0,15 = 7 200; − sleva 2 570 = 4 630
    // čistá: 48 000 − 3 408 − 2 160 − 4 630 = 37 802
    // SP zaměstnavatel: 48 000 × 0,248 = 11 904
    // náklady: 48 000 + 11 904 + 4 320 = 64 224
    const r = computeNet({ gross: 48_000 });
    expect(r.socialEmployee).toBe(3_408);
    expect(r.healthEmployee).toBe(2_160);
    expect(r.taxBeforeCredits).toBe(7_200);
    expect(r.creditsApplied).toBe(2_570);
    expect(r.taxAdvance).toBe(4_630);
    expect(r.childBonus).toBe(0);
    expect(r.net).toBe(37_802);
    expect(r.socialEmployer).toBe(11_904);
    expect(r.healthEmployer).toBe(4_320);
    expect(r.employerCost).toBe(64_224);
    expect(r.warnings).toEqual({ belowMinimumWage: false, noDeclaration: false, bonusIncomeTooLow: false });
  });

  it('43 000 Kč, 2 děti', () => {
    // SP: 43 000 × 0,071 = 3 053
    // ZP: 43 000 × 0,135 = 5 805; zaměstnanec 1 935; zaměstnavatel 3 870
    // daň: 43 000 × 0,15 = 6 450; − 2 570 = 3 880
    // děti: 1 267 + 1 860 = 3 127; 3 880 − 3 127 = 753, bonus 0
    // čistá: 43 000 − 3 053 − 1 935 − 753 = 37 259
    const r = computeNet({ gross: 43_000, children: [{}, {}] });
    expect(r.socialEmployee).toBe(3_053);
    expect(r.healthEmployee).toBe(1_935);
    expect(r.credits.children).toBe(3_127);
    expect(r.creditsApplied).toBe(2_570 + 3_127);
    expect(r.taxAdvance).toBe(753);
    expect(r.childBonus).toBe(0);
    expect(r.net).toBe(37_259);
  });

  it('22 400 Kč, 3 děti → daňový bonus', () => {
    // SP: 22 400 × 0,071 = 1 590,4 → 1 591
    // ZP: 22 400 × 0,135 = 3 024; zaměstnanec 1 008; zaměstnavatel 2 016
    // daň: 22 400 × 0,15 = 3 360; − 2 570 = 790
    // děti: 1 267 + 1 860 + 2 320 = 5 447; 790 se vynuluje, bonus 5 447 − 790 = 4 657
    // čistá: 22 400 − 1 591 − 1 008 − 0 + 4 657 = 24 458
    const r = computeNet({ gross: 22_400, children: [{}, {}, {}] });
    expect(r.socialEmployee).toBe(1_591);
    expect(r.healthEmployee).toBe(1_008);
    expect(r.taxBeforeCredits).toBe(3_360);
    expect(r.taxAdvance).toBe(0);
    expect(r.creditsApplied).toBe(3_360);
    expect(r.childBonus).toBe(4_657);
    expect(r.net).toBe(24_458);
  });

  it('180 000 Kč – 23% pásmo pod stropem SP', () => {
    // SP: 180 000 × 0,071 = 12 780
    // ZP: 180 000 × 0,135 = 24 300; zaměstnanec 8 100
    // daň: 146 901 × 0,15 = 22 035,15; 33 099 × 0,23 = 7 612,77; součet 29 647,92 → 29 648
    //      − 2 570 = 27 078
    // čistá: 180 000 − 12 780 − 8 100 − 27 078 = 132 042
    const r = computeNet({ gross: 180_000 });
    expect(r.socialEmployee).toBe(12_780);
    expect(r.taxBeforeCredits).toBe(29_648);
    expect(r.net).toBe(132_042);
  });

  it('200 000 Kč – 23% pásmo (a už i měsíční strop SP)', () => {
    // SP: min(200 000, 195 868) × 0,071 = 13 906,628 → 13 907
    // ZP: 200 000 × 0,135 = 27 000; zaměstnanec 9 000; zaměstnavatel 18 000
    // daň: 22 035,15 + 53 099 × 0,23 (= 12 212,77) = 34 247,92 → 34 248; − 2 570 = 31 678
    // čistá: 200 000 − 13 907 − 9 000 − 31 678 = 145 415
    // SP zaměstnavatel: 195 868 × 0,248 = 48 575,264 → 48 576
    // náklady: 200 000 + 48 576 + 18 000 = 266 576
    const r = computeNet({ gross: 200_000 });
    expect(r.socialEmployee).toBe(13_907);
    expect(r.healthEmployee).toBe(9_000);
    expect(r.taxBeforeCredits).toBe(34_248);
    expect(r.taxAdvance).toBe(31_678);
    expect(r.net).toBe(145_415);
    expect(r.socialEmployer).toBe(48_576);
    expect(r.employerCost).toBe(266_576);
  });

  it('250 000 Kč – strop SP', () => {
    // SP: strop 195 868 × 0,071 → 13 907 (stejně jako u 200 000)
    // ZP: 250 000 × 0,135 = 33 750; zaměstnanec 11 250; zaměstnavatel 22 500
    // daň: 22 035,15 + 103 099 × 0,23 (= 23 712,77) = 45 747,92 → 45 748; − 2 570 = 43 178
    // čistá: 250 000 − 13 907 − 11 250 − 43 178 = 181 665
    // náklady: 250 000 + 48 576 + 22 500 = 321 076
    const r = computeNet({ gross: 250_000 });
    expect(r.socialEmployee).toBe(13_907);
    expect(r.healthEmployee).toBe(11_250);
    expect(r.taxBeforeCredits).toBe(45_748);
    expect(r.net).toBe(181_665);
    expect(r.socialEmployer).toBe(48_576);
    expect(r.employerCost).toBe(321_076);
  });

  it('15 000 Kč – pod minimální mzdou, doplatek ZP', () => {
    // SP: 15 000 × 0,071 = 1 065
    // ZP z hrubé: 15 000 × 0,135 = 2 025; zaměstnanec ⌈675⌉, zaměstnavatel 2 025 − 675 = 1 350
    // ZP z minima: 22 400 × 0,135 = 3 024 → doplatek 3 024 − 2 025 = 999
    // zaměstnanec celkem: 3 024 − 1 350 = 1 674 (= 675 + 999)
    // daň: 15 000 × 0,15 = 2 250; sleva 2 570 → 0
    // čistá: 15 000 − 1 065 − 1 674 = 12 261
    // náklady: 15 000 + 15 000 × 0,248 (= 3 720) + 1 350 = 20 070
    const r = computeNet({ gross: 15_000 });
    expect(r.socialEmployee).toBe(1_065);
    expect(r.healthTopUp).toBe(999);
    expect(r.healthEmployee).toBe(1_674);
    expect(r.healthEmployer).toBe(1_350);
    expect(r.taxAdvance).toBe(0);
    expect(r.creditsApplied).toBe(2_250);
    expect(r.net).toBe(12_261);
    expect(r.employerCost).toBe(20_070);
    expect(r.warnings.belowMinimumWage).toBe(true);
  });

  it('15 000 Kč na zkrácený úvazek – bez doplatku ZP', () => {
    // ZP zaměstnanec jen 675 → čistá 15 000 − 1 065 − 675 = 13 260
    const r = computeNet({ gross: 15_000, fullTime: false });
    expect(r.healthTopUp).toBe(0);
    expect(r.healthEmployee).toBe(675);
    expect(r.net).toBe(13_260);
  });

  it('bez prohlášení – žádné slevy ani bonus', () => {
    // 48 000: daň 7 200 bez slev; čistá 48 000 − 3 408 − 2 160 − 7 200 = 35 232
    const r = computeNet({ gross: 48_000, declaration: false, children: [{}, {}] });
    expect(r.creditsApplied).toBe(0);
    expect(r.taxAdvance).toBe(7_200);
    expect(r.childBonus).toBe(0);
    expect(r.net).toBe(35_232);
    expect(r.warnings.noDeclaration).toBe(true);
  });

  it('ZTP/P dítě a invalidita – dvojnásobná sleva a slevy poplatníka', () => {
    // děti: ZTP/P 1. dítě 2 534 + 2. dítě 1 860 = 4 394
    // poplatník 2 570 + invalidita 3. st. 420 + ZTP/P 1 345 = 4 335
    const r = computeNet({
      gross: 48_000,
      children: [{ ztpp: true }, {}],
      disability: 'deg3',
      ztpp: true,
    });
    expect(r.credits).toEqual({ taxpayer: 2_570, disability: 420, ztpp: 1_345, children: 4_394 });
    // daň 7 200 − 4 335 = 2 865; děti 4 394 → daň 0, bonus 1 529
    expect(r.taxAdvance).toBe(0);
    expect(r.childBonus).toBe(1_529);
  });

  it('pod 11 200 Kč bonus nevzniká', () => {
    // 11 199: daň ⌈1 679,85⌉ = 1 680 → slevou poplatníka 0, sleva na dítě propadá
    const r = computeNet({ gross: 11_199, children: [{}] });
    expect(r.childBonus).toBe(0);
    expect(r.warnings.bonusIncomeTooLow).toBe(true);
    // 11 200: bonus celé slevy 1 267
    expect(computeNet({ gross: 11_200, children: [{}] }).childBonus).toBe(1_267);
  });
});

describe('computeAnnual', () => {
  it('48 000 Kč + penzijko 48 000 + sleva na manželku', () => {
    // roční základ 576 000; daň 86 400 − 30 840 = 55 560
    // po odpočtu: 528 000 × 0,15 = 79 200 − (30 840 + 24 840) = 23 520
    // vratka 55 560 − 23 520 = 32 040 (= 48 000 × 15 % + 24 840)
    const r = computeAnnual(
      { gross: 48_000 },
      { pensionAndLifeInsurance: 60_000, spouse: { income: 50_000 } },
    );
    expect(r.deductions.pensionAndLife).toBe(48_000);
    expect(r.spouseCredit).toBe(24_840);
    expect(r.liabilityBefore).toBe(55_560);
    expect(r.liabilityAfter).toBe(23_520);
    expect(r.refund).toBe(32_040);
    expect(r.monthly.net).toBe(37_802);
    expect(r.annualNetWithRefund).toBe(37_802 * 12 + 32_040);
  });

  it('dary pod minimem se neuznají, nad 15 % se kráti; manžel/ka nad limitem nic', () => {
    const small = computeAnnual({ gross: 48_000 }, { donations: 900, spouse: { income: 70_000 } });
    expect(small.deductions.donations).toBe(0);
    expect(small.spouseCredit).toBe(0);
    expect(small.refund).toBe(0);
    // 15 % z 576 000 = 86 400; hypotéka nad strop → 150 000
    const big = computeAnnual({ gross: 48_000 }, { donations: 100_000, mortgageInterest: 200_000 });
    expect(big.deductions.donations).toBe(86_400);
    expect(big.deductions.mortgage).toBe(150_000);
  });
});

describe('grossFromNet', () => {
  it.each([
    [37_802, 48_000, {}],
    [37_259, 43_000, { children: [{}, {}] }],
    [24_458, 22_400, { children: [{}, {}, {}] }],
    [145_415, 200_000, {}],
  ])('čistá %i → hrubá %i', (net, expected, options) => {
    // 47 999 by dalo 37 801, 42 999 → 37 258 atd., takže jde o nejnižší hrubou.
    expect(grossFromNet(net, options)).toBe(expected);
  });

  it.each([5_000, 9_500, 10_400, 12_000, 20_000, 31_337, 80_000, 150_000])(
    'čistá %i: vrácená hrubá je nejnižší, která ji dosáhne',
    (target) => {
      for (const options of [{}, { children: [{}, {}, {}] }, { declaration: false }]) {
        const gross = grossFromNet(target, options);
        expect(computeNet({ ...options, gross }).net).toBeGreaterThanOrEqual(target);
        for (let g = Math.max(0, gross - 300); g < gross; g++) {
          expect(computeNet({ ...options, gross: g }).net).toBeLessThan(target);
        }
      }
    },
  );

  it('cílová 0 na zkrácený úvazek → 0', () => {
    expect(grossFromNet(0, { fullTime: false })).toBe(0);
  });

  it('cílová 0 na plný úvazek – doplatek ZP dělá malé mzdy zápornými', () => {
    // hrubá 0: ZP z minima 3 024 nese celé zaměstnanec → čistá −3 024
    expect(computeNet({ gross: 0 }).net).toBe(-3_024);
    const gross = grossFromNet(0);
    expect(computeNet({ gross }).net).toBeGreaterThanOrEqual(0);
    expect(computeNet({ gross: gross - 1 }).net).toBeLessThan(0);
  });
});

describe('czk', () => {
  it('odděluje tisíce úzkou nezlomitelnou mezerou', () => {
    expect(czk(48_000)).toBe('48 000');
    expect(czk(1_234_567.4)).toBe('1 234 567');
    expect(czk(950)).toBe('950');
    expect(czkWithUnit(48_000)).toBe('48 000 kč');
  });
});
