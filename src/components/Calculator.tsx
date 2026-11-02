import type { Disability } from '../../shared/payroll';
import { PARAMS_2026 } from '../../shared/params2026';
import type { CalculatorState, Mode } from '../usePayroll';
import { AmountInput, Disclosure, PresetChips, Segmented, Stepper, Switch } from './controls';

const MODES: { value: Mode; label: string }[] = [
  { value: 'z-hrube', label: 'Z hrubé na čistou' },
  { value: 'z-ciste', label: 'Z čisté na hrubou' },
];

const PRESETS = [
  { label: 'Minimální', value: PARAMS_2026.minimumWage },
  { label: 'Medián', value: PARAMS_2026.medianWage },
  { label: 'Průměrná', value: PARAMS_2026.averageWage },
];

const DISABILITY: { value: Disability; label: string }[] = [
  { value: 'none', label: 'Ne' },
  { value: 'deg12', label: '1. nebo 2. stupeň' },
  { value: 'deg3', label: '3. stupeň' },
];

interface CalculatorProps {
  state: CalculatorState;
  onChange: (patch: Partial<CalculatorState>) => void;
}

/** Počet zapnutých voleb do hlavičky sbalené sekce, ať je vidět, že něco platí. */
function activeLabel(count: number) {
  if (count === 0) return undefined;
  if (count === 1) return '1 zapnutá';
  if (count < 5) return `${count} zapnuté`;
  return `${count} zapnutých`;
}

export function Calculator({ state, onChange }: CalculatorProps) {
  const fromGross = state.mode === 'z-hrube';

  const extraCount =
    (state.childrenZtpp > 0 ? 1 : 0) +
    (state.disability !== 'none' ? 1 : 0) +
    (state.ztpp ? 1 : 0) +
    (state.fullTime ? 0 : 1);
  const annualCount =
    (state.spouse ? 1 : 0) +
    (state.pensionAndLife > 0 ? 1 : 0) +
    (state.mortgage > 0 ? 1 : 0) +
    (state.donations > 0 ? 1 : 0);

  return (
    <form className="calc" onSubmit={(e) => e.preventDefault()} aria-label="Zadání výpočtu">
      <div className="calc-primary">
        <AmountInput
          size="l"
          label={fromGross ? 'Hrubá mzda za měsíc' : 'Požadovaná čistá mzda za měsíc'}
          aside={
            <div className="tabs" role="tablist" aria-label="Směr výpočtu">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  role="tab"
                  aria-selected={state.mode === m.value}
                  className="tab"
                  onClick={() => onChange({ mode: m.value })}
                >
                  {m.label}
                </button>
              ))}
            </div>
          }
          value={state.amount}
          onChange={(amount) => onChange({ amount })}
        />
        {fromGross && (
          <PresetChips
            label="Rychlá volba mzdy"
            options={PRESETS}
            current={state.amount}
            onPick={(amount) => onChange({ amount })}
          />
        )}

        <div className="options">
          <Stepper
            label="Počet dětí"
            explain={
              <>
                <span className="explain-formula">
                  Sleva na 1. dítě 1 267 Kč, na 2. dítě 1 860 Kč, na 3. a další 2 320 Kč měsíčně.
                </span>
                <span className="explain-substitution">
                  Co se nevejde do daně, vyplatí se jako daňový bonus – při příjmu aspoň 11 200 Kč.
                </span>
              </>
            }
            value={state.children}
            onChange={(children) =>
              onChange({ children, childrenZtpp: Math.min(state.childrenZtpp, children) })
            }
          />
          <Switch
            label="Podepsané prohlášení poplatníka"
            explain={
              <span className="explain-formula">
                Prohlášení podepisujete u jednoho zaměstnavatele. Bez něj se neuplatní sleva na
                poplatníka (2 570 Kč měsíčně) ani na děti.
              </span>
            }
            checked={state.declaration}
            onChange={(declaration) => onChange({ declaration })}
          />
        </div>
      </div>

      <Disclosure title="Další slevy" summary={activeLabel(extraCount)}>
        <Stepper
          label="Z toho dětí se ZTP/P"
          explain={
            <span className="explain-formula">
              Sleva na dítě s průkazem ZTP/P je dvojnásobná. Kalkulačka ho počítá jako poslední
              v pořadí, kde je sleva nejvyšší.
            </span>
          }
          value={state.childrenZtpp}
          max={state.children}
          onChange={(childrenZtpp) => onChange({ childrenZtpp })}
        />
        <Segmented
          label="Pobíráte invalidní důchod?"
          value={state.disability}
          options={DISABILITY}
          onChange={(disability) => onChange({ disability })}
        />
        <Switch
          label="Jste držitelem průkazu ZTP/P"
          explain={<span className="explain-formula">Sleva 1 345 Kč měsíčně.</span>}
          checked={state.ztpp}
          onChange={(ztpp) => onChange({ ztpp })}
        />
        <Switch
          label="Hlavní pracovní poměr na plný úvazek"
          explain={
            <span className="explain-formula">
              U plného úvazku se zdravotní pojištění platí aspoň z minimální mzdy 22 400 Kč. Když
              je mzda nižší, rozdíl doplácí zaměstnanec.
            </span>
          }
          checked={state.fullTime}
          onChange={(fullTime) => onChange({ fullTime })}
        />
      </Disclosure>

      <Disclosure title="Roční zúčtování" summary={activeLabel(annualCount)}>
        <p className="disclosure-note">
          Tyhle položky se neuplatňují v měsíční výplatě, ale až v ročním zúčtování nebo daňovém
          přiznání. Kalkulačka z nich odhadne, kolik vám stát vrátí.
        </p>
        <Switch
          label="Manžel nebo manželka s příjmem do 68 000 Kč za rok"
          help="Jen pokud ve společné domácnosti pečuje o dítě do 3 let"
          checked={state.spouse}
          onChange={(spouse) => onChange({ spouse, spouseZtpp: spouse && state.spouseZtpp })}
        />
        {state.spouse && (
          <Switch
            label="Manžel nebo manželka je držitelem ZTP/P"
            checked={state.spouseZtpp}
            onChange={(spouseZtpp) => onChange({ spouseZtpp })}
          />
        )}
        <div className="annual-fields">
          <AmountInput
            label="Penzijní spoření a životní pojištění za rok"
            explain={
              <>
                <span className="explain-formula">
                  Příspěvky na penzijní spoření a soukromé životní pojištění, které jste zaplatili
                  sami. Od základu daně lze odečíst nejvýš 48 000 Kč za rok za oba produkty dohromady.
                </span>
                <span className="explain-substitution">
                  U penzijního spoření se počítá jen část nad 24 000 Kč, na kterou nedostáváte
                  státní příspěvek – zadejte tedy už odečitatelnou částku.
                </span>
              </>
            }
            value={state.pensionAndLife}
            onChange={(pensionAndLife) => onChange({ pensionAndLife })}
          />
          <AmountInput
            label="Úroky z hypotéky za rok"
            explain={
              <span className="explain-formula">
                Zaplacené úroky z hypotéky nebo úvěru ze stavebního spoření na vlastní bydlení. Od
                základu daně lze odečíst nejvýš 150 000 Kč za rok (smlouvy od roku 2021).
              </span>
            }
            value={state.mortgage}
            onChange={(mortgage) => onChange({ mortgage })}
          />
          <AmountInput
            label="Dary za rok"
            explain={
              <span className="explain-formula">
                Dary neziskovým organizacím, na zdravotnictví, vědu nebo třeba politickým stranám.
                Odečíst je lze, pokud dohromady dají aspoň 1 000 Kč nebo 2 % ročního příjmu, a to
                nejvýš do 15 % příjmu.
              </span>
            }
            value={state.donations}
            onChange={(donations) => onChange({ donations })}
          />
        </div>
      </Disclosure>
    </form>
  );
}
