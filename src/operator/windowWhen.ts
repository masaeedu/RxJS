import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export interface windowWhen<T> {
  (closingSelector: () => Observable<any>): Observable<Observable<T>>;
}

export function windowWhen<T>(closingSelector: () => Observable<any>): Observable<Observable<T>> {
  let _this: Observable<T> = this;
  return _this.lift(new WindowOperator<T>(closingSelector));
}

class WindowOperator<T> implements Operator<T, Observable<T>> {

  constructor(private closingSelector: () => Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>): Subscriber<T> {
    return new WindowSubscriber(subscriber, this.closingSelector);
  }
}

class WindowSubscriber<T> extends Subscriber<T> {
  private window: Subject<T>;
  private closingNotification: Subscription;

  constructor(protected destination: Subscriber<Observable<T>>,
              private closingSelector: () => Observable<any>) {
    super(destination);
    this.openWindow();
  }

  protected _next(value: T) {
    this.window.next(value);
  }

  protected _error(err: any) {
    this.window.error(err);
    this.destination.error(err);
    this._unsubscribeClosingNotification();
  }

  protected _complete() {
    this.window.complete();
    this.destination.complete();
    this._unsubscribeClosingNotification();
  }

  unsubscribe() {
    super.unsubscribe();
    this._unsubscribeClosingNotification();
  }

  _unsubscribeClosingNotification() {
    let closingNotification = this.closingNotification;
    if (closingNotification) {
      closingNotification.unsubscribe();
    }
  }

  openWindow() {
    const prevClosingNotification = this.closingNotification;
    if (prevClosingNotification) {
      this.remove(prevClosingNotification);
      prevClosingNotification.unsubscribe();
    }

    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }

    const window = this.window = new Subject<T>();
    this.destination.next(window);

    const closingNotifier = tryCatch(this.closingSelector)();
    if (closingNotifier === errorObject) {
      const err = errorObject.e;
      this.destination.error(err);
      this.window.error(err);
    } else {
      const closingNotification = this.closingNotification = new Subscription();
      closingNotification.add(closingNotifier.subscribe(new WindowClosingNotifierSubscriber(this)));
      this.add(closingNotification);
      this.add(window);
    }
  }
}

class WindowClosingNotifierSubscriber extends Subscriber<any> {
  constructor(private parent: WindowSubscriber<any>) {
    super();
  }

  protected _next() {
    this.parent.openWindow();
  }

  protected _error(err: any) {
    this.parent.error(err);
  }

  protected _complete() {
    this.parent.openWindow();
  }
}
