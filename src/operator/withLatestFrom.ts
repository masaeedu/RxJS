import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';
import {isFunction} from '../util/isFunction';

export type Projection<U, R> = (...values: U[]) => R;

export interface withLatestFrom<T> {
  <U>(...args: Observable<U>[]): Observable<U[]>;
  <U, R>(...args: (Observable<U> | Projection<U, R>)[]): Observable<R>;
}

/**
 * @param {Observable} observables the observables to get the latest values from.
 * @param {Function} [project] optional projection function for merging values together. Receives all values in order
 *  of observables passed. (e.g. `a.withLatestFrom(b, c, (a1, b1, c1) => a1 + b1 + c1)`). If this is not passed, arrays
 *  will be returned.
 * @description merges each value from an observable with the latest values from the other passed observables.
 * All observables must emit at least one value before the resulting observable will emit
 *
 * #### example
 * ```
 * A.withLatestFrom(B, C)
 *
 *  A:     ----a-----------------b---------------c-----------|
 *  B:     ---d----------------e--------------f---------|
 *  C:     --x----------------y-------------z-------------|
 * result: ---([a,d,x])---------([b,e,y])--------([c,f,z])---|
 * ```
 */
export function withLatestFrom<T, U, R>(...args: (Observable<U> | Projection<T | U, R>)[]): Observable<(T | U)[]> | Observable<R> {
  let _this: Observable<T> = this;
  
  let project: Projection<T | U, R>;
  let observables: Observable<U>[];
  
  let last = args.pop();
  observables = <Observable<U>[]>args;
  if (isFunction(last)) {
    project = last;
  } else {
    observables.push(last);
  }
  // TODO: The way this is implemented is not type safe. Need to fix implementation
  return <any>_this.lift(new WithLatestFromOperator<T, U, R>(observables, project));
}

class WithLatestFromOperator<T, U, R> implements Operator<T, (T | U)[] | R> {
  constructor(private observables: Observable<U>[],
              private project?: Projection<T | U, R>) {
  }

  call(subscriber: Subscriber<(T | U)[] | R>): Subscriber<T> {
    return new WithLatestFromSubscriber<T, U, R>(subscriber, this.observables, this.project);
  }
}

class WithLatestFromSubscriber<T, U, R> extends OuterSubscriber<T, R> {
  private values: any[];
  private toRespond: number[] = [];

  constructor(destination: Subscriber<(T | U)[] | R>,
              private observables: Observable<U>[],
              private project?: Projection<T | U, R>) {
    super(destination);
    const len = observables.length;
    this.values = new Array(len);

    for (let i = 0; i < len; i++) {
      this.toRespond.push(i);
    }

    for (let i = 0; i < len; i++) {
      let observable = observables[i];
      this.add(subscribeToResult<T, R>(this, observable, <any>observable, i));
    }
  }

  notifyNext(observable: any, value: any, observableIndex: number, index: number) {
    this.values[observableIndex] = value;
    const toRespond = this.toRespond;
    if (toRespond.length > 0) {
      const found = toRespond.indexOf(observableIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }
  }

  notifyComplete() {
    // noop
  }

  protected _next(value: T) {
    if (this.toRespond.length === 0) {
      const values = this.values;
      const destination = this.destination;
      const project = this.project;
      const args = [value, ...values];
      if (project) {
        let result = tryCatch(this.project).apply(this, args);
        if (result === errorObject) {
          destination.error(result.e);
        } else {
          destination.next(result);
        }
      } else {
        destination.next(args);
      }
    }
  }
}
