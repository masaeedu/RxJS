import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {RaceOperator} from './race-support';
import {isArray} from '../util/isArray';

export interface race {
  <U>(observables: Observable<U>[]): Observable<U>;
  <U>(...observables: Observable<U>[]): Observable<U>;
}

/**
 * Returns an Observable that mirrors the first source Observable to emit an item.
 * @param {...Observables} ...observables sources used to race for which Observable emits first.
 * @returns {Observable} an Observable that mirrors the output of the first Observable to emit an item.
 */
export function race<U>(first: Observable<U> | Observable<U>[], ...rest: Observable<U>[]): Observable<U> {
  let observables: Observable<U>[];
  
  // if the only argument is an array, it was most likely called with
  // `pair([obs1, obs2, ...])`
  if (isArray(first)) {
    observables = first;
  } else {
    if (!rest) return first;
    
    observables = [first, ...rest];
  }

  return new ArrayObservable(observables).lift(new RaceOperator<Observable<U>, U>());
}
