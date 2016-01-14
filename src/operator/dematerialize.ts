import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Notification} from '../Notification';

export interface dematerialize<T extends Notification<U>, U> {
  (): Observable<U>;
}

/**
 * Returns an Observable that transforms Notification objects into the items or notifications they represent.
 * @returns {Observable} an Observable that emits items and notifications embedded in Notification objects emitted by the source Observable.
 */
export function dematerialize<T extends Notification<U>, U>(): Observable<U> {
  let _this: Observable<T> = this;
  return _this.lift(new DeMaterializeOperator<T, U>());
}

class DeMaterializeOperator<T extends Notification<U>, U> implements Operator<T, U> {
  call(subscriber: Subscriber<U>): Subscriber<T> {
    return new DeMaterializeSubscriber<T, U>(subscriber);
  }
}

class DeMaterializeSubscriber<T extends Notification<U>, U> extends Subscriber<T> {
  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  protected _next(value: T) {
    value.observe(this.destination);
  }
}
