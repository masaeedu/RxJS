import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {ConnectableObservable} from '../observable/ConnectableObservable';

export interface multicast<T> {
  (subject: Subject<T>): ConnectableObservable<T>;
  (factory: () => Subject<T>): ConnectableObservable<T>;
}

export function multicast<T>(subjectOrSubjectFactory: Subject<T> | (() => Subject<T>)): ConnectableObservable<T> {
  let _this: Observable<T> = this;
  let subjectFactory: () => Subject<T>;
  if (typeof subjectOrSubjectFactory === 'function') {
    subjectFactory = <() => Subject<T>>subjectOrSubjectFactory;
  } else {
    subjectFactory = function subjectFactory() {
      return <Subject<T>>subjectOrSubjectFactory;
    };
  }
  return new ConnectableObservable(_this, subjectFactory);
}
