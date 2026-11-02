import { useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { INITIAL_STATE, usePayroll, type CalculatorState, type Mode } from './usePayroll';
import { Calculator } from './components/Calculator';
import { Result } from './components/Result';
import { InfoColumn } from './components/InfoColumn';
import { Footer } from './components/Footer';

const TEXT_KEY = 'mzda-text-zobrazeny';

/** Text vedle kalkulačky jde skrýt; volbu návštěvníka si pamatujeme v prohlížeči. */
function initialTextShown(): boolean {
  try {
    return localStorage.getItem(TEXT_KEY) !== '0';
  } catch {
    return true;
  }
}

export function App() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const result = usePayroll(state);
  const lastSwitch = useRef<{ mode: Mode; amount: number; net: number } | null>(null);
  const [textShown, setTextShown] = useState(initialTextShown);

  function toggleText(shown: boolean) {
    setTextShown(shown);
    try {
      localStorage.setItem(TEXT_KEY, shown ? '1' : '0');
    } catch {
      // Bez úložiště se volba jen nezapamatuje.
    }
  }

  const update = (patch: Partial<CalculatorState>) => {
    // Při přepnutí směru se do pole přenese protějšek, ať výsledek zůstane stejný.
    // Obrácený výpočet vrací nejnižší hrubou se stejnou čistou, takže tam a zpět
    // by z 48 967 udělal 48 966 – původní hrubou proto vrátíme, pokud se nic nezměnilo.
    if (patch.mode && patch.mode !== state.mode) {
      const back = lastSwitch.current;
      const restore = back && back.mode === patch.mode && back.net === result.monthly.net;
      lastSwitch.current = { mode: state.mode, amount: state.amount, net: result.monthly.net };
      patch = {
        ...patch,
        amount: restore
          ? back.amount
          : patch.mode === 'z-ciste'
            ? result.monthly.net
            : result.monthly.gross,
      };
    }
    setState((s) => ({ ...s, ...patch }));
  };

  return (
    <div className="page">
      <main className={`container layout${textShown ? '' : ' layout-solo'}`}>
        <div className="card">
          <Calculator state={state} onChange={update} refund={result.refund} />
          <Result result={result} mode={state.mode} />
        </div>
        {textShown && <InfoColumn onHide={() => toggleText(false)} />}
      </main>
      {/* Záložka na okraji obrazovky – nic neposouvá, jen vrátí skrytý text. */}
      {!textShown && (
        <button type="button" className="info-show" onClick={() => toggleText(true)}>
          <Info size={16} strokeWidth={2} aria-hidden="true" />
          <span>Vysvětlení</span>
        </button>
      )}
      <Footer />
    </div>
  );
}
