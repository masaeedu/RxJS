import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';
import {EmptyObservable} from '../observable/empty';
import {Observable} from '../Observable';

export interface take<T> {
  (total: number): Observable<T>;
}

export function take<T>(total: number): Observable<T> {
  let _this: Observable<T> = this;
  if (total === 0) {
    return new EmptyObservable<T>();
  } else {
    return _this.lift(new TakeOperator<T>(total));
  }
}

class TakeOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeSubscriber(subscriber, this.total);
  }
}

class TakeSubscriber<T> extends Subscriber<T> {
  private count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const total = this.total;
    if (++this.count <= total) {
      this.destination.next(value);
      if (this.count === total) {
        this.destination.complete();
      }
    }
  }
}
