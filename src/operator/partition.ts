import {not} from '../util/not';
import {filter} from './filter';
import {Observable} from '../Observable';

export interface partition<T> {
  (predicate: (value: T) => boolean, thisArg?: any): [Observable<T>, Observable<T>];
}

export function partition<T>(predicate: (value: T) => boolean, thisArg?: any): [Observable<T>, Observable<T>] {
  return [
    filter.call(this, predicate),
    filter.call(this, not(predicate, thisArg))
  ];
}
