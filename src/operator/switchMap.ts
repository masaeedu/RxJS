import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export type Projection<T, R> = (value: T, index: number) => Observable<R>;
export type ResultSelector<T, R, R2> = (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2;

export interface switchMap<T> {
  <R>(project: Projection<T, R>): Observable<R>;
  <R, R2>(project: Projection<T, R>, resultSelector: ResultSelector<T, R, R2>): Observable<R2>;
}

export function switchMap<T, R, R2>(project: Projection<T, R>, resultSelector?: ResultSelector<T, R, R2>): Observable<R> | Observable<R2> {
  let _this: Observable<T> = this;
  // TODO: The way this is implemented is not type safe. Need to fix implementation
  return <any>_this.lift(new SwitchMapOperator(project, resultSelector));
}

class SwitchMapOperator<T, R, R2> implements Operator<T, R | R2> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R | R2>): Subscriber<T> {
    return new SwitchMapSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchMapSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
  private index: number = 0;
  private innerSubscription: Subscription;

  constructor(destination: Subscriber<R>,
              private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2) {
    super(destination);
  }

  protected _next(value: T): void {
    const index = this.index++;
    const destination = this.destination;
    let result = tryCatch(this.project)(value, index);
    if (result === errorObject) {
      destination.error(errorObject.e);
    } else {
      const innerSubscription = this.innerSubscription;
      if (innerSubscription) {
        innerSubscription.unsubscribe();
      }
      this.add(this.innerSubscription = subscribeToResult(this, result, value, index));
    }
  }

  protected _complete(): void {
    const {innerSubscription} = this;
    if (!innerSubscription || innerSubscription.isUnsubscribed) {
      super._complete();
    }
  }

  _unsubscribe() {
    this.innerSubscription = null;
  }

  notifyComplete(innerSub: Subscription): void {
    this.remove(innerSub);
    this.innerSubscription = null;
    if (this.isStopped) {
      super._complete();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    const { resultSelector, destination } = this;
    if (resultSelector) {
      const result = tryCatch(resultSelector)(outerValue, innerValue, outerIndex, innerIndex);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(innerValue);
    }
  }
}
