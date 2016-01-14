import {Observable} from '../Observable';
import {MergeMapToOperator} from './mergeMapTo-support';

export type ResultSelector<T, R, R2> = (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2;

export interface mergeMapTo<T> {
  <R>(observable: Observable<R>): Observable<R>;
  // <R>(observable: Observable<R>, concurrent: number): Observable<R>; // TODO: This signature is not supported yet. Need to update function
  <R, R2>(observable: Observable<R>, resultSelector: ResultSelector<T, R, R2>): Observable<R2>;
  <R, R2>(observable: Observable<R>, resultSelector: ResultSelector<T, R, R2>, concurrent: number): Observable<R2>;
}

export function mergeMapTo<T, R, R2>(observable: Observable<R>,
                                     resultSelector?: ResultSelector<T, R, R2>,
                                     concurrent: number = Number.POSITIVE_INFINITY): Observable<R | R2> {
  let _this: Observable<T> = this;
  return _this.lift(new MergeMapToOperator(observable, resultSelector, concurrent));
}
