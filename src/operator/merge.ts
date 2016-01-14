import {Observable} from '../Observable';
import {merge as mergeStatic} from './merge-static';
import {Scheduler} from '../Scheduler';

export interface merge<T> {
  // TODO: Expand and reify this rest parameter to prevent incorrect consumption
  <U1>(u1: Observable<U1>, scheduler?: Scheduler, concurrency?: number): Observable<T | U1>
  <U1, U2>(u1: Observable<U1>, u2: Observable<U2>, scheduler?: Scheduler, concurrency?: number): Observable<T | U1 | U2>
  <U1, U2, U3>(u1: Observable<U1>, u2: Observable<U2>, u3: Observable<U3>, scheduler?: Scheduler, concurrency?: number): Observable<T | U1 | U2 | U3>
  <U1, U2, U3, U4>(u1: Observable<U1>, u2: Observable<U2>, u3: Observable<U3>, u4: Observable<U4>, scheduler?: Scheduler, concurrency?: number): Observable<T | U1 | U2 | U3 | U4>
  <U1, U2, U3, U4, U5>(u1: Observable<U1>, u2: Observable<U2>, u3: Observable<U3>, u4: Observable<U4>, u5: Observable<U5>, scheduler?: Scheduler, concurrency?: number): Observable<T | U1 | U2 | U3 | U4 | U5>
}

export function merge<T, U>(...observables: (Observable<U> | Scheduler | number)[]): Observable<T | U> {
  let _this: Observable<T> = this;
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
