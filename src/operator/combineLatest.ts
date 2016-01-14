import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {CombineLatestOperator} from './combineLatest-support';
import {isArray} from '../util/isArray';
import {isFunction} from '../util/isFunction';

export type Projection<T, R> = (...values: Array<T>) => R;

export interface combineLatest<T> {
  <U>(others: Observable<U>[]): Observable<(T | U)[]>;
  <U, R>(others: Observable<U>[], project: Projection<T | U, R>): Observable<R>;
  <U>(...others: Observable<U>[]): Observable<(T | U)[]>;
  // TODO: Expand and reify this rest parameter to prevent incorrect consumption
  <U, R>(...others: Observable<U | Projection<T | U, R>>[]): Observable<T[] | R>;
}

/**
* Combines the values from this observable with values from observables passed as arguments. This is done by subscribing
* to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
* emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
* value of that, or just emitting the array of recent values directly if there is no `project` function.
* @param {...Observable} observables the observables to combine the source with
* @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
* @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
* the most recent values from each observable.
*/
export function combineLatest<T, U, R>(first: Observable<U> | Observable<U>[], ...rest: (Observable<U> | Projection<T | U, R>)[]): Observable<(T | U)[] | R> {
  let _this: Observable<T> = this;
  let observables: Observable<T | U>[];
  let project: Projection<T | U, R> = null;
  
  // if the first and only other argument besides the resultSelector is an array
  // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
  if (isArray(first)) {
    observables = first;
    project = <Projection<T | U, R>>rest.pop();
  } else {
    // pop the last argument; everything left in the spread array should be an observable
    let last = rest.pop();
    observables = <Observable<U>[]>rest;
    observables.unshift(<any>first);

    // test if the last argument is another observable or the projection function
    if (isFunction(last)) {
      project = last;
    } else if (last) {
      observables.push(last);
    }
  }

  // Add source observable to list of observables
  observables.unshift(_this);

  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}
