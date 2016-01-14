import {Subscriber} from './Subscriber';

export interface Operator<T, R> {
  call(subscriber: Subscriber<R>): Subscriber<T>;
}

export class Operator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new Subscriber<T>(subscriber);
  }
}
