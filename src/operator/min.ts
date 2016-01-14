import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';

export interface min<T> {
  (comparer?: (value1: T, value2: T) => T): Observable<T>;
}

export function min<T>(comparer?: (value1: T, value2: T) => T): Observable<T> {
  let _this: Observable<T> = this;
  const min: typeof comparer = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x < y ? x : y;
  return _this.lift(new ReduceOperator(min));
}
