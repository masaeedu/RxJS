import {Observable} from '../Observable';
import {root} from '../util/root';

export interface toPromise<T> {
  (PromiseCtor?: PromiseConstructor): Promise<T>;
}

export function toPromise<T>(PromiseCtor?: PromiseConstructor): Promise<T> {
  let _this: Observable<T> = this;
  if (!PromiseCtor) {
    if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
      PromiseCtor = root.Rx.config.Promise;
    } else if (root.Promise) {
      PromiseCtor = root.Promise;
    }
  }

  if (!PromiseCtor) {
    throw new Error('no Promise impl found');
  }

  return new PromiseCtor((resolve, reject) => {
    let value: any;
    _this.subscribe(x => value = x, err => reject(err), () => resolve(value));
  });
}
