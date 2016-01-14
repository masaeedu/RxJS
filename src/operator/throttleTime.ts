import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {asap} from '../scheduler/asap';
import {Observable} from '../Observable';

export interface throttleTime<T> {
  (delay: number, scheduler?: Scheduler): Observable<T>;
}

export function throttleTime<T>(delay: number, scheduler: Scheduler = asap): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new ThrottleTimeOperator<T>(delay, scheduler));
}

class ThrottleTimeOperator<T> implements Operator<T, T> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ThrottleTimeSubscriber(subscriber, this.delay, this.scheduler);
  }
}

class ThrottleTimeSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  protected _next(value: T) {
    if (!this.throttled) {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, { subscriber: this }));
      this.destination.next(value);
    }
  }

  clearThrottle() {
    const throttled = this.throttled;
    if (throttled) {
      throttled.unsubscribe();
      this.remove(throttled);
      this.throttled = null;
    }
  }
}

function dispatchNext<T>({ subscriber }) {
  subscriber.clearThrottle();
}
