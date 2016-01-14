import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {MergeAllOperator} from './mergeAll-support';
import {isScheduler} from '../util/isScheduler';
import {isNumeric} from '../util/isNumeric';

export interface merge {
  // TODO: Expand and reify this rest parameter to prevent incorrect consumption
  <U1>(u1: Observable<U1>, scheduler?: Scheduler, concurrency?: number): Observable<U1>
  <U1, U2>(u1: Observable<U1>, u2: Observable<U2>, scheduler?: Scheduler, concurrency?: number): Observable<U1 | U2>
  <U1, U2, U3>(u1: Observable<U1>, u2: Observable<U2>, u3: Observable<U3>, scheduler?: Scheduler, concurrency?: number): Observable<U1 | U2 | U3>
  <U1, U2, U3, U4>(u1: Observable<U1>, u2: Observable<U2>, u3: Observable<U3>, u4: Observable<U4>, scheduler?: Scheduler, concurrency?: number): Observable<U1 | U2 | U3 | U4>
  <U1, U2, U3, U4, U5>(u1: Observable<U1>, u2: Observable<U2>, u3: Observable<U3>, u4: Observable<U4>, u5: Observable<U5>, scheduler?: Scheduler, concurrency?: number): Observable<U1 | U2 | U3 | U4 | U5>
}

export function merge<U>(...args: (Observable<U> | Scheduler | number)[]): Observable<U> {
  let scheduler: Scheduler = null;
  let concurrent: number = Number.POSITIVE_INFINITY;
  let observables: Observable<U>[];
  
  if (args.length === 1) {
    return <Observable<U>>args[0];
  }
  
  let last = args.pop();
  let secondLast = args.pop();
  observables = <Observable<U>[]>args;
  
  if (isScheduler(secondLast)) scheduler = secondLast
  else if (isNumeric(secondLast)) concurrent= secondLast;
  else observables.push(secondLast);
    
  if (isScheduler(last)) scheduler = last;
  else if (isNumeric(last)) concurrent = last;
  else observables.push(last);

  return new ArrayObservable(observables, scheduler).lift(new MergeAllOperator<U>(concurrent));
}

function test<T extends U[], U>(arr: T[]) {
  return arr;
}
