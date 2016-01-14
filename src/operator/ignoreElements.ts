import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

export interface ignoreElements<T> {
  (): Observable<T>;
}

export function ignoreElements<T>(): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new IgnoreElementsOperator<T>());
}

class IgnoreElementsOperator<T> implements Operator<T, T> {
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new IgnoreElementsSubscriber<T>(subscriber);
  }
}

class IgnoreElementsSubscriber<T> extends Subscriber<T> {
  protected _next(unused: T): void {
    noop();
  }
}
