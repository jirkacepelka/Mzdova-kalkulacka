import { X } from 'lucide-react';

/*
 * Textový sloupec vedle kalkulačky – nadpis, úvod i vysvětlení v jednom bloku.
 * Jde ho celý skrýt, kalkulačka se pak přesune na střed. Obsah je zástupný,
 * dodá ho Voluntia.
 */

export function InfoColumn({ onHide }: { onHide: () => void }) {
  return (
    <aside className="info" aria-label="Vysvětlení">
      <div className="info-head">
        <h1 className="intro-title">
          {/* Nezlomitelné mezery drží „ve státní kase“ pohromadě – celé na jednom řádku. */}
          Kolik z vaší práce skončí{' '}
          <span className="accent-alert">ve{' '}státní{' '}kase</span>
        </h1>
        <button type="button" className="info-hide" onClick={onHide} aria-label="Skrýt text">
          <X size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <p className="intro-lead">
        Zástupný úvod: krátké vysvětlení, proč kalkulačka ukazuje i náklady zaměstnavatele a co
        všechno se z hrubé mzdy odvádí.
      </p>

      <h2 className="info-heading">Co kalkulačka počítá</h2>
      <p>
        Zástupný text. Čistou mzdu podle pravidel pro rok 2026 – sociální a zdravotní pojištění,
        zálohu na daň, slevy na dani a daňový bonus na děti.
      </p>

      <h2 className="info-heading">Proč na tom záleží</h2>
      <p>Zástupný text. Prostor pro argumentaci Voluntie, odkazy na program nebo výzvu k akci.</p>

      <p className="info-note">
        Výpočet je orientační a předpokládá stejnou mzdu po celý rok. Nezohledňuje srážkovou daň,
        dohody o provedení práce ani zvláštní případy. Podrobnosti najdete v sekci{' '}
        <a href="/informace">Informace a metodika</a>.
      </p>
    </aside>
  );
}
