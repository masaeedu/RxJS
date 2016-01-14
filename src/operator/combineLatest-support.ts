import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export class CombineLatestOperator<T extends Observable<U>, U, R> implements Operator<T, U[] | R> {
  constructor(private project?: (...values: U[]) => R) {
  }

  call(subscriber: Subscriber<U[] | R>): Subscriber<T> {
    return new CombineLatestSubscriber<T, U, R>(subscriber, this.project);
  }
}

export class CombineLatestSubscriber<T extends Observable<U>, U, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private values: any[] = [];
  private observables: any[] = [];
  private toRespond: number[] = [];

  constructor(destination: Subscriber<U[] | R>, private project?: (...values: U[]) => R) {
    super(destination);
  }

  protected _next(observable: T) {
    const toRespond = this.toRespond;
    toRespond.push(toRespond.length);
    this.observables.push(observable);
  }

  protected _complete() {
    const observables = this.observables;
    const len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      this.active = len;
      for (let i = 0; i < len; i++) {
        const observable = observables[i];
        this.add(subscribeToResult(this, observable, observable, i));
      }
    }
  }

  notifyComplete(unused: Subscriber<R>): void {
    if ((this.active -= 1) === 0) {
      this.destination.complete();
    }
  }

  notifyNext(observable: any, value: R, outerIndex: number, innerIndex: number) {
    const values = this.values;
    values[outerIndex] = value;
    const toRespond = this.toRespond;

    if (toRespond.length > 0) {
      const found = toRespond.indexOf(outerIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }

    if (toRespond.length === 0) {
      const project = this.project;
      const destination = this.destination;

      if (project) {
        const result = tryCatch(project).apply(this, values);
        if (result === errorObject) {
          destination.error(errorObject.e);
        } else {
          destination.next(result);
        }
      } else {
        destination.next(values);
      }
    }
  }
}
