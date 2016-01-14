import {Observable} from '../Observable';
import {ReduceOperator} from './reduce-support';

export interface reduce<T> {
  <R>(project: (acc: R, value: T) => R, seed?: R): Observable<R>;
}

export function reduce<T, R>(project: (acc: R, value: T) => R, seed?: R): Observable<R> {
  let _this: Observable<T> = this;
  return _this.lift(new ReduceOperator(project, seed));
}
