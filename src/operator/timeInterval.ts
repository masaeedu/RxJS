import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {asap} from '../scheduler/asap';

export interface timeInterval<T> {
  (scheduler?: Scheduler): Observable<TimeInterval<T>>;
}

export function timeInterval<T>(scheduler: Scheduler = asap): Observable<TimeInterval<T>> {
  let _this: Observable<T> = this;
  return _this.lift(new TimeIntervalOperator<T>(scheduler));
}

export class TimeInterval<T> {
  constructor(public value: T, public interval: number) {

  }
};

class TimeIntervalOperator<T> implements Operator<T, TimeInterval<T>> {
  constructor(private scheduler: Scheduler) {

  }

  call(observer: Subscriber<TimeInterval<T>>): Subscriber<T> {
    return new TimeIntervalSubscriber(observer, this.scheduler);
  }
}

class TimeIntervalSubscriber<T> extends Subscriber<T> {
  private lastTime: number = 0;

  constructor(destination: Subscriber<TimeInterval<T>>, private scheduler: Scheduler) {
    super(destination);

    this.lastTime = scheduler.now();
  }

  protected _next(value: T) {
    let now = this.scheduler.now();
    let span = now - this.lastTime;
    this.lastTime = now;

    this.destination.next(new TimeInterval(value, span));
  }
}
