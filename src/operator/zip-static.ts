import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {ZipOperator} from './zip-support';
import {isFunction} from '../util/isFunction';

export type Projection<U, R> = (...values: U[]) => R;

export interface zip {
  <U>(...observables: Observable<U>[]): Observable<U[]>;
  // TODO: Expand and reify
  <U, R>(...observables: (Observable<U> | Projection<U, R>)[]): Observable<R>
}

export function zip<U, R>(...args: (Observable<U> | Projection<U, R>)[]): Observable<R> {
  let project: Projection<U, R>;
  let observables: Observable<U>[];
  
  let last = args.pop();
  observables = <Observable<U>[]>args;
  if (isFunction(last)) {
    project = last;
  } else {
    observables.push(last);
  }
  
  return new ArrayObservable(observables).lift(new ZipOperator<U, R>(project));
}