import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {CombineLatestOperator} from './combineLatest-support';
import {Scheduler} from '../Scheduler';
import {isScheduler} from '../util/isScheduler';
import {isFunction} from '../util/isFunction';
import {isArray} from '../util/isArray';

export type Projection<U, R> = (...values: U[]) => R;

export interface combineLatest {
  <U>(observables: Observable<U>[]): Observable<U[]>;
  // <U>(observables: Observable<U>[], scheduler: Scheduler): Observable<U[]>; // Too cumbersome to check
  <U, R>(observables: Observable<U>[], project: Projection<U, R>): Observable<R>;
  <U, R>(observables: Observable<U>[], project: Projection<U, R>, scheduler: Scheduler): Observable<R>;
  // TODO: Expand and reify
  <U, R>(...args: (Observable<U> | Projection<U, R> | Scheduler)[]): Observable<R>
}

/**
 * Combines the values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */
export function combineLatest<U, R>(first: Observable<U>[] | Observable<U>, ...args: (Observable<U> | Projection<U, R> | Scheduler)[]): Observable<U[]> | Observable<R> {
  let project: (...values: Array<any>) => R =  null;
  let scheduler: Scheduler = null;
  let observables: Observable<U>[];

  let last = args[args.length - 1];
  if (isScheduler(last)) {
    scheduler = last;
    args.pop();
  }
  
  last = args[args.length - 1];
  if (isFunction(last)) {
    project = last;
    args.pop();
  }

  // if the first and only other argument besides the resultSelector is an array
  // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
  if (!args.length && isArray(first)) {
    observables = first;
  } else {
    observables = <any>args;
    observables.unshift(<any>first);
  }

  return new ArrayObservable(observables, scheduler).lift(new CombineLatestOperator<Observable<U>, U, R>(project));
}
