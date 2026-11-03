import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 6 procedures: competing risks, recurrent events, ALT and reliability. */
export const w6Topics: HelpTopic[] = [
  procedureTopic({
    id: 'competing',
    title: 'Competing risks',
    summary: 'Estimate the cumulative incidence of one cause while the other causes compete for the same event time.',
    goal: 'Measure how often a specific cause occurs when subjects can leave the risk set for other causes.',
    steps: [
      'Choose the time column and the event column whose codes identify the causes (0 = censored).',
      'Enter the code of the cause of interest in the cause field.',
      'Select the covariates and run the Fine–Gray model.',
      'Read the cumulative incidence curve and the subdistribution hazard ratios.',
    ],
    expected:
      'A summary of events and causes, the Fine–Gray coefficients with subdistribution hazard ratios, and the cumulative incidence curve for the mean covariate profile.',
    whenToUse: [
      'When an event can happen for several mutually exclusive reasons and the reasons are not independent.',
      'When you want the probability of one cause over time, not the hazard of a single event type.',
      'When a Kaplan–Meier curve for one cause would overstate its incidence.',
    ],
    assumptions: [
      'The causes are exhaustive and mutually exclusive, and censoring is non-informative.',
      'The subdistribution hazard ratios are constant over time.',
      'There are enough events of the chosen cause and of the competing causes.',
    ],
    whenNotToUse: [
      'When you need the cause-specific hazard instead of the cumulative incidence: use a cause-specific Cox model.',
      'When causes are not recorded reliably or overlap.',
    ],
    reading: [
      'The cumulative incidence is the probability of having the chosen cause by time t in a world where the other causes exist.',
      'A subdistribution hazard ratio above 1 means a higher cumulative incidence of the chosen cause.',
      'Kaplan–Meier treats competing events as censoring and is not the cumulative incidence.',
    ],
    pitfalls: [
      'Reading the cumulative incidence as 1 − survival of the chosen cause.',
      'Selecting the cause after looking at the results.',
      'Ignoring that a covariate can act differently on the cause-specific hazard and on the cumulative incidence.',
    ],
    charts: ['Cumulative incidence curve for the chosen cause.', 'Forest plot of subdistribution hazard ratios.'],
    glossary: [
      { term: 'Competing risk', definition: 'An event that prevents the event of interest from being observed.' },
      { term: 'Subdistribution hazard', definition: 'The hazard attached to the cumulative incidence function in the Fine–Gray model.' },
    ],
    seeAlso: ['survival', 'cox'],
  }),
  procedureTopic({
    id: 'recurrent',
    title: 'Recurrent events',
    summary: 'Model repeated events per subject with Andersen–Gill or Wei–Lin–Weissfeld and cluster-robust standard errors.',
    goal: 'Estimate the effect of covariates on the rate of repeated events without pretending that events of the same subject are independent.',
    steps: [
      'Select the subject identifier and the start, stop and event columns in start–stop format.',
      'Choose Andersen–Gill for the overall process or Wei–Lin–Weissfeld for event-specific strata.',
      'Add the covariates and run the model.',
      'Read the hazard ratios and the robust confidence intervals.',
    ],
    expected:
      'A summary of subjects and episodes, hazard ratios with cluster-robust standard errors, and global tests for the covariates.',
    whenToUse: [
      'When the same subject can experience the event more than once: relapses, failures, admissions.',
      'When the events of one subject are plausibly correlated.',
      'When you want a single effect of a covariate across repeated events.',
    ],
    assumptions: [
      'Censoring is non-informative and the start–stop intervals are coherent.',
      'Andersen–Gill assumes a common effect across events; Wei–Lin–Weissfeld allows a different baseline per event number.',
      'The cluster-robust variance needs enough subjects.',
    ],
    whenNotToUse: [
      'When events of different types must be modelled separately.',
      'When the main question is the time to the first event only: use a standard Cox model.',
    ],
    reading: [
      'Andersen–Gill keeps a subject in the risk set after each event and uses calendar time.',
      'Wei–Lin–Weissfeld uses the gap since the previous event and a separate stratum for each event number.',
      'Robust standard errors are larger than naive ones when events of the same subject are correlated.',
    ],
    pitfalls: [
      'Treating every row as an independent subject.',
      'Using gap time and calendar time interchangeably.',
      'Forgetting that the model describes the rate, not the time to the first event.',
    ],
    charts: ['Forest plot of the robust hazard ratios.'],
    seeAlso: ['cox', 'survival'],
  }),
  procedureTopic({
    id: 'alt',
    title: 'Accelerated life testing',
    summary: 'Relate survival time to a stress variable with a Weibull AFT and report an acceleration factor.',
    goal: 'Estimate life at a use stress from tests run at higher stress levels.',
    steps: [
      'Select time, event and the stress column.',
      'Choose the stress relationship: Arrhenius (1/stress), inverse power (log stress) or exponential (stress).',
      'Enter the use stress for the acceleration factor and select any additional covariates.',
      'Run the model and read the acceleration factor and the time ratios.',
    ],
    expected:
      'A Weibull AFT summary with the acceleration factor, the time ratios for the transformed stress and the other covariates, and a bar chart of the factor.',
    whenToUse: [
      'When components are tested at stress levels higher than the operating condition.',
      'When the failure mechanism is expected to stay the same across stress levels.',
      'When a single stress variable drives the life of the product.',
    ],
    assumptions: [
      'The Weibull distribution describes the times and the failure mechanism does not change with stress.',
      'Stress is measured without error and the levels are well separated.',
      'Extrapolation beyond the observed stress levels is justified by the physics of the failure.',
    ],
    whenNotToUse: [
      'When several failure mechanisms act at different stress levels.',
      'When the design has no replication or the stress is confounded with another factor.',
    ],
    reading: [
      'The acceleration factor compares life at the use stress with life at the lowest observed stress; above 1 means longer life at use.',
      'The time ratio refers to one unit of the transformed stress, not to one unit of raw stress.',
      'The scale σ describes the dispersion of the log times.',
    ],
    pitfalls: [
      'Extrapolating far beyond the tested range without a physical justification.',
      'Reading the time ratio as if it referred to raw stress.',
      'Ignoring a change in the failure mechanism at low stress.',
    ],
    charts: ['Forest plot of time ratios.', 'Bar chart of the acceleration factor.'],
    seeAlso: ['parametric', 'reliability'],
  }),
  procedureTopic({
    id: 'reliability',
    title: 'Reliability growth and RBD',
    summary: 'Track a Crow–AMSAA growth curve or combine component reliabilities in a series/parallel block diagram.',
    goal: 'See whether a repairable system is improving, or compute the reliability of a system from its components.',
    steps: [
      'Choose growth to analyse cumulative failures over time, or RBD to combine component reliabilities.',
      'For growth, select the time and cumulative-failure columns and run the model.',
      'For RBD, enter the reliability of each component, grouping parallel components in the same stage.',
      'Read the growth parameters or the system reliability and identify the weakest stage.',
    ],
    expected:
      'For growth: β, λ, cumulative and instantaneous MTBF, and a plot of observed and fitted cumulative failures. For RBD: the reliability of each stage and of the whole system.',
    whenToUse: [
      'When a repairable system is being improved and you want to check that failures are becoming less frequent.',
      'When the reliability of a system must be derived from the reliability of its components.',
      'When comparing design architectures (more parallel redundancy versus fewer stages).',
    ],
    assumptions: [
      'Growth: failures follow a non-homogeneous Poisson process with a power-law intensity and corrections are cumulative.',
      'RBD: components are independent and their reliabilities are known without uncertainty.',
      'The block diagram reflects the real functional structure of the system.',
    ],
    whenNotToUse: [
      'When repairs restore the system to a different state each time (use a more general repairable-system model).',
      'When components share a common cause of failure: the independence assumption of the RBD fails.',
    ],
    reading: [
      'β < 1 indicates a decreasing failure rate (growth); β = 1 is a homogeneous Poisson process.',
      'The instantaneous MTBF is the current mean time between failures; the cumulative MTBF averages since the start.',
      'In a series RBD the system reliability is the product of the stage reliabilities; inside a stage, parallel components give 1 − Π(1 − r).',
    ],
    pitfalls: [
      'Reading a growth curve as a prediction beyond the observed time.',
      'Entering component reliabilities that already include the system structure.',
      'Forgetting that one stage in series is enough to stop the system.',
    ],
    charts: ['Observed and fitted cumulative failures (growth).', 'Reliability by stage (RBD).'],
    seeAlso: ['alt', 'descriptive'],
  }),
];
