import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

export interface defaultIfEmpty<T> {
  <R>(defaultValue: R): Observable<T | R>
}

/**
 * Returns an Observable that emits the elements of the source or a specified default value if empty.
 * @param {any} defaultValue the default value used if source is empty; defaults to null.
 * @returns {Observable} an Observable of the items emitted by the where empty values are replaced by the specified default value or null.
 */
export function defaultIfEmpty<T, R>(defaultValue: R = null): Observable<T | R> {
  let _this: Observable<T> = this;
  return _this.lift(new DefaultIfEmptyOperator<T, R>(defaultValue));
}

class DefaultIfEmptyOperator<T, R> implements Operator<T, T | R> {

  constructor(private defaultValue: R) {
  }

  call(subscriber: Subscriber<T | R>): Subscriber<T> {
    return new DefaultIfEmptySubscriber<T, T | R>(subscriber, this.defaultValue);
  }
}

class DefaultIfEmptySubscriber<T, R> extends Subscriber<T> {
  private isEmpty: boolean = true;

  constructor(destination: Subscriber<T | R>, private defaultValue: R) {
    super(destination);
  }

  protected _next(value: T): void {
    this.isEmpty = false;
    this.destination.next(value);
  }

  protected _complete(): void {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  }
}
