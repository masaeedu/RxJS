import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {asap} from '../scheduler/asap';
import {Subscription} from '../Subscription';
import {Observable} from '../Observable';
import {isDate} from '../util/isDate';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export interface timeoutWith<T> {
  <R>(due: number | Date, withObservable?: Observable<R>, scheduler?: Scheduler): Observable<T | R>;
}

export function timeoutWith<T, R>(due: number | Date,
                                  withObservable: Observable<R>,
                                  scheduler: Scheduler = asap): Observable<T | R> {
  let _this: Observable<T> = this;
  let absoluteTimeout = isDate(due);
  let waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(<number>due);
  return _this.lift(new TimeoutWithOperator<T, R>(waitFor, absoluteTimeout, withObservable, scheduler));
}

class TimeoutWithOperator<T, R> implements Operator<T, T | R> {
  constructor(private waitFor: number,
              private absoluteTimeout: boolean,
              private withObservable: Observable<any>,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T | R>): Subscriber<T> {
    return new TimeoutWithSubscriber<T, T | R>(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler);
  }
}

class TimeoutWithSubscriber<T, R> extends OuterSubscriber<T, T | R> {
  private timeoutSubscription: Subscription = undefined;
  private index: number = 0;
  private _previousIndex: number = 0;
  get previousIndex(): number {
    return this._previousIndex;
  }
  private _hasCompleted: boolean = false;
  get hasCompleted(): boolean {
    return this._hasCompleted;
  }

  constructor(public destination: Subscriber<T | R>,
              private absoluteTimeout: boolean,
              private waitFor: number,
              private withObservable: Observable<any>,
              private scheduler: Scheduler) {
    super();
    destination.add(this);
    this.scheduleTimeout();
  }

  private static dispatchTimeout(state: any): void {
    const source = state.subscriber;
    const currentIndex = state.index;
    if (!source.hasCompleted && source.previousIndex === currentIndex) {
      source.handleTimeout();
    }
  }

  private scheduleTimeout(): void {
    let currentIndex = this.index;
    const timeoutState = { subscriber: this, index: currentIndex };
    this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, timeoutState);
    this.index++;
    this._previousIndex = currentIndex;
  }

  protected _next(value: T) {
    this.destination.next(value);
    if (!this.absoluteTimeout) {
      this.scheduleTimeout();
    }
  }

  protected _error(err: any) {
    this.destination.error(err);
    this._hasCompleted = true;
  }

  protected _complete() {
    this.destination.complete();
    this._hasCompleted = true;
  }

  handleTimeout(): void {
    if (!this.isUnsubscribed) {
      const withObservable = this.withObservable;
      this.unsubscribe();
      this.destination.add(this.timeoutSubscription = subscribeToResult(this, withObservable));
    }
  }
}
