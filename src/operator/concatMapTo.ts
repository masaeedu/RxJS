import {Observable} from '../Observable';
import {MergeMapToOperator} from './mergeMapTo-support';

export type ResultSelector<T, R, R2> = (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2;

export interface concatMapTo<T> {
  <R>(observable: Observable<R>): Observable<R>
  <R, R2>(observable: Observable<R>, resultSelector: ResultSelector<T, R, R2>): Observable<R2>
}

/**
 * Maps values from the source to a specific observable, and merges them together in a serialized fashion.
 *
 * @param {Observable} observable the observable to map each source value to
 * @param {function} [resultSelector] an optional result selector that is applied to values before they're
 * merged into the returned observable. The arguments passed to this function are:
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 * @returns {Observable} an observable of values merged together by joining the passed observable
 * with itself, one after the other, for each value emitted from the source.
 */
export function concatMapTo<T, R, R2>(observable: Observable<R>, resultSelector?: ResultSelector<T, R, R2>): Observable<R> | Observable<R2> {
  let _this: Observable<T> = this
  // TODO: The way this is implemented is not type safe. Need to fix implementation
  return <any>_this.lift(new MergeMapToOperator(observable, resultSelector, 1));
}
