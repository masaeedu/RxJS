import {ReplaySubject} from '../subject/ReplaySubject';
import {Scheduler} from '../Scheduler';
import {multicast} from './multicast';
import {ConnectableObservable} from '../observable/ConnectableObservable';

export interface publishReplay<T> {
  (bufferSize?: number, windowTime?: number, scheduler?: Scheduler): ConnectableObservable<T>;
}

export function publishReplay<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                 windowTime: number = Number.POSITIVE_INFINITY,
                                 scheduler?: Scheduler): ConnectableObservable<T> {
  return multicast.call(this, new ReplaySubject<T>(bufferSize, windowTime, scheduler));
}
