import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {MergeAllOperator} from './mergeAll-support';
import {ArrayObservable} from '../observable/fromArray';
import {isScheduler} from '../util/isScheduler';

export interface concat {
  // TODO: Expand and reify
  <U>(...args:  (Observable<U> | Scheduler)[]): Observable<U>
}

/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concat<U>(...args: (Observable<U> | Scheduler)[]): Observable<U> {
  let observables: Observable<U>[];
  let scheduler: Scheduler;
  
  let last = args.pop();
  observables = <Observable<U>[]>args;
  if (isScheduler(last)) {
    scheduler = last;
  } else {
    observables.push(last);
  }

  return new ArrayObservable(args, scheduler).lift(new MergeAllOperator<U>(1));
}
