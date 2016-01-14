import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

export interface toArray<T> {
  (): Observable<T[]>;
}

export function toArray<T>(): Observable<T[]> {
  let _this: Observable<T> = this;
  return _this.lift(new ToArrayOperator<T>());
}

class ToArrayOperator<T> implements Operator<T, T[]> {
  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new ToArraySubscriber(subscriber);
  }
}

class ToArraySubscriber<T> extends Subscriber<T> {

  array: T[] = [];

  constructor(destination: Subscriber<T[]>) {
    super(destination);
  }

  protected _next(x: T) {
    this.array.push(x);
  }

  protected _complete() {
    this.destination.next(this.array);
    this.destination.complete();
  }
}
