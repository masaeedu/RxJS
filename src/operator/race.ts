import {Observable} from '../Observable';
import {race as raceStatic} from './race-static';
import {isArray} from '../util/isArray';

export interface race<T> {
  <U>(observables: Observable<U>[]): Observable<T | U>;
  <U>(...observables: Observable<U>[]): Observable<T | U>;
}

/**
 * Returns an Observable that mirrors the first source Observable to emit an item
 * from the combination of this Observable and supplied Observables
 * @param {...Observables} ...observables sources used to race for which Observable emits first.
 * @returns {Observable} an Observable that mirrors the output of the first Observable to emit an item.
 */
export function race<T, U>(first: Observable<U> | Observable<U>[], ...rest: Observable<U>[]): Observable<T | U> {
  let _this: Observable<T> = this;
  // if the only argument is an array, it was most likely called with
  // `pair([obs1, obs2, ...])`
  let observables: (Observable<T> | Observable<U>)[] = isArray(first) ? first : [first, ...rest];

  observables.unshift(_this);
  return raceStatic.apply(_this, observables);
}
