import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export interface sample<T> {
  (notifier: Observable<any>): Observable<T>;
}

export function sample<T>(notifier: Observable<any>): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new SampleOperator<T>(notifier));
}

class SampleOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SampleSubscriber<T>(subscriber, this.notifier);
  }
}

class SampleSubscriber<T> extends OuterSubscriber<T, T> {
  private value: T;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<any>, notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  protected _next(value: T) {
    this.value = value;
    this.hasValue = true;
  }

  notifyNext(outerValue: T, innerValue: T, outerIndex: number, innerIndex: number): void {
    this.emitValue();
  }

  notifyComplete(): void {
    this.emitValue();
  }

  emitValue() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.value);
    }
  }
}
