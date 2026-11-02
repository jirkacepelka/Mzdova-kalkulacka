import type { AnnualResult } from '../../shared/payroll';
import { czk } from '../../shared/format';
import { PARAMS_2026 } from '../../shared/params2026';
import type { Mode } from '../usePayroll';
import { useState } from 'react';
import { Disclosure, Switch } from './controls';
import { Explain } from './Explain';

/** `48 967 + 12 144 = 61 111 Kč` – dosazení do vzorce pro bublinu. */
function sum(parts: { value: number; sign: '+' | '−' }[], total: number) {
  const body = parts
    .filter((p, i) => i === 0 || p.value > 0)
    .map((p, i) => (i === 0 ? czk(p.value) : `${p.sign} ${czk(p.value)}`))
    .join(' ');
  return `${body} = ${czk(total)} Kč`;
}

interface Row {
  label: string;
  value: number;
  sign?: '+' | '−';
  muted?: boolean;
}

function Rows({ rows, total }: { rows: Row[]; total: Row }) {
  return (
    <dl className="rows">
      {rows.map((r) => (
        <div className={`row${r.muted ? ' row-muted' : ''}`} key={r.label}>
          <dt>{r.label}</dt>
          <dd>
            {r.sign && r.value > 0 && <span className="row-sign">{r.sign} </span>}
            {czk(r.value)} Kč
          </dd>
        </div>
      ))}
      <div className="row row-total">
        <dt>{total.label}</dt>
        <dd>{czk(total.value)} Kč</dd>
      </div>
    </dl>
  );
}

interface FigureProps {
  label: string;
  value: number;
  size: 'l' | 'm';
  /** Odvody státu se zvýrazní červeně. */
  alert?: boolean;
  /** Slovní vzorec a dosazení do bubliny u otazníku. */
  formula: string;
  substitution: string;
}

function Figure({ label, value, size, alert, formula, substitution }: FigureProps) {
  return (
    <div className={`figure figure-${size}${alert ? ' figure-alert' : ''}`}>
      <dt className="figure-label">
        {label}
        <Explain>
          <span className="explain-formula">{formula}</span>
          <span className="explain-substitution">{substitution}</span>
        </Explain>
      </dt>
      <dd className="figure-value">
        {czk(value)}
        <span className="unit">Kč</span>
        <span className="per"> / měsíc</span>
      </dd>
    </div>
  );
}

/**
 * Pruh rozdělení ceny práce: kolik dostanete vy a kolik stát. S daněmi z útraty
 * se státní část rozdělí na odvody ze mzdy a daně zaplacené v cenách nákupů.
 */
function Split({ net, total, spendTax }: { net: number; total: number; spendTax?: number }) {
  if (total <= 0) return null;

  // Daňový bonus může převýšit pojistné i daň – čistá mzda je pak vyšší než cena
  // práce a podíly z ní nedávají smysl. Pruh pak ukazuje jen rozdělení výplaty.
  if (net >= total) {
    const taxPct = spendTax ? Math.round((spendTax / net) * 100) : 0;
    const yours = 100 - taxPct;
    return (
      <div className="split">
        <p className="split-title">Bonus na děti je vyšší než odvody ze mzdy – stát vám doplácí {czk(net - total)} Kč</p>
        <div className="split-bar" role="img" aria-label={`Vám ${yours} %, daně z útraty ${taxPct} %`}>
          <span className="split-yours" style={{ width: `${yours}%` }} />
          {taxPct > 0 && <span className="split-spend" style={{ width: `${taxPct}%` }} />}
        </div>
        <div className="split-legend" aria-hidden="true">
          <span>
            <i className="split-dot split-dot-yours" />
            Vám <strong>{yours} %</strong> výplaty
          </span>
          {taxPct > 0 && (
            <span>
              <i className="split-dot split-dot-spend" />
              Daně z útraty <strong>{taxPct} %</strong>
            </span>
          )}
        </div>
      </div>
    );
  }
  const netPct = Math.round((net / total) * 100);
  const levyPct = 100 - netPct;
  const taxPct = spendTax ? Math.round((spendTax / total) * 100) : 0;
  const yours = netPct - taxPct;

  if (!spendTax) {
    return (
      <div className="split">
        <p className="split-title">Z ceny vaší práce</p>
        <div
          className="split-bar"
          role="img"
          aria-label={`Vám zůstane ${yours} %, státu odejde ${levyPct} %`}
        >
          <span className="split-yours" style={{ width: `${yours}%` }} />
          <span className="split-state" style={{ width: `${levyPct}%` }} />
        </div>
        <div className="split-legend" aria-hidden="true">
          <span>
            <i className="split-dot split-dot-yours" />
            Vám <strong>{yours} %</strong>
          </span>
          <span>
            <i className="split-dot split-dot-state" />
            Státu <strong>{levyPct} %</strong>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="split">
      <p className="split-title">Z ceny vaší práce včetně daní z útraty</p>
      <div
        className="split-bar"
        role="img"
        aria-label={`Vám ${yours} %, odvody ${levyPct} %, daně z útraty ${taxPct} %`}
      >
        <span className="split-yours" style={{ width: `${yours}%` }} />
        <span className="split-state" style={{ width: `${levyPct}%` }} />
        <span className="split-spend" style={{ width: `${taxPct}%` }} />
      </div>
      <div className="split-legend" aria-hidden="true">
        <span>
          <i className="split-dot split-dot-yours" />
          Vám <strong>{yours} %</strong>
        </span>
        <span>
          <i className="split-dot split-dot-state" />
          Odvody <strong>{levyPct} %</strong>
        </span>
        <span>
          <i className="split-dot split-dot-spend" />
          Daně z útraty <strong>{taxPct} %</strong>
        </span>
      </div>
    </div>
  );
}

const TAX_SHARE = PARAMS_2026.consumptionTaxShare;
const TAX_PERCENT = Math.round(TAX_SHARE * 100);

export function Result({ result, mode }: { result: AnnualResult; mode: Mode }) {
  const m = result.monthly;
  const [withSpending, setWithSpending] = useState(true);
  // Všechno, co z ceny práce nedostane zaměstnanec: pojistné obou stran a daň po bonusu.
  const levies = m.employerCost - m.net;
  // Daně z útraty – velmi hrubý odhad: celá čistá mzda utracená, v cenách průměrný podíl daní.
  const spendTax = withSpending ? Math.round(m.net * TAX_SHARE) : 0;
  const toState = levies + spendTax;
  // Při vysokém bonusu na děti stát víc vyplatí, než vybere.
  const statePays = toState < 0;

  const employee: Row[] = [
    { label: 'Hrubá mzda', value: m.gross },
    { label: 'Sociální pojištění 7,1 %', value: m.socialEmployee, sign: '−' },
    {
      label: m.healthTopUp > 0 ? 'Zdravotní pojištění vč. doplatku' : 'Zdravotní pojištění 4,5 %',
      value: m.healthEmployee,
      sign: '−',
    },
    { label: 'Záloha na daň před slevami', value: m.taxBeforeCredits, muted: true },
    { label: 'Uplatněné slevy na dani', value: m.creditsApplied, muted: true },
    { label: 'Záloha na daň', value: m.taxAdvance, sign: '−' },
  ];
  if (m.childBonus > 0) {
    employee.push({ label: 'Daňový bonus na děti', value: m.childBonus, sign: '+' });
  }

  const employer: Row[] = [
    { label: 'Hrubá mzda', value: m.gross },
    { label: 'Sociální pojištění 24,8 %', value: m.socialEmployer, sign: '+' },
    { label: 'Zdravotní pojištění 9 %', value: m.healthEmployer, sign: '+' },
  ];

  // Ve výpočtu z čisté je čistá mzda zadaná, třetím číslem je proto hrubá.
  const third =
    mode === 'z-hrube' ? (
      <Figure
        label="Čistá mzda"
        value={m.net}
        size="m"
        formula="Hrubá mzda minus sociální a zdravotní pojištění a záloha na daň, plus případný daňový bonus na děti."
        substitution={sum(
          [
            { value: m.gross, sign: '+' },
            { value: m.socialEmployee, sign: '−' },
            { value: m.healthEmployee, sign: '−' },
            { value: m.taxAdvance, sign: '−' },
            { value: m.childBonus, sign: '+' },
          ],
          m.net,
        )}
      />
    ) : (
      <Figure
        label="Potřebná hrubá mzda"
        value={m.gross}
        size="m"
        formula="Nejnižší hrubá mzda v celých korunách, ze které po odečtení pojištění a daně vyjde zadaná čistá mzda."
        substitution={`Čistá mzda z ní: ${czk(m.net)} Kč`}
      />
    );

  return (
    <section className="result receipt" aria-labelledby="vysledek" aria-live="polite">
      <div className="result-inner">
        <h2 id="vysledek" className="sr-only">
          Výsledek za měsíc
        </h2>
        <div className="spending-switch">
          <Switch
            label="Započítat daně z útraty"
            explain={
              <>
                <span className="explain-formula">
                  Ukáže i DPH a spotřební daně, které zaplatíte, když výplatu utratíte. V průměru
                  tvoří zhruba {TAX_PERCENT} % výdajů domácností (Eurostat 2025).
                </span>
                <span className="explain-substitution">Jen velmi hrubý odhad.</span>
              </>
            }
            checked={withSpending}
            onChange={setWithSpending}
          />
        </div>

        <dl className={`figures${withSpending ? ' figures-pair' : ''}`}>
          <Figure
            label="Celkové náklady zaměstnavatele"
            value={m.employerCost}
            size="l"
            formula="Hrubá mzda + sociální (24,8 %) a zdravotní (9 %) pojištění, které za vás platí zaměstnavatel. Tolik ve skutečnosti stojí vaše práce."
            substitution={sum(
              [
                { value: m.gross, sign: '+' },
                { value: m.socialEmployer, sign: '+' },
                { value: m.healthEmployer, sign: '+' },
              ],
              m.employerCost,
            )}
          />
          <Figure
            label={statePays ? 'Stát vám doplácí' : 'Celkové odvody státu'}
            value={Math.abs(toState)}
            size="l"
            alert={!statePays}
            formula={
              statePays
                ? 'Daňový bonus na děti je vyšší než pojistné, daň' +
                  (withSpending ? ' i odhad daní z útraty' : '') +
                  ' dohromady. Bonus nemá horní strop, rozdíl vám tedy stát doplácí.'
                : withSpending
                  ? 'Pojištění placené zaměstnavatelem i vámi, záloha na daň po slevách (minus případný bonus) a odhad daní z útraty.'
                  : 'Pojištění placené zaměstnavatelem i vámi a záloha na daň po slevách, minus případný daňový bonus. Rozdíl mezi cenou vaší práce a tím, co dostanete.'
            }
            substitution={sum(
              [
                { value: m.socialEmployer + m.healthEmployer, sign: '+' },
                { value: m.socialEmployee + m.healthEmployee, sign: '+' },
                { value: m.taxAdvance, sign: '+' },
                { value: m.childBonus, sign: '−' },
                { value: spendTax, sign: '+' },
              ],
              toState,
            )}
          />
          {third}
          {withSpending && (
            <Figure
              label="Daně z útraty"
              value={spendTax}
              size="m"
              alert
              formula={`Velmi hrubý odhad DPH a spotřebních daní, které zaplatíte v cenách, když utratíte celou čistou mzdu. V průměru tvoří zhruba ${TAX_PERCENT} % výdajů domácností (Eurostat 2025).`}
              substitution={`${czk(m.net)} × ${TAX_PERCENT} % = ${czk(spendTax)} Kč`}
            />
          )}
        </dl>
        <Split net={m.net} total={m.employerCost} spendTax={spendTax} />

        {m.warnings.noDeclaration && (
          <p className="notice">Bez podepsaného prohlášení se neuplatní žádné slevy na dani.</p>
        )}
        {m.warnings.belowMinimumWage && m.healthTopUp > 0 && (
          <p className="notice">
            Mzda je pod minimální mzdou. Zdravotní pojištění se u plného úvazku platí z minimální mzdy
            a rozdíl {czk(m.healthTopUp)} Kč doplácíte vy.
          </p>
        )}
        {m.warnings.bonusIncomeTooLow && (
          <p className="notice">
            Na daňový bonus máte nárok až od příjmu 11 200 Kč měsíčně, proto se nevyplatí.
          </p>
        )}

        <Disclosure title="Rozpis výpočtu za měsíc">
          <h3 className="rows-title">Výplatní páska</h3>
          <Rows rows={employee} total={{ label: 'Čistá mzda', value: m.net }} />
          <h3 className="rows-title">Náklady zaměstnavatele</h3>
          <Rows rows={employer} total={{ label: 'Celkové náklady', value: m.employerCost }} />
        </Disclosure>
      </div>
    </section>
  );
}
