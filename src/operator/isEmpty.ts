import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

export interface isEmpty<T> {
  (): Observable<boolean>;
}

export function isEmpty<T>(): Observable<boolean> {
  let _this: Observable<T> = this;
  return _this.lift(new IsEmptyOperator<T>());
}

class IsEmptyOperator<T> implements Operator<T, boolean> {
  call (observer: Subscriber<boolean>): Subscriber<T> {
    return new IsEmptySubscriber<T>(observer);
  }
}

class IsEmptySubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  private notifyComplete(isEmpty: boolean): void {
    const destination = this.destination;

    destination.next(isEmpty);
    destination.complete();
  }

  protected _next(value: T) {
    this.notifyComplete(false);
  }

  protected _complete() {
    this.notifyComplete(true);
  }
}
