import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {ObserveOnOperator} from './observeOn-support';

export interface observeOn<T> {
  (scheduler: Scheduler, delay?: number): Observable<T>;
}

export function observeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new ObserveOnOperator<T>(scheduler, delay));
}
