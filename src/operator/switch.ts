import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export interface _switch<T extends Observable<U>, U> {
  (): Observable<U>;
}

export function _switch<T extends Observable<U>, U>(): Observable<U> {
  let _this: Observable<Observable<U>> = this;
  return _this.lift(new SwitchOperator<U>());
}

class SwitchOperator<T> implements Operator<Observable<T>, T> {
  call(subscriber: Subscriber<T>): Subscriber<Observable<T>> {
    return new SwitchSubscriber<Observable<T>, T>(subscriber);
  }
}

class SwitchSubscriber<T, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private hasCompleted: boolean = false;
  innerSubscription: Subscription;

  constructor(destination: Subscriber<R>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.unsubscribeInner();
    this.active++;
    this.add(this.innerSubscription = subscribeToResult(this, value));
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (this.active === 0) {
      this.destination.complete();
    }
  }

  private unsubscribeInner(): void {
    this.active = this.active > 0 ? this.active - 1 : 0;
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
      this.remove(innerSubscription);
    }
  }

  notifyNext(outerValue: T, innerValue: any): void {
    this.destination.next(innerValue);
  }

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(): void {
    this.unsubscribeInner();
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}
