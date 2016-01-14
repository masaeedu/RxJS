import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';
import {Observable} from '../Observable';

export interface elementAt<T> {
  (index: number, defaultValue?: T): Observable<T>
}

/**
 * Returns an Observable that emits the item at the specified index in the source Observable.
 * If default is given, missing indices will output this value on next; otherwise, outputs error.
 * @param {number} index the index of the value to be retrieved.
 * @param {any} [defaultValue] the default value returned for missing indices.
 * @returns {Observable} an Observable that emits a single item, if it is found. Otherwise, will emit the default value if given.
 */
export function elementAt<T>(index: number, defaultValue?: T): Observable<T> {
  let _this: Observable<T> = this;
  return _this.lift(new ElementAtOperator(index, defaultValue));
}

class ElementAtOperator<T> implements Operator<T, T> {

  constructor(private index: number, private defaultValue?: T) {
    if (index < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ElementAtSubscriber(subscriber, this.index, this.defaultValue);
  }
}

class ElementAtSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>, private index: number, private defaultValue?: T) {
    super(destination);
  }

  protected _next(x: T) {
    if (this.index-- === 0) {
      this.destination.next(x);
      this.destination.complete();
    }
  }

  protected _complete() {
    const destination = this.destination;
    if (this.index >= 0) {
      if (typeof this.defaultValue !== 'undefined') {
        destination.next(this.defaultValue);
      } else {
        destination.error(new ArgumentOutOfRangeError);
      }
    }
    destination.complete();
  }
}
