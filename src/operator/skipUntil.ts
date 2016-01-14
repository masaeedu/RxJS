import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export interface skipUntil<T> {
  (notifier: Observable<any>): Observable<T>;
}

export function skipUntil<T>(notifier: Observable<any>): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new SkipUntilOperator<T>(notifier));
}

class SkipUntilOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SkipUntilSubscriber<T>(subscriber, this.notifier);
  }
}

class SkipUntilSubscriber<T> extends OuterSubscriber<T, T> {

  private hasValue: boolean = false;
  private isInnerStopped: boolean = false;

  constructor(destination: Subscriber<any>,
              notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  protected _next(value: T) {
    if (this.hasValue) {
      super._next(value);
    }
  }

  protected _complete() {
    if (this.isInnerStopped) {
      super._complete();
    } else {
      this.unsubscribe();
    }
  }

  notifyNext(): void {
    this.hasValue = true;
  }

  notifyComplete(): void {
    this.isInnerStopped = true;
    if (this.isStopped) {
      super._complete();
    }
  }
}
