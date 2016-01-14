import {Observable} from '../Observable';
import {zip} from './zip-static';
import {isFunction} from '../util/isFunction';

export type Projection<U, R> = (...values: U[]) => R;

export interface zipProto<T> {
  <U>(...observables: Observable<U>[]): Observable<U[]>;
  // TODO: Expand and reify
  <U, R>(...observables: (Observable<U> | Projection<U, R>)[]): Observable<R>
}

export function zipProto(...args: any[]) {
  args.unshift(this);
  return zip.apply(this, args);
}
