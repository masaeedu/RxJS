import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export interface skipWhile<T> {
  (predicate: (value: T, index: number) => boolean): Observable<T>;
}

export function skipWhile<T>(predicate: (value: T, index: number) => boolean): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new SkipWhileOperator(predicate));
}

class SkipWhileOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number) => boolean) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SkipWhileSubscriber(subscriber, this.predicate);
  }
}

class SkipWhileSubscriber<T> extends Subscriber<T> {
  private skipping: boolean = true;
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number) => boolean) {
    super(destination);
  }

  protected _next(value: T): void {
    const destination = this.destination;
    if (this.skipping === true) {
      const index = this.index++;
      const result = tryCatch(this.predicate)(value, index);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else {
        this.skipping = Boolean(result);
      }
    }
    if (this.skipping === false) {
      destination.next(value);
    }
  }
}
