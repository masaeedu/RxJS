import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {isScheduler} from '../util/isScheduler';
import {ArrayObservable} from '../observable/fromArray';
import {MergeAllOperator} from './mergeAll-support';

export interface concat<T> {
  // TODO: Expand and reify this rest parameter to prevent incorrect consumption
  <U>(...args: (Observable<U> | Scheduler)[]): Observable<T | U>;
}

/**
 * Joins this observable with multiple other observables by subscribing to them one at a time, starting with the source,
 * and merging their results into the returned observable. Will wait for each observable to complete before moving
 * on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
export function concat<T, U>(...args: (Observable<U> | Scheduler)[]): Observable<T | U> {
  let _this: Observable<T> = this;
  let observables: Observable<T | U>[];
  let scheduler: Scheduler;

  let last = args.pop();
  observables = <Observable<U>[]>args;
  if (isScheduler(last)) {
    scheduler = last;
  } else if (last) {
    observables.push(last);
  }
  
  observables.unshift(_this);

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator<T | U>(1));
}
