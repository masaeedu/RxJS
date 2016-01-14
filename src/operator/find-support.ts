import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export class FindValueOperator<T> implements Operator<T, T | number> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
  }

  call(observer: Subscriber<T | number>): Subscriber<T> {
    return new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg);
  }
}

export class FindValueSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T | number>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
    super(destination);
  }

  private notifyComplete(value: any): void {
    const destination = this.destination;

    destination.next(value);
    destination.complete();
  }

  protected _next(value: T): void {
    const { predicate, thisArg } = this;
    const index = this.index++;
    const result = tryCatch(predicate).call(thisArg || this, value, index, this.source);
    if (result === errorObject) {
      this.destination.error(result.e);
    } else if (result) {
      this.notifyComplete(this.yieldIndex ? index : value);
    }
  }

  protected _complete(): void {
    this.notifyComplete(this.yieldIndex ? -1 : undefined);
  }
}