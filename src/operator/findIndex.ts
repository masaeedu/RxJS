import {Observable} from '../Observable';
import {FindValueOperator} from './find-support';

export type Predicate<T> = (value: T, index: number, source: Observable<T>) => boolean;

export interface findIndex<T> {
  (predicate: Predicate<T>, thisArg?: any): Observable<number>;
}

/**
 * Returns an Observable that searches for the first item in the source Observable that
 * matches the specified condition, and returns the the index of the item in the source.
 * @param {function} predicate function called with each item to test for condition matching.
 * @returns {Observable} an Observable of the index of the first item that matches the condition.
 */
export function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<number> {
  let _this: Observable<T> = this;
  // TODO: The way this is implemented is not type safe. Need to fix implementation
  return <Observable<number>>_this.lift(new FindValueOperator(predicate, this, true, thisArg));
}
