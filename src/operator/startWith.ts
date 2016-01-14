import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {ScalarObservable} from '../observable/ScalarObservable';
import {EmptyObservable} from '../observable/empty';
import {concat} from './concat-static';
import {isScheduler} from '../util/isScheduler';

export interface startWith<T> {
  // TODO: Expand and reify
  (...args: (T | Scheduler)[]): Observable<T>;
}

export function startWith<T>(...args: (T | Scheduler)[]): Observable<T>{
  let _this: Observable<T> = this;
  
  let items: T[];
  let scheduler: Scheduler; 
  
  let last = args.pop();
  items = <T[]>args; 
  if (isScheduler(last)) {
    scheduler = last;
  } else {
    items.push(last);
  }

  const len = items.length;
  if (len === 1) {
    return concat(new ScalarObservable<T>(items[0], scheduler), _this);
  } else if (len > 1) {
    return concat(new ArrayObservable<T>(items, scheduler), _this);
  } else {
    return concat(new EmptyObservable<T>(scheduler), _this);
  }
}
