/**
 * Fixture deterministica condivisa dai test.
 *
 * Una sola tabella, tipi eterogenei e qualche valore mancante: serve a
 * congelare l'output delle analisi (golden test) e a esercitare i casi che
 * il refactor deve preservare (missing, gruppi, outlier, variabili appaiate).
 */

export const FIXTURE_COLUMNS = [
  'score',
  'age',
  'income',
  'pre',
  'group',
  'sex',
  'post',
] as const;

/** Indici delle colonne, per non scrivere numeri magici nei test. */
export const COL = {
  score: 0,
  age: 1,
  income: 2,
  pre: 3,
  group: 4,
  sex: 5,
  post: 6,
} as const;

export const FIXTURE_ROWS: string[][] = [
  ['12.4', '34', '1850', '11.2', 'A', 'M', '13.1'],
  ['15.1', '41', '2100', '14.8', 'A', 'F', '16.0'],
  ['9.8', '29', '1620', '10.1', 'A', 'M', '10.4'],
  ['18.3', '52', '2600', '17.5', 'A', 'F', '19.2'],
  ['14.2', '38', '1980', '13.9', 'A', 'M', '15.3'],
  ['11.1', '31', '1750', '10.8', 'A', 'F', '12.0'],
  ['22.5', '47', '3100', '21.0', 'B', 'M', '23.8'],
  ['19.7', '44', '2870', '19.1', 'B', 'F', '20.9'],
  ['24.1', '55', '3420', '23.4', 'B', 'F', '25.0'],
  ['20.3', '39', '2950', '19.8', 'B', 'M', '21.6'],
  ['', '36', '2680', '18.7', 'B', 'M', '19.9'],
  ['21.8', '50', '3250', '20.6', 'B', 'F', '22.7'],
  ['8.2', '26', '1450', '7.9', 'C', 'F', '8.8'],
  ['10.6', '33', '1580', '10.0', 'C', 'M', '11.2'],
  ['7.4', '24', '1320', '7.1', 'C', 'F', '8.0'],
  ['9.1', '28', '1490', '8.8', 'C', 'M', '9.7'],
  ['11.9', '35', '1710', '11.4', 'C', 'F', '12.6'],
  ['6.8', '22', '1280', '6.5', 'C', 'M', '7.3'],
  ['16.4', '45', '2250', '15.9', 'A', 'M', '17.1'],
  ['13.7', '40', '1920', '13.2', 'A', 'F', '14.4'],
  ['25.2', '58', '4100', '24.6', 'B', 'F', '26.4'],
  ['23.0', '53', '3600', '22.5', 'B', 'M', '24.1'],
  ['12.0', '30', '1650', '11.6', 'C', 'F', '12.9'],
  ['17.6', '49', '2450', '17.0', 'A', 'M', '18.5'],
  ['8.9', '27', '1390', '8.4', 'C', 'M', '9.5'],
  ['19.2', '46', '2780', '18.6', 'B', 'F', '20.4'],
  ['14.9', '37', '2050', '14.3', 'A', 'F', '15.8'],
  ['', '42', '2320', '16.1', 'B', 'M', '17.0'],
  ['10.2', '32', '1540', '9.7', 'C', 'F', '10.9'],
  ['16.8', '48', '2380', '16.3', 'A', 'M', '17.9'],
];

/** Copia difensiva: i builder possono ordinare/filtrare, ma non devono mutare la fixture. */
export const fixtureRows = (): string[][] => FIXTURE_ROWS.map(row => [...row]);
