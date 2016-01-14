import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export class MergeAllOperator<T> implements Operator<Observable<T>, T> {
  constructor(private concurrent: number) {
  }

  call(observer: Subscriber<T>): Subscriber<Observable<T>> {
    return new MergeAllSubscriber<T>(observer, this.concurrent);
  }
}

export class MergeAllSubscriber<T> extends OuterSubscriber<Observable<T>, T> {
  private hasCompleted: boolean = false;
  private buffer: Observable<T>[] = [];
  private active: number = 0;

  constructor(destination: Subscriber<T>, private concurrent: number) {
    super(destination);
  }

  protected _next(observable: Observable<T>) {
    if (this.active < this.concurrent) {
      if (observable._isScalar) {
        this.destination.next((<any>observable).value);
      } else {
        this.active++;
        this.add(subscribeToResult<Observable<T>, T>(this, observable));
      }
    } else {
      this.buffer.push(observable);
    }
  }

  protected _complete() {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
  }

  notifyComplete(innerSub: Subscription) {
    const buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  }
}