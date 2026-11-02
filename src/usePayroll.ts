import { useMemo } from 'react';
import { PARAMS_2026 } from '../shared/params2026';
import {
  computeAnnual,
  grossFromNet,
  type ChildInput,
  type Disability,
  type PayrollInput,
} from '../shared/payroll';

export type Mode = 'z-hrube' | 'z-ciste';

export interface CalculatorState {
  mode: Mode;
  /** Částka z pole – hrubá, nebo požadovaná čistá podle režimu. */
  amount: number;
  children: number;
  /** Kolik z dětí má průkaz ZTP/P. */
  childrenZtpp: number;
  declaration: boolean;
  disability: Disability;
  ztpp: boolean;
  fullTime: boolean;
  pensionAndLife: number;
  mortgage: number;
  donations: number;
  spouse: boolean;
  spouseZtpp: boolean;
}

export const INITIAL_STATE: CalculatorState = {
  mode: 'z-hrube',
  amount: PARAMS_2026.averageWageCsu,
  children: 0,
  childrenZtpp: 0,
  declaration: true,
  disability: 'none',
  ztpp: false,
  fullTime: true,
  pensionAndLife: 0,
  mortgage: 0,
  donations: 0,
  spouse: false,
  spouseZtpp: false,
};

/**
 * Pořadí dětí si rodiče volí sami a sleva za ZTP/P se násobí podle pořadí,
 * takže děti se ZTP/P řadíme na konec – tam je základ slevy nejvyšší.
 */
function childrenList(count: number, ztpp: number): ChildInput[] {
  return Array.from({ length: count }, (_, i) => ({ ztpp: i >= count - ztpp }));
}

export function usePayroll(state: CalculatorState) {
  return useMemo(() => {
    const options: Omit<PayrollInput, 'gross'> = {
      declaration: state.declaration,
      fullTime: state.fullTime,
      children: childrenList(state.children, Math.min(state.childrenZtpp, state.children)),
      disability: state.disability,
      ztpp: state.ztpp,
    };
    const gross = state.mode === 'z-hrube' ? state.amount : grossFromNet(state.amount, options);

    return computeAnnual(
      { ...options, gross },
      {
        pensionAndLifeInsurance: state.pensionAndLife,
        mortgageInterest: state.mortgage,
        donations: state.donations,
        // Limit 68 000 Kč hlídá zaškrtnutí v UI, jádru posíláme nulu.
        spouse: state.spouse ? { income: 0, ztpp: state.spouseZtpp } : undefined,
      },
    );
  }, [state]);
}
