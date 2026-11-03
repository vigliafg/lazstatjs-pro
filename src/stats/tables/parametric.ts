import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { ParametricSurvivalStats } from '../parametric/types';

const distributionLabel = (stats: ParametricSurvivalStats): string => {
  switch (stats.distribution) {
    case 'weibull':
      return copy('Weibull AFT');
    case 'exponential':
      return copy('Esponenziale AFT');
    case 'lognormal':
      return copy('Log-normale AFT');
    case 'loglogistic':
      return copy('Log-logistica AFT');
    default:
      return copy('Gompertz PH');
  }
};

export const parametricTables = (stats: ParametricSurvivalStats, level: number): TableSpec[] => [
  {
    id: 'param-summary',
    title: copy('Sopravvivenza parametrica'),
    subtitle: copy('{s1} · CI {s2}%', { s1: distributionLabel(stats), s2: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Eventi'), value: stats.events },
      {
        metric: stats.parameterization === 'ph' ? copy('Intercetta (α)') : copy('Intercetta (μ)'),
        value: stats.mu,
      },
      {
        metric:
          stats.parameterization === 'ph'
            ? copy('Tasso di crescita (γ)')
            : copy('Scala (σ)'),
        value: stats.sigma,
      },
      { metric: copy('Log-verosimiglianza'), value: stats.logLik },
      { metric: copy('AIC'), value: stats.aic },
      { metric: copy('BIC'), value: stats.bic },
    ],
    notes:
      stats.parameterization === 'ph'
        ? [
            copy('Modello di Gompertz: h(t) = exp(α + Xβ) · exp(γt), con rischio che cresce esponenzialmente nel tempo.'),
            copy('I coefficienti sono log hazard ratio; γ controlla la crescita del rischio con il tempo.'),
          ]
        : [
            stats.distribution === 'exponential'
              ? copy('Modello AFT esponenziale: log(T) = μ + Xβ + W, con W extreme-value e scala fissata a 1.')
              : copy('Modello AFT: log(T) = μ + Xβ + σ·W, con W extreme-value, normale o logistica secondo la distribuzione.'),
            copy('Con log-normale e log-logistica la scala σ descrive la dispersione di log(T).'),
          ],
  },
  {
    id: 'param-coefficients',
    title: copy('Coefficienti'),
    subtitle: stats.parameterization === 'ph' ? copy('Hazard ratio e CI') : copy('Time ratio e CI'),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      {
        key: 'timeRatio',
        label: stats.parameterization === 'ph' ? copy('HR') : copy('Time ratio'),
        format: 'dec4',
      },
      {
        key: 'lo',
        label: stats.parameterization === 'ph' ? copy('HR low') : copy('TR low'),
        format: 'dec4',
      },
      {
        key: 'hi',
        label: stats.parameterization === 'ph' ? copy('HR high') : copy('TR high'),
        format: 'dec4',
      },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [
      stats.parameterization === 'ph'
        ? copy('Hazard ratio > 1 indica un rischio istantaneo più alto per un’unità in più del predittore.')
        : copy('Time ratio > 1 indica tempi di sopravvivenza più lunghi per un’unità in più del predittore.'),
    ],
  },
];
