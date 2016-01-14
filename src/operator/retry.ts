import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

export interface retry<T> {
  (count?: number): Observable<T>;
}

export function retry<T>(count: number = -1): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new RetryOperator(count, _this));
}

class RetryOperator<T> implements Operator<T, T> {
  constructor(private count: number,
              private source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new RetrySubscriber(subscriber, this.count, this.source);
  }
}

class RetrySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>,
              private count: number,
              private source: Observable<T>) {
    super(destination);
  }
  error(err: any) {
    if (!this.isStopped) {
      const { source, count } = this;
      if (count === 0) {
        return super.error(err);
      } else if (count > -1) {
        this.count = count - 1;
      }
      this.unsubscribe();
      this.isStopped = false;
      this.isUnsubscribed = false;
      source.subscribe(this);
    }
  }
}
