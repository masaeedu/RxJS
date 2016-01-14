import {Observable} from '../Observable';
import {MergeAllOperator} from './mergeAll-support';

export interface mergeAll<T extends Observable<U>, U> {
  (concurrent: number): Observable<U>
}

export function mergeAll<T extends Observable<U>, U>(concurrent: number = Number.POSITIVE_INFINITY): Observable<U> {
  let _this: Observable<Observable<U>> = this;
  return _this.lift(new MergeAllOperator<U>(concurrent));
}
