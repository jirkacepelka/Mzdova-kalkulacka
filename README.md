# Mzdová kalkulačka

Kalkulačka čisté mzdy pro rok 2026 Libertariánské strany Voluntia. Kromě čisté
mzdy ukazuje i celkové náklady zaměstnavatele a celkové odvody státu.

Vite + React + TypeScript, ikony [Lucide](https://lucide.dev/), design tokeny
z design systému Voluntia, nasazení na Vercel. Výpočet běží celý v prohlížeči.

- `shared/` – výpočetní jádro (`payroll.ts`), zákonné parametry 2026 (`params2026.ts`) a testy
- `src/` – kalkulačka a stránka „Informace a metodika“ (`/informace`)

```bash
npm install
npm run dev      # vývoj na http://localhost:5173
npm test         # testy výpočtu
npm run build    # produkční build do dist/
```

Parametry se mění jen v `shared/params2026.ts`.
