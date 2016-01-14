import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';

export type Comparer<T> = (value1: T, value2: T) => T;

export interface max<T> {
  (comparer?: Comparer<T>): Observable<T>;
}

export function max<T>(comparer?: (value1: T, value2: T) => T): Observable<T> {
  let _this: Observable<T> = this;
  const max: typeof comparer = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x > y ? x : y;
  return _this.lift(new ReduceOperator(max));
}
