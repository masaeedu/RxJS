import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observer} from '../Observer';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {EmptyError} from '../util/EmptyError';

export interface single<T> {
  (): Observable<T>;
  (predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<T>;
}

export function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new SingleOperator(predicate, _this));
}

class SingleOperator<T> implements Operator<T, T> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SingleSubscriber(subscriber, this.predicate, this.source);
  }
}

class SingleSubscriber<T> extends Subscriber<T> {
  private seenValue: boolean = false;
  private singleValue: T;
  private index: number = 0;

  constructor(destination: Observer<T>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
    super(destination);
  }

  private applySingleValue(value: T): void {
    if (this.seenValue) {
      this.destination.error('Sequence contains more than one element');
    } else {
      this.seenValue = true;
      this.singleValue = value;
    }
  }

  protected _next(value: T): void {
    const predicate = this.predicate;
    const currentIndex = this.index++;

    if (predicate) {
      let result = tryCatch(predicate)(value, currentIndex, this.source);
      if (result === errorObject) {
        this.destination.error(errorObject.e);
      } else if (result) {
        this.applySingleValue(value);
      }
    } else {
      this.applySingleValue(value);
    }
  }

  protected _complete(): void {
    const destination = this.destination;

    if (this.index > 0) {
      destination.next(this.seenValue ? this.singleValue : undefined);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}
