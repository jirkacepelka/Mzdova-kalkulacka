import { ArrowUpRight, Instagram } from 'lucide-react';

/* Patička podle voluntia.cz – stejná grafika (černá, tečky, velká značka),
   jen s menším počtem odkazů. */

const COLUMNS = [
  {
    title: 'Strana',
    links: [
      { href: 'https://voluntia.cz/o-nas/', label: 'O nás' },
      { href: 'https://voluntia.cz/manifest/', label: 'Manifest' },
      { href: 'https://voluntia.cz/program-2025/', label: 'Program' },
    ],
  },
  {
    title: 'Zapojte se',
    links: [
      { href: 'https://voluntia.cz/zapojte-se/', label: 'Jak se zapojit' },
      { href: 'https://is.voluntia.cz/prihlaska/?typ=clen', label: 'Stát se členem' },
      { href: 'https://is.voluntia.cz/dary/', label: 'Přispět' },
    ],
  },
];

/** Značka bez nápisu – podání rukou z loga. */
function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-0.5 0.8 62.3 49" fill="currentColor" aria-hidden="true">
      <path d="M13.2745 1.70233C12.9112 1.92872 9.82313 4.91715 6.41723 8.31313C1.17211 13.5882 0.241162 14.6296 0.104926 15.3541C-0.235666 17.1652 -0.167548 17.2558 7.09839 24.5231L13.9102 31.3603L14.932 30.5679C15.7494 29.9567 16.1581 29.7982 16.9983 29.7982C18.9283 29.7982 20.2679 31.066 20.2906 32.9225L20.3133 33.9865H21.3805C23.1743 33.9865 24.6048 35.5261 24.4685 37.2919C24.4004 38.0844 24.4004 38.107 25.3087 38.107C27.1933 38.107 28.6011 39.4652 28.6011 41.2764V42.25H29.5774C30.8944 42.25 31.9388 42.9293 32.4839 44.1972C33.0513 45.4422 32.9152 46.2798 31.9615 47.6609C31.2804 48.6116 31.2804 48.657 31.6664 48.9513C31.8935 49.1324 32.4839 49.2684 32.9832 49.2684C33.6871 49.2684 34.0277 49.1098 34.641 48.4984C35.6171 47.5251 35.7306 46.3705 35.0042 45.1479C34.5955 44.4461 34.7997 44.0611 35.3674 44.4686C36.6616 45.3969 37.9332 45.329 38.9097 44.3104C39.7497 43.45 39.8861 42.3632 39.2955 41.2539C38.7281 40.167 38.8416 39.986 39.7497 40.5067C40.1358 40.7106 40.8623 40.8917 41.3619 40.8917C42.6561 40.8917 43.8142 39.737 43.8142 38.4691C43.8142 37.9712 43.6552 37.3826 43.4735 37.1334C43.1329 36.6805 43.0194 35.9108 43.2919 35.9108C43.36 35.9108 43.6097 36.0694 43.8368 36.273C44.0639 36.4769 44.6997 36.7033 45.2445 36.7487C46.0619 36.8391 46.3345 36.7712 46.9474 36.2505C47.7877 35.5486 48.1284 34.5072 47.8558 33.5336C47.7423 33.081 45.8803 31.066 42.2929 27.4889L36.9342 22.1233L35.8897 23.0516C33.9371 24.7495 27.8064 28.2813 26.3077 28.5304C24.2415 28.8926 21.8346 27.2852 21.1989 25.0891C20.495 22.6893 21.4941 20.7649 24.355 19.1122C27.4204 17.3463 29.3958 15.8974 31.5074 13.8598C32.6655 12.7505 33.5735 11.8223 33.551 11.777C33.5055 11.7544 32.9152 11.8675 32.234 12.0487C30.5084 12.5015 28.9189 12.2751 27.057 11.3242C25.8309 10.6903 24.6729 9.6715 21.1081 6.1397C18.6785 3.7399 16.3852 1.65705 16.0446 1.52121C15.0909 1.15897 14.0465 1.22689 13.2745 1.70233Z" />
      <path d="M45.0629 1.612C44.6997 1.81576 41.3164 5.05324 37.57 8.81141C30.3495 16.1014 29.691 16.6674 25.3769 19.3615C22.2207 21.3312 21.7893 21.8745 21.7893 23.9347C21.7893 26.2214 23.4014 27.7608 25.8083 27.7608C26.7392 27.7608 27.3296 27.5344 29.3958 26.3798C32.4613 24.6818 34.5274 23.3235 35.958 22.0783L37.0477 21.1274L42.2019 26.2666L47.3335 31.3832L54.191 24.546C60.0264 18.6823 61.048 17.573 61.1845 16.8485C61.5248 15.06 61.4342 14.9241 54.7358 8.22278C51.2845 4.75891 48.1964 1.77048 47.8558 1.58936C47.0613 1.18185 45.9258 1.18185 45.0629 1.612Z" />
      <path d="M14.8414 31.6549C13.4563 33.0132 13.093 33.8736 13.479 34.9376C13.7742 35.7526 25.7176 48.0912 26.9437 48.8609C28.1698 49.6081 29.3052 49.3363 30.6902 47.978C32.3933 46.3254 32.5294 44.8311 31.0989 43.5407C30.2588 42.7935 29.2597 42.7482 28.1925 43.3821C27.7838 43.6314 27.3978 43.835 27.3524 43.835C27.1027 43.835 27.2616 43.02 27.5795 42.6125C27.7611 42.3635 27.9201 41.7749 27.9201 41.2767C27.9201 40.0088 26.7621 38.8541 25.4678 38.8541C24.9683 38.8541 24.2417 39.0355 23.8557 39.2391C22.9702 39.7599 22.8339 39.5788 23.3789 38.5148C23.9238 37.4505 23.9465 36.998 23.4697 36.0244C22.8112 34.6207 20.7904 34.1679 19.7005 35.164C19.0647 35.7301 18.6787 35.2319 19.1782 34.4622C20.359 32.6735 19.0874 30.4776 16.9076 30.4776C16.2037 30.4776 15.8632 30.6814 14.8414 31.6549Z" />
    </svg>
  );
}

/* Facebook a X jako na voluntia.cz; Lucide značku X nemá. */
const SOCIALS = [
  {
    href: 'https://www.facebook.com/profile.php?id=61561021276834',
    label: 'Facebook',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/voluntiacz/',
    label: 'Instagram',
    icon: <Instagram size={20} strokeWidth={1.5} aria-hidden="true" />,
  },
  {
    href: 'https://x.com/voluntiacz',
    label: 'X / Twitter',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
];

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-dots" aria-hidden="true" />
      <Mark className="footer-mark" />

      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="brand-link" href="https://voluntia.cz/" {...external}>
              <img
                className="brand-logo"
                src="/logo-voluntia.svg"
                alt="Voluntia – Libertariánská strana"
                width={200}
                height={55}
              />
            </a>
            <p>Kalkulačku čisté mzdy připravila Libertariánská strana Voluntia.</p>
          </div>

          {COLUMNS.map((col) => (
            <nav className="footer-col" aria-label={col.title} key={col.title}>
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...external}>
                      {l.label}
                      <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span>© {new Date().getFullYear()} Libertariánská strana Voluntia</span>
            <a href="/informace">Informace a metodika</a>
          </div>
          <ul className="footer-socials">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} title={s.label} {...external}>
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
