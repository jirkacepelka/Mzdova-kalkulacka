import type { AnnualResult } from '../../shared/payroll';
import { czk } from '../../shared/format';
import type { Mode } from '../usePayroll';
import { Disclosure } from './controls';
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

/** Pruh rozdělení ceny práce: kolik dostanete vy a kolik stát. */
function Split({ net, total }: { net: number; total: number }) {
  if (total <= 0) return null;
  const yours = Math.round((net / total) * 100);
  const state = 100 - yours;
  return (
    <div className="split">
      <p className="split-title">Z ceny vaší práce</p>
      <div
        className="split-bar"
        role="img"
        aria-label={`Vám zůstane ${yours} %, státu odejde ${state} %`}
      >
        <span className="split-yours" style={{ width: `${yours}%` }} />
        <span className="split-state" style={{ width: `${state}%` }} />
      </div>
      <div className="split-legend" aria-hidden="true">
        <span>
          <i className="split-dot split-dot-yours" />
          Vám <strong>{yours} %</strong>
        </span>
        <span>
          <i className="split-dot split-dot-state" />
          Státu <strong>{state} %</strong>
        </span>
      </div>
    </div>
  );
}

export function Result({ result, mode }: { result: AnnualResult; mode: Mode }) {
  const m = result.monthly;
  // Všechno, co z ceny práce nedostane zaměstnanec: pojistné obou stran a daň po bonusu.
  const toState = m.employerCost - m.net;

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

        <dl className="figures">
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
            label="Celkové odvody státu"
            value={toState}
            size="l"
            alert
            formula="Pojištění placené zaměstnavatelem i vámi a záloha na daň po slevách, minus případný daňový bonus. Rozdíl mezi cenou vaší práce a tím, co dostanete."
            substitution={sum(
              [
                { value: m.socialEmployer + m.healthEmployer, sign: '+' },
                { value: m.socialEmployee + m.healthEmployee, sign: '+' },
                { value: m.taxAdvance, sign: '+' },
                { value: m.childBonus, sign: '−' },
              ],
              toState,
            )}
          />
          {third}
        </dl>
        <Split net={m.net} total={m.employerCost} />

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
