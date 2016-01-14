import {Observable} from '../Observable';
import {MergeMapOperator} from './mergeMap-support';

export type Projection<T, R> = (value: T, index: number) => Observable<R>;
export type ResultSelector<T, R, R2> = (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2;

export interface mergeMap<T> {
  <R>(project: Projection<T, R>): Observable<R>;
  // <R>(project: Projection<T, R>, concurrent: number): Observable<R>;
  <R, R2>(project: Projection<T, R>, resultSelector: ResultSelector<T, R, R2>): Observable<R2>;
  <R, R2>(project: Projection<T, R>, resultSelector: ResultSelector<T, R, R2>, concurrent: number): Observable<R2>;
}

export function mergeMap<T, R, R2>(project: Projection<T, R>,
                                   resultSelector?: ResultSelector<T, R, R2>,
                                   concurrent: number = Number.POSITIVE_INFINITY): Observable<R | R2> {
  let _this: Observable<T> = this;
  return _this.lift(new MergeMapOperator(project, resultSelector, concurrent));
}
