import { PARAMS_2026 as P } from '../../shared/params2026';
import { czk, percent } from '../../shared/format';
import { computeNet } from '../../shared/payroll';
import { Footer } from '../components/Footer';

const LAW = {
  dane: { label: 'zákon č. 586/1992 Sb., o daních z příjmů', url: 'https://www.zakonyprolidi.cz/cs/1992-586' },
  sp: { label: 'zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení', url: 'https://www.zakonyprolidi.cz/cs/1992-589' },
  zp: { label: 'zákon č. 592/1992 Sb., o pojistném na zdravotní pojištění', url: 'https://www.zakonyprolidi.cz/cs/1992-592' },
  mzda: { label: 'nařízení vlády č. 567/2006 Sb., o minimální mzdě', url: 'https://www.zakonyprolidi.cz/cs/2006-567' },
  csu: { label: 'ČSÚ, Průměrné mzdy – 2. čtvrtletí 2026', url: 'https://csu.gov.cz/rychle-informace/prumerne-mzdy-2-ctvrtleti-2026' },
  cssz: { label: 'ČSSZ, údaje pro sociální zabezpečení 2026', url: 'https://www.cssz.gov.cz/web/cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2026' },
};

type Law = keyof typeof LAW;

interface ParamRow {
  label: string;
  value: string;
  law?: Law;
  note?: string;
}

const kc = (n: number) => `${czk(n)} Kč`;

/** Ukázkový výpočet z průměrné mzdy, ať příklady sedí na aktuální parametry. */
const ex = computeNet({ gross: P.averageWageCsu });

const GROUPS: { title: string; rows: ParamRow[] }[] = [
  {
    title: 'Mzdy',
    rows: [
      { label: 'Minimální mzda', value: kc(P.minimumWage), law: 'mzda' },
      {
        label: 'Průměrná mzda pro účely pojistného',
        value: kc(P.averageWage),
        law: 'cssz',
        note: 'Nařízení vlády č. 365/2025 Sb. Odvozuje se z ní strop sociálního pojištění i hranice 23% daně.',
      },
      {
        label: 'Průměrná mzda podle ČSÚ',
        value: kc(P.averageWageCsu),
        law: 'csu',
        note: '2. čtvrtletí 2026, předběžný údaj. Jen pro tlačítko rychlé volby, do výpočtu nevstupuje.',
      },
      {
        label: 'Medián mezd podle ČSÚ',
        value: kc(P.medianWage),
        note: 'Rok 2025 – novější medián ČSÚ zatím nezveřejňuje. Jen pro tlačítko rychlé volby.',
      },
    ],
  },
  {
    title: 'Pojistné',
    rows: [
      {
        label: 'Sociální pojištění zaměstnance',
        value: `${percent(P.socialPensionEmployee)} + ${percent(P.socialSicknessEmployee)}`,
        law: 'sp',
        note: 'Důchodové a nemocenské pojištění.',
      },
      { label: 'Sociální pojištění zaměstnavatele', value: percent(P.socialEmployer), law: 'sp' },
      {
        label: 'Strop sociálního pojištění',
        value: `${kc(P.socialCapAnnual)} za rok`,
        law: 'sp',
        note: `48× průměrná mzda. Kalkulačka počítá s měsíční dvanáctinou, ${kc(P.socialCapMonthly)}.`,
      },
      {
        label: 'Zdravotní pojištění celkem',
        value: percent(P.healthTotal),
        law: 'zp',
        note: 'Zaměstnanec platí třetinu (4,5 %), zaměstnavatel zbytek (9 %).',
      },
    ],
  },
  {
    title: 'Daň z příjmů',
    rows: [
      { label: 'Základní sazba', value: percent(P.taxRate, 0), law: 'dane' },
      {
        label: 'Zvýšená sazba',
        value: `${percent(P.taxRateHigh, 0)} nad ${kc(P.taxHighThresholdMonthly)} měsíčně`,
        law: 'dane',
        note: `Za rok nad ${kc(P.taxHighThresholdAnnual)}, tj. 36× průměrná mzda.`,
      },
    ],
  },
  {
    title: 'Měsíční slevy na dani',
    rows: [
      { label: 'Sleva na poplatníka', value: kc(P.creditTaxpayer), law: 'dane' },
      {
        label: 'Sleva na 1. / 2. / 3. a další dítě',
        value: P.creditChild.map(kc).join(' / '),
        law: 'dane',
        note: 'Na dítě s průkazem ZTP/P dvojnásobek.',
      },
      {
        label: 'Daňový bonus',
        value: `při příjmu od ${kc(P.bonusMinIncomeMonthly)}`,
        law: 'dane',
        note: 'Polovina minimální mzdy. Horní strop bonusu není.',
      },
      {
        label: 'Sleva na invaliditu 1. a 2. / 3. stupně',
        value: `${kc(P.creditDisability12)} / ${kc(P.creditDisability3)}`,
        law: 'dane',
      },
      { label: 'Sleva na držitele průkazu ZTP/P', value: kc(P.creditZtpp), law: 'dane' },
    ],
  },
  {
    title: 'Roční zúčtování',
    rows: [
      {
        label: 'Sleva na manžela nebo manželku',
        value: `${kc(P.creditSpouseAnnual)} za rok`,
        law: 'dane',
        note: `Jen při jeho nebo jejím příjmu do ${kc(P.spouseIncomeLimitAnnual)} a péči o dítě do 3 let. Se ZTP/P ${kc(P.creditSpouseZtppAnnual)}.`,
      },
      {
        label: 'Penzijní spoření a životní pojištění',
        value: `nejvýš ${kc(P.deductionPensionLifeMax)} za rok`,
        law: 'dane',
        note: 'Odpočet ze základu daně, oba produkty dohromady.',
      },
      {
        label: 'Úroky z úvěru na bydlení',
        value: `nejvýš ${kc(P.deductionMortgageMax)} za rok`,
        law: 'dane',
        note: 'Platí pro smlouvy uzavřené od roku 2021; u starších je strop vyšší.',
      },
      {
        label: 'Dary',
        value: `${percent(P.donationMinShare, 0)} nebo ${kc(P.donationMinAbsolute)} až ${percent(P.donationMaxShare, 0)} základu`,
        law: 'dane',
      },
    ],
  },
];

export function Informace() {
  return (
    <div className="page">
      <main className="doc">
        <div className="container doc-container">
          <nav className="doc-back">
            <a href="/">← Zpět na kalkulačku</a>
          </nav>

          <h1>Informace a metodika</h1>
          <p className="doc-lede">
            Jak kalkulačka počítá, s jakými čísly pracuje, co nezohledňuje a jak nakládá s vaším
            soukromím.
          </p>

          {/* ------------------------------------------------ upozornění */}

          <section aria-labelledby="upozorneni">
            <h2 id="upozorneni">Právní upozornění</h2>

            <div className="doc-callout">
              <strong>Výpočet je orientační.</strong> Kalkulačku provozuje Libertariánská strana
              Voluntia. Nejde o oficiální nástroj Finanční správy, ČSSZ ani zdravotních pojišťoven a
              s žádným orgánem veřejné moci není spojena.
            </div>

            <p>
              Výsledek vychází ze zákonných parametrů platných pro rok 2026 a z předpokladu, že
              máte stejnou mzdu po celý rok. Skutečná výplatní páska se může lišit – například kvůli
              přesčasům, nemocenské, srážkám ze mzdy nebo jinému způsobu zaokrouhlení u
              zaměstnavatele.
            </p>
            <p>
              <strong>Nejde o daňové ani právní poradenství.</strong> Obsah je součástí politické
              komunikace provozovatele; výběr zobrazených ukazatelů (například „Celkové odvody
              státu“) odráží jeho názorové zaměření. Výpočty samotné jsou popsané níže a dají se
              ověřit.
            </p>
            <p>
              Kalkulačka je poskytována „jak stojí a leží“, bez záruky bezchybnosti. Pokud objevíte
              chybu, budeme rádi, když nám dáte vědět.
            </p>
          </section>

          {/* -------------------------------------------------- metodika */}

          <section aria-labelledby="metodika">
            <h2 id="metodika">Jak se čísla počítají</h2>

            <p>
              Všechny částky na úvodní stránce jsou <strong>za jeden měsíc</strong>, kromě odhadu
              vratky z ročního zúčtování. Kalkulačka počítá hlavní pracovní poměr s podepsaným
              prohlášením poplatníka, pokud ho nevypnete.
            </p>

            <h3>1. Pojistné zaměstnance</h3>
            <p>
              Sociální pojištění je 7,1 % z hrubé mzdy (do výše stropu), zdravotní 4,5 %. Obojí se
              zaokrouhluje na celé koruny nahoru. Zdravotní pojištění se počítá jako 13,5 % celkem a
              zaměstnanec platí třetinu. U plného úvazku se platí aspoň z minimální mzdy; je-li mzda
              nižší, rozdíl doplácí zaměstnanec.
            </p>
            <p className="doc-formula">
              {czk(ex.gross)} × 7,1 % = {kc(ex.socialEmployee)} · ⌈{czk(ex.gross)} × 13,5 %⌉ ={' '}
              {kc(ex.healthEmployee + ex.healthEmployer)}, z toho třetina{' '}
              <strong>{kc(ex.healthEmployee)}</strong>
            </p>

            <h3>2. Záloha na daň</h3>
            <p>
              Základem je hrubá mzda zaokrouhlená na koruny nahoru. Do {kc(P.taxHighThresholdMonthly)}{' '}
              se daní 15 %, z částky nad touto hranicí 23 %. Od zálohy se odečtou slevy na dani –
              nejdřív sleva na poplatníka, na invaliditu a ZTP/P (ty mohou daň snížit nejvýš na
              nulu), potom sleva na děti.
            </p>
            <p className="doc-formula">
              ⌈{czk(ex.gross)} × 15 %⌉ = {kc(ex.taxBeforeCredits)} − sleva na poplatníka{' '}
              {kc(P.creditTaxpayer)} = <strong>{kc(ex.taxAdvance)}</strong>
            </p>

            <h3>3. Daňový bonus</h3>
            <p>
              Když je sleva na děti vyšší než daň, rozdíl se vyplatí jako daňový bonus. Nárok na
              něj vzniká jen při příjmu aspoň {kc(P.bonusMinIncomeMonthly)} měsíčně.
            </p>

            <h3>4. Tři výsledná čísla</h3>
            <ul>
              <li>
                <strong>Čistá mzda</strong> = hrubá mzda − sociální a zdravotní pojištění − záloha
                na daň + daňový bonus.
              </li>
              <li>
                <strong>Celkové náklady zaměstnavatele</strong> = hrubá mzda + sociální (24,8 %) a
                zdravotní (9 %) pojištění placené zaměstnavatelem.
              </li>
              <li>
                <strong>Celkové odvody státu</strong> = náklady zaměstnavatele − čistá mzda, tedy
                pojistné obou stran a daň po odečtení bonusu.
              </li>
            </ul>
            <p className="doc-formula">
              {kc(ex.employerCost)} − {kc(ex.net)} = <strong>{kc(ex.employerCost - ex.net)}</strong>{' '}
              odvodů z průměrné mzdy měsíčně
            </p>

            <h3>5. Z čisté na hrubou</h3>
            <p>
              Obrácený výpočet hledá nejnižší hrubou mzdu v celých korunách, ze které vyjde aspoň
              zadaná čistá. Kvůli zaokrouhlování může stejnou čistou dát i o pár korun vyšší hrubá.
            </p>

            <h3>6. Roční zúčtování</h3>
            <p>
              Slevu na manžela nebo manželku a odpočty (penzijní spoření, životní pojištění, úroky z
              hypotéky, dary) lze uplatnit jen jednou za rok. Kalkulačka spočítá roční daň s nimi a
              bez nich a rozdíl ukáže jako odhad vratky. Měsíční čistou mzdu nemění.
            </p>
          </section>

          {/* ------------------------------------------------- parametry */}

          <section aria-labelledby="parametry">
            <h2 id="parametry">Parametry pro rok 2026</h2>
            <p>Všechny hodnoty, se kterými kalkulačka počítá, a předpis, ze kterého pocházejí.</p>

            {GROUPS.map((group) => (
              <div className="doc-table" key={group.title}>
                <table>
                  <caption>{group.title}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Položka</th>
                      <th scope="col">Hodnota</th>
                      <th scope="col">Zdroj</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">
                          {row.label}
                          {row.note && <span className="note">{row.note}</span>}
                        </th>
                        <td className="num">{row.value}</td>
                        <td>
                          {row.law ? (
                            <a href={LAW[row.law].url} target="_blank" rel="noopener noreferrer">
                              {LAW[row.law].label}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>

          {/* ------------------------------------------------ omezení */}

          <section aria-labelledby="omezeni">
            <h2 id="omezeni">Co kalkulačka nepočítá</h2>
            <ul>
              <li>Dohody o provedení práce a o pracovní činnosti ani srážkovou daň.</li>
              <li>Více zaměstnavatelů najednou, mzdu, která se během roku mění, ani přesčasy.</li>
              <li>Nemocenskou, náhrady mzdy, benefity a srážky ze mzdy.</li>
              <li>Snížené pojistné zaměstnavatele (například u zkrácených úvazků nebo starších zaměstnanců).</li>
              <li>OSVČ – pro ně platí jiný výpočet pojistného i daně.</li>
            </ul>
          </section>

          {/* ------------------------------------------------- soukromí */}

          <section aria-labelledby="soukromi">
            <h2 id="soukromi">Ochrana soukromí</h2>
            <p>
              <strong>Zadané údaje neopustí váš prohlížeč.</strong> Celý výpočet probíhá u vás,
              nikam se neodesílá ani neukládá. Kalkulačka nepoužívá cookies ani měřicí nástroje a
              písmo načítá z vlastního serveru, ne od Googlu.
            </p>
          </section>

          <p className="doc-back doc-back-bottom">
            <a href="/">← Zpět na kalkulačku</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
