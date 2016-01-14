import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export interface takeWhile<T> {
  (predicate: (value: T, index: number) => boolean): Observable<T>;
}

export function takeWhile<T>(predicate: (value: T, index: number) => boolean): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new TakeWhileOperator(predicate));
}

class TakeWhileOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeWhileSubscriber(subscriber, this.predicate);
  }
}

class TakeWhileSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number) => boolean) {
    super(destination);
  }

  protected _next(value: T): void {
    const destination = this.destination;
    const result = tryCatch(this.predicate)(value, this.index++);

    if (result == errorObject) {
      destination.error(errorObject.e);
    } else if (Boolean(result)) {
      destination.next(value);
    } else {
      destination.complete();
    }
  }
}
