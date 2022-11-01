import { Suite } from 'benchmark';
import data from '../src/__mocks__/fixture-real-world';
import { trimmer } from '../src';

const suite = new Suite();

const trim = trimmer();

/**
 * Baseline is 42,707 ops/sec with fixture-real-world fixture
 */
suite
  .add('main', () => {
    trim(data);
  })
  .on('cycle', (event: any) => {
    /*tslint:disable:no-console */
    console.log(String(event.target));
  })
  // .on("complete", () => {})
  .run({ async: true });
