import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPropensity, type PropensityMethod } from '../kernels/propensity';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface PropensityFixtureInput {
  treatment: number[];
  outcome: number[];
  covariates: number[][];
  names: string[];
  method: PropensityMethod;
  caliper: number;
  ratio: number;
  level: number;
}

interface PropensityFixtureBalance {
  covariate: string;
  meanTreated: number;
  meanControlBefore: number;
  meanControlAfter: number;
  smdBefore: number;
  smdAfter: number;
}

interface PropensityFixtureCase {
  name: string;
  method: PropensityMethod;
  caliper: number;
  ratio: number;
  level: number;
  input: PropensityFixtureInput;
  output: {
    ps: {
      coefficients: { term: string; beta: number; se: number }[];
      fitted: number[];
    };
    balance: PropensityFixtureBalance[];
    att: { estimate: number; se: number; z: number; p: number; lo: number; hi: number };
    nTreated: number;
    nControl: number;
    matchedTreated: number;
    matchedControls: number;
    droppedTreated: number;
    effectiveSampleSize: number;
    commonSupport: { lo: number; hi: number };
    method: PropensityMethod;
    caliper: number;
    ratio: number;
  };
}

interface PropensityFixture {
  source: string;
  generatedBy: string;
  cases: PropensityFixtureCase[];
}

const fixture = loadFixture<PropensityFixture>('propensity.json');

/**
 * ATT and standardized differences come from an independent implementation
 * (MatchIt for matching, base R for IPW). Ties in nearest-neighbour matching
 * are resolved by the kernel's (distance, row index) rule, which can differ
 * from MatchIt; the fixture therefore compares estimates and balance, never
 * the identity of the matched pairs.
 */
const ESTIMATE_TOLERANCE = { absolute: 1e-3 };

test('propensity kernel matches the MatchIt and base-R IPW fixtures', () => {
  assert.ok(fixture.cases.length >= 2);
  for (const reference of fixture.cases) {
    const input = reference.input;
    const result = fitPropensity({
      treatment: input.treatment,
      outcome: input.outcome,
      covariates: input.covariates,
      method: input.method,
      caliper: input.caliper,
      ratio: input.ratio,
      level: input.level,
      names: input.names,
    });
    assert.ok(result, `${reference.name}: model did not converge`);

    assert.equal(result!.method, reference.output.method);
    assert.equal(result!.caliper, reference.output.caliper);
    assert.equal(result!.ratio, reference.output.ratio);
    assert.equal(result!.nTreated, reference.output.nTreated);
    assert.equal(result!.nControl, reference.output.nControl);
    assert.equal(result!.matchedTreated, reference.output.matchedTreated);
    assert.equal(result!.matchedControls, reference.output.matchedControls);
    assert.equal(result!.droppedTreated, reference.output.droppedTreated);
    assertClose(
      result!.effectiveSampleSize,
      reference.output.effectiveSampleSize,
      TOLERANCES.r,
      `${reference.name} effective sample size`
    );
    assertClose(
      result!.commonSupport.lo,
      reference.output.commonSupport.lo,
      TOLERANCES.r,
      `${reference.name} common support lo`
    );
    assertClose(
      result!.commonSupport.hi,
      reference.output.commonSupport.hi,
      TOLERANCES.r,
      `${reference.name} common support hi`
    );

    assertCloseVector(
      result!.ps.coefficients.map(coefficient => coefficient.beta),
      reference.output.ps.coefficients.map(coefficient => coefficient.beta),
      TOLERANCES.rProbability,
      `${reference.name} propensity beta`
    );
    assertCloseVector(
      result!.ps.coefficients.map(coefficient => coefficient.se),
      reference.output.ps.coefficients.map(coefficient => coefficient.se),
      TOLERANCES.rProbability,
      `${reference.name} propensity se`
    );
    assertCloseVector(
      result!.ps.fitted,
      reference.output.ps.fitted,
      TOLERANCES.rProbability,
      `${reference.name} fitted propensity scores`
    );

    assert.equal(result!.balance.length, reference.output.balance.length);
    result!.balance.forEach((row, index) => {
      const expected = reference.output.balance[index];
      assert.equal(row.covariate, expected.covariate);
      assertClose(row.meanTreated, expected.meanTreated, TOLERANCES.rProbability, `${reference.name} ${row.covariate} mean treated`);
      assertClose(row.meanControlBefore, expected.meanControlBefore, TOLERANCES.rProbability, `${reference.name} ${row.covariate} mean control before`);
      assertClose(row.meanControlAfter, expected.meanControlAfter, TOLERANCES.rProbability, `${reference.name} ${row.covariate} mean control after`);
      assertClose(row.smdBefore, expected.smdBefore, ESTIMATE_TOLERANCE, `${reference.name} ${row.covariate} SMD before`);
      assertClose(row.smdAfter, expected.smdAfter, ESTIMATE_TOLERANCE, `${reference.name} ${row.covariate} SMD after`);
    });

    assertClose(result!.att.estimate, reference.output.att.estimate, ESTIMATE_TOLERANCE, `${reference.name} ATT`);
    assert.ok(Number.isFinite(result!.att.se) && result!.att.se > 0, `${reference.name} ATT SE`);

    // Nearest matching uses the paired-difference SE required by the kernel
    // contract; MatchIt's reference `lm()` uses the independent-groups WLS SE.
    // The two formulas are different by construction, so only IPW compares SE.
    if (reference.output.method === 'ipw') {
      assertClose(result!.att.se, reference.output.att.se, TOLERANCES.rProbability, `${reference.name} ATT SE`);
      assertClose(result!.att.z, reference.output.att.z, TOLERANCES.rProbability, `${reference.name} ATT z`);
      assertClose(result!.att.p, reference.output.att.p, TOLERANCES.rProbability, `${reference.name} ATT p`);
      assertClose(result!.att.lo, reference.output.att.lo, TOLERANCES.rProbability, `${reference.name} ATT lo`);
      assertClose(result!.att.hi, reference.output.att.hi, TOLERANCES.rProbability, `${reference.name} ATT hi`);
    }
  }
});

test('the propensity harness still rejects differences above the declared tolerance', () => {
  assert.throws(() => assertClose(1.01, 1, ESTIMATE_TOLERANCE));
  assertClose(1.0005, 1, ESTIMATE_TOLERANCE);
});
