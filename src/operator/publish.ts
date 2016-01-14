import {Subject} from '../Subject';
import {multicast} from './multicast';
import {ConnectableObservable} from '../observable/ConnectableObservable';

export interface publish<T> {
  (): ConnectableObservable<T>;
}

export function publish<T>(): ConnectableObservable<T> {
  return multicast.call(this, new Subject<T>());
}
