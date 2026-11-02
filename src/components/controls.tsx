import { useId, useRef, type ReactNode } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { czk } from '../../shared/format';
import { Explain } from './Explain';

/* ------------------------------------------------------------ Pole částky */

interface AmountInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: ReactNode;
  /** Obsah bubliny u otazníku vedle popisku. */
  explain?: ReactNode;
  size?: 'l' | 'm';
}

/**
 * Číslo s oddělovačem tisíců už při psaní. Kurzor se po přeformátování
 * vrací za stejný počet číslic, jinak by po každé mezeře uskočil na konec.
 */
export function AmountInput({ label, value, onChange, help, explain, size = 'm' }: AmountInputProps) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const caret = input.selectionStart ?? input.value.length;
    const digitsBefore = input.value.slice(0, caret).replace(/\D/g, '').length;
    const digits = input.value.replace(/\D/g, '').slice(0, 9);
    const next = digits ? Number(digits) : 0;
    onChange(next);

    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el || document.activeElement !== el) return;
      let seen = 0;
      let pos = 0;
      while (pos < el.value.length && seen < digitsBefore) {
        if (/\d/.test(el.value[pos])) seen++;
        pos++;
      }
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className={`amount amount-${size}`}>
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {explain && <Explain label={`Co znamená: ${label}`}>{explain}</Explain>}
      </div>
      <div className="amount-box">
        <input
          ref={ref}
          id={id}
          className="amount-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value ? czk(value) : ''}
          placeholder="0"
          onChange={handleChange}
          aria-describedby={help ? `${id}-help` : undefined}
        />
        <span className="amount-unit" aria-hidden="true">
          Kč
        </span>
      </div>
      {help && (
        <p className="field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Čipy */

interface ChipOption {
  label: string;
  value: number;
}

export function PresetChips({
  options,
  current,
  onPick,
  label,
}: {
  options: ChipOption[];
  current: number;
  onPick: (value: number) => void;
  label: string;
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          className="chip"
          aria-pressed={current === o.value}
          onClick={() => onPick(o.value)}
        >
          {o.label} <span className="chip-value">{czk(o.value)}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- Číselník */

export function Stepper({
  label,
  help,
  explain,
  value,
  min = 0,
  max = 10,
  onChange,
}: {
  label: string;
  help?: string;
  /** Obsah bubliny u otazníku vedle popisku. */
  explain?: ReactNode;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="option-row">
      <div className="option-text">
        <span className="option-label">
          <span id={id}>{label}</span>
          {explain && <Explain label={`Co znamená: ${label}`}>{explain}</Explain>}
        </span>
        {help && <span className="option-help">{help}</span>}
      </div>
      <div className="stepper" role="group" aria-labelledby={id}>
        <button
          type="button"
          className="stepper-btn"
          aria-label={`${label}: ubrat`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <output className="stepper-value" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="stepper-btn"
          aria-label={`${label}: přidat`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Přepínač */

export function Switch({
  label,
  help,
  explain,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
  /** Obsah bubliny u otazníku vedle popisku. */
  explain?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="option-row">
      <div className="option-text">
        <span className="option-label">
          <span id={id}>{label}</span>
          {explain && <Explain label={`Co znamená: ${label}`}>{explain}</Explain>}
        </span>
        {help && <span className="option-help">{help}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  );
}

/* ------------------------------------------------- Výběr z několika voleb */

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="option-block">
      <span className="option-label" id={id}>
        {label}
      </span>
      <div className="chips" role="radiogroup" aria-labelledby={id}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className="chip"
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------- Rozbalovací sekce */

export function Disclosure({
  title,
  summary,
  children,
}: {
  title: string;
  /** Krátký stav do hlavičky, např. „2 zapnuté“. */
  summary?: string;
  children: ReactNode;
}) {
  return (
    <details className="disclosure">
      <summary>
        <span className="disclosure-title">{title}</span>
        {summary && <span className="disclosure-summary">{summary}</span>}
        <ChevronDown className="disclosure-icon" size={20} strokeWidth={2} aria-hidden="true" />
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
