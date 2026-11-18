import { X } from 'lucide-react';

/*
 * Textový sloupec vedle kalkulačky – nadpis, úvod i vysvětlení v jednom bloku.
 * Jde ho celý skrýt, kalkulačka se pak přesune na střed.
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
        Český zákoník práce (262/2006 Sb.) dává všem zaměstnavatelům povinnost všem zaměstnancům
        při výplatě mzdy vystavit mzdový lístek (také výplatní páska), zároveň také udává, jaká
        čísla má tento doklad obsahovat. Čísla pro mzdový lístek jsou ale účelově vybraná a
        pojmenovaná, aby zkreslovala realitu a skrývala skutečnou hodnotu práce a kolik z ní si
        bere stát.
      </p>

      <h2 className="info-heading">Co kalkulačka počítá</h2>
      <p>
        Tato kalkulačka odkrývá realitu, kterou se stát snaží výběrem správných čísel a jejich
        místy až lživým pojmenováním skrýt. Skutečnou hodnotu, kterou jste vytvořili svou prací
        totiž nevyjadřuje čistá ani hrubá mzda. Aby bylo možné kohokoliv zaměstnat, musí dotyčný
        svou prací vytvořit alespoň hodnotu odpovídající celkovým mzdovým nákladům zaměstnavatele,
        hodnotu odvedenou státu jako „podíl zaměstnavatele na sociálním a zdravotním pojištění“ (v
        našem systému spíše dani) totiž musel taktéž vyrobit zaměstnanec, jinak by zaměstnavatel
        časem zkrachoval.
      </p>
      <p>
        Zároveň pak žádné z výše zmíněných čísel nepředstavuje hodnotu, kterou ze své práce ve
        finále podle svého přání můžeme dostat, protože stát si od nás prostřednictvím DPH a
        spotřebních daní bere část hodnoty i když své peníze chceme využít. Ve finále tak dostaneme
        za svoji práci méně než polovinu hodnoty, kterou jsme museli svou prací vyrobit.
      </p>

      <h2 className="info-heading">Proč na tom záleží</h2>
      <p>
        Uvědomění si této nepříjemné reality je prvním nezbytným krokem na cestě ke zlepšení
        stavu. O plodech své práce by totiž neměli rozhodovat úředníci ale ti, kteří práci
        odvedli. Jedině oni si uvědomují hodnotu těch peněz a vědí, jak s nimi nejlépe naložit.
        Odevzdání peněz do rukou úředníků vždy vede k plýtvání a plýtvání vede k nedostatku
        zdrojů.
      </p>

      <p className="info-note">
        Výpočet je orientační a předpokládá stejnou mzdu po celý rok. Nezohledňuje srážkovou daň,
        dohody o provedení práce ani zvláštní případy. Podrobnosti najdete v sekci{' '}
        <a href="/informace/">Informace a metodika</a>.
      </p>
    </aside>
  );
}
