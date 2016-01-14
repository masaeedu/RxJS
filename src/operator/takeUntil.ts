import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export interface takeUntil<T> {
  (notifier: Observable<any>): Observable<T>;
}

export function takeUntil<T>(notifier: Observable<any>): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new TakeUntilOperator<T>(notifier));
}

class TakeUntilOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeUntilSubscriber<T, T>(subscriber, this.notifier);
  }
}

class TakeUntilSubscriber<T, R> extends OuterSubscriber<T, R> {

  constructor(destination: Subscriber<any>,
              private notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.complete();
  }

  notifyComplete(): void {
    // noop
  }
}
