import test from 'node:test';
import assert from 'node:assert/strict';
import { principalComponents } from './multivariate';

test('PCA eigenvectors match prcomp up to sign', () => {
  // Righe: 5 casi; colonne: tre variabili.
  const data = [
    [2, 1, 5],
    [4, 2, 4],
    [6, 1, 3],
    [8, 3, 2],
    [10, 4, 1],
  ];
  const result = principalComponents(data, ['x1', 'x2', 'x3'], true);
  assert.ok(result);
  // R 4.5.2: prcomp(X, scale. = TRUE)$rotation
  const expected = [[0.5883199772, 0.5547604969, -0.5883199772], [-0.3922749093, 0.8320100907, 0.3922749093], [-0.7071067812, 0.0, -0.7071067812]];
  for (let variable = 0; variable < 3; variable += 1) {
    for (let component = 0; component < 3; component += 1) {
      const actual = result!.eigenvectors[variable][component];
      const target = expected[component][variable];
      assert.ok(
        Math.abs(Math.abs(actual) - Math.abs(target)) < 1e-8,
        `eigenvector(${variable},${component}) = ${actual}, atteso ±${target}`
      );
    }
  }
});

test('every eigenvector column has unit norm', () => {
  const data = [
    [2, 1, 5],
    [4, 2, 4],
    [6, 1, 3],
    [8, 3, 2],
    [10, 4, 1],
  ];
  const result = principalComponents(data, ['x1', 'x2', 'x3'], true);
  assert.ok(result);
  for (let component = 0; component < 3; component += 1) {
    const norm = Math.sqrt(
      result!.eigenvectors.reduce((sum, row) => sum + row[component] * row[component], 0)
    );
    assert.ok(Math.abs(norm - 1) < 1e-10, `norma ${norm}`);
  }
});
