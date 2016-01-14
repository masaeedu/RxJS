import {ZipOperator} from './zip-support';
import {Observable} from '../Observable';

export type Projection<U, R> = (...values: U[]) => R;

export interface zipAll<T extends Observable<U>, U> {
  (): Observable<U[]>;
  <R>(project: Projection<U, R>): Observable<R>;
}

export function zipAll<T extends Observable<U>, U, R>(project?: Projection<U, R>): Observable<U[]> | Observable<R> {
  let _this: Observable<Observable<U>> = this;
  return _this.lift(new ZipOperator(project));
}
