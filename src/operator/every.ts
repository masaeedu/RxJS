import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Observable} from '../Observable';
import {ScalarObservable} from '../observable/ScalarObservable';
import {ArrayObservable} from '../observable/fromArray';
import {ErrorObservable} from '../observable/throw';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export type Predicate<T> = (value: T, index: number, source: Observable<T>) => boolean;

export interface every<T> {
  (predicate: Predicate<T>, thisArg?: any): Observable<boolean>
}

/**
 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
 * @param {function} predicate a function for determining if an item meets a specified condition.
 * @param {any} [thisArg] optional object to use for `this` in the callback
 * @returns {Observable} an Observable of booleans that determines if all items of the source Observable meet the condition specified.
 */
export function every<T>(predicate: Predicate<T>, thisArg?: any): Observable<boolean> {
  let _this: Observable<T> = this;
  if (_this._isScalar) {
    let scalar: ScalarObservable<T> = <any>_this;
    const result: boolean = tryCatch(predicate).call(thisArg || _this, scalar.value, 0, _this);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e, scalar.scheduler);
    } else {
      return new ScalarObservable(result, scalar.scheduler);
    }
  }

  if (_this instanceof ArrayObservable) {
    const array = (<ArrayObservable<T>>_this).array;
    const result = tryCatch((array: T[], predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg: any) =>
                                    array.every(<any>predicate, thisArg))(array, predicate, thisArg);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e, _this.scheduler);
    } else {
      return new ScalarObservable(result, _this.scheduler);
    }
  }
  return _this.lift(new EveryOperator(predicate, thisArg, _this));
}

class EveryOperator<T> implements Operator<T, boolean> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<boolean>): Subscriber<T> {
    return new EverySubscriber(observer, this.predicate, this.thisArg, this.source);
  }
}

class EverySubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Observer<R>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg: any,
              private source?: Observable<T>) {
    super(destination);
  }

  private notifyComplete(everyValueMatch: boolean): void {
    this.destination.next(everyValueMatch);
    this.destination.complete();
  }

  protected _next(value: T): void {
    const result = tryCatch(this.predicate).call(this.thisArg || this, value, this.index++, this.source);

    if (result === errorObject) {
      this.destination.error(result.e);
    } else if (!result) {
      this.notifyComplete(false);
    }
  }

  protected _complete(): void {
    this.notifyComplete(true);
  }
}
