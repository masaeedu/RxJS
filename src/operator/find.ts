import {FindValueOperator} from './find-support';
import {Observable} from '../Observable';

export type Predicate<T> = (value: T, index: number, source: Observable<T>) => boolean;

export interface find<T> {
  (predicate: Predicate<T>, thisArg?: any): Observable<T>;
}

/**
 * Returns an Observable that searches for the first item in the source Observable that
 * matches the specified condition, and returns the first occurence in the source.
 * @param {function} predicate function called with each item to test for condition matching.
 * @returns {Observable} an Observable of the first item that matches the condition.
 */
export function find<T>(predicate: Predicate<T>, thisArg?: any): Observable<T> {
  let _this: Observable<T> = this;
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate is not a function');
  }
  // TODO: The way this is implemented is not type safe. Need to fix implementation
  return <Observable<T>>_this.lift(new FindValueOperator(predicate, _this, false, thisArg));
}
