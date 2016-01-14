import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export interface exhaust<T> {
  (): Observable<T>;
}

/**
 * Returns an Observable that takes a source of observables and propagates the first observable exclusively
 * until it completes before subscribing to the next.
 * Items that come in before the first has exhausted will be dropped.
 * Similar to `concatAll`, but will not hold on to items that come in before the first is exhausted.
 * @returns {Observable} an Observable which contains all of the items of the first Observable and following Observables in the source.
 */
export function exhaust<T>(): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new SwitchFirstOperator<T>());
}

class SwitchFirstOperator<T> implements Operator<T, T> {
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SwitchFirstSubscriber(subscriber);
  }
}

class SwitchFirstSubscriber<T> extends OuterSubscriber<T, T> {
  private hasCompleted: boolean = false;
  private hasSubscription: boolean = false;

  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  protected _next(value: T): void {
    if (!this.hasSubscription) {
      this.hasSubscription = true;
      this.add(subscribeToResult(this, value));
    }
  }

  protected _complete(): void {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
  }

  notifyComplete(innerSub: Subscription): void {
    this.remove(innerSub);
    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  }
}
