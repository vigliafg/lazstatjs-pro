import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 7 procedures: VAR/VECM, GARCH and state-space models. */
export const w7Topics: HelpTopic[] = [
  procedureTopic({
    id: 'var',
    title: 'VAR / VECM',
    summary: 'Model several time series jointly, test Granger causality and estimate error correction.',
    goal: 'Describe how each series depends on its own past and on the past of the others, and separate long-run relations from short-run dynamics.',
    steps: [
      'Select at least two numeric series in time order.',
      'Keep lags at 0 for automatic AIC selection, or enter a fixed order.',
      'Choose VAR for stationary series or VECM for cointegrated I(1) series.',
      'Read the coefficients, the Granger tests, the impulse responses and the variance decomposition.',
    ],
    expected:
      'A VAR summary with stability, coefficient tables, Granger tests, impulse responses and the variance decomposition; the VECM adds the cointegrating vector and the adjustment speeds.',
    whenToUse: [
      'When several series evolve together and you want to model their joint dynamics.',
      'When you need to test whether the past of one series helps forecast another.',
      'When you suspect a stable long-run relation between non-stationary series.',
    ],
    assumptions: [
      'The series are stationary, or differenced to stationarity; VECM requires I(1) series with a cointegrating relation.',
      'The residuals are serially uncorrelated after the chosen lag order.',
      'The number of observations is large enough for the number of parameters.',
    ],
    whenNotToUse: [
      'With very short series: the number of parameters grows quickly with the number of lags and series.',
      'When the question is about one outcome only: a univariate ARIMA or regression is simpler.',
      'When structural breaks dominate the series and are not modelled.',
    ],
    reading: [
      'A stable VAR has all characteristic roots outside the unit circle: impulse responses die out.',
      'A significant Granger test means the lagged cause improves the forecast of the effect, not that it causes it.',
      'Impulse responses depend on the Cholesky order; the first series reacts only to its own contemporaneous shock.',
      'In a VECM, a negative and significant α means the series corrects deviations from the long-run relation.',
    ],
    pitfalls: [
      'Running a VAR on trending levels without checking stationarity.',
      'Reading Granger causality as structural causality.',
      'Interpreting impulse responses without stating the identification order.',
      'Using Engle–Granger when more than one cointegrating relation may exist.',
    ],
    charts: ['Impulse responses by shock and response.', 'Forecast error variance shares at the final horizon.'],
    glossary: [
      { term: 'VAR', definition: 'A system of autoregressions, one equation per series, with the lags of all series as regressors.' },
      { term: 'Cointegration', definition: 'A stationary linear combination of non-stationary series.' },
      { term: 'Impulse response', definition: 'The change in the series after a one-standard-deviation shock.' },
    ],
    seeAlso: ['timeseries', 'statespace'],
  }),
  procedureTopic({
    id: 'garch',
    title: 'GARCH',
    summary: 'Estimate conditional volatility that clusters in time with a GARCH(1,1) model.',
    goal: 'Separate the level of a series from its time-varying volatility and forecast the scale of future fluctuations.',
    steps: [
      'Select the return or change series in time order.',
      'Set the forecast horizon.',
      'Run the model and read the persistence, the long-run variance and the half-life.',
      'Check the Ljung–Box test on the standardised residuals.',
    ],
    expected:
      'A model summary, coefficient table with standard errors, residual diagnostics and forecasts of the conditional variance.',
    whenToUse: [
      'When the size of fluctuations changes over time and clusters in calm and turbulent periods.',
      'When you need a volatility forecast or a time-varying scale for risk measures.',
      'When residuals of a mean model still show autocorrelation in their squares.',
    ],
    assumptions: [
      'The conditional variance follows the GARCH recursion with positive ω, α, β and α + β < 1 for stationarity.',
      'The standardised innovations are approximately uncorrelated; normality is convenient but not required for consistency.',
      'The mean is constant or already removed.',
    ],
    whenNotToUse: [
      'When volatility reacts differently to positive and negative shocks: consider an asymmetric model.',
      'When the series has trends or deterministic seasonality in the mean.',
      'With fewer than about thirty observations.',
    ],
    reading: [
      'α measures the reaction to the last innovation; β measures the memory of past volatility.',
      'Persistence close to 1 means volatility shocks last a long time; the half-life is the number of periods to halve a shock.',
      'The long-run variance is ω/(1 − α − β) when α + β < 1.',
      'The conditional SD is the expected scale of fluctuations, not a confidence interval for the mean.',
    ],
    pitfalls: [
      'Confusing variance forecasts with price forecasts.',
      'Ignoring residual autocorrelation in the squares.',
      'Reporting half-life when α + β ≥ 1, where it is undefined.',
      'Treating the model as a complete description of tails and asymmetry.',
    ],
    charts: ['Series with the conditional standard deviation.', 'Autocorrelation of the standardised residuals.'],
    glossary: [
      { term: 'ARCH effect', definition: 'Dependence of the current variance on recent squared innovations.' },
      { term: 'Persistence', definition: 'α + β in GARCH(1,1), the speed at which volatility shocks decay.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
  procedureTopic({
    id: 'statespace',
    title: 'State-space and Markov switching',
    summary: 'Estimate a latent level or trend with the Kalman filter, or two regimes with a Markov-switching AR(1).',
    goal: 'Separate signal from noise and describe series that alternate between different regimes.',
    steps: [
      'Choose the local level/trend model or the two-regime Markov switching model.',
      'Select the series and the forecast horizon.',
      'For the local model, decide whether to include a stochastic trend.',
      'Read the smoothed states and the forecast, or the regime probabilities and transition matrix.',
    ],
    expected:
      'For the local model: variance estimates, filtered and smoothed states, and forecasts with intervals. For Markov switching: regime means and variances, transition matrix, smoothed probabilities and forecasts.',
    whenToUse: [
      'When the observed series is a noisy measure of a smoother latent quantity.',
      'When the series seems to alternate between calm and turbulent, or low and high, phases.',
      'When you need a principled interpolation of missing or noisy history.',
    ],
    assumptions: [
      'The local model is linear and Gaussian with mutually independent innovations.',
      'The Markov model has two regimes, constant transition probabilities and an AR(1) mean within each regime.',
      'The number of regimes is known and the labels are identified by the starting values.',
    ],
    whenNotToUse: [
      'When regime changes are driven by observed covariates: a threshold or interaction model may be clearer.',
      'When the series is very short: variances and regime labels are unstable.',
      'When a simple trend regression answers the question.',
    ],
    reading: [
      'The filtered state uses only the past; the smoothed state uses the whole series.',
      'In the local model, a large observation variance means most variability is measurement noise.',
      'In the Markov model, the expected duration of a regime is 1/(1 − p).',
      'The forecast mean averages the regimes with their transition probabilities.',
    ],
    pitfalls: [
      'Reading the filtered state as if it used future observations.',
      'Forcing a stochastic trend when a level-only model has better AIC/BIC.',
      'Interpreting regime labels without checking their substantive meaning.',
      'Ignoring uncertainty in the regime classification.',
    ],
    charts: ['Observed series, smoothed level and forecast.', 'Smoothed probability of the second regime.'],
    glossary: [
      { term: 'Kalman filter', definition: 'Recursive updating of a latent state from noisy observations.' },
      { term: 'Smoother', definition: 'Estimate of the latent state that uses the whole series, past and future.' },
      { term: 'Markov switching', definition: 'A model where the parameters change according to a hidden Markov chain.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
];
