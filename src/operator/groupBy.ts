import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {Map} from '../util/Map';
import {FastMap} from '../util/FastMap';
import {RefCountSubscription, GroupedObservable} from './groupBy-support';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export type Projection<T, U> = (value: T) => U;
export type DurationSelector<K, R> = Projection<GroupedObservable<K, R>, Observable<any>>;

export interface groupBy<T> {
  <K>(keySelector: Projection<T, K>): Observable<GroupedObservable<K, T>>;
  <K>(keySelector: Projection<T, K>, durationSelector: DurationSelector<K, T>): Observable<GroupedObservable<K, T>>;
  <K, R>(keySelector: Projection<T, K>, elementSelector: Projection<T, R>): Observable<GroupedObservable<K, R>>;
  <K, R>(keySelector: Projection<T, K>, elementSelector: Projection<T, R>, durationSelector: DurationSelector<K, R>): Observable<GroupedObservable<K, R>>;
}

export function groupBy<T, K, R>(keySelector: (value: T) => K,
                                 elementSelector?: (value: T) => R,
                                 durationSelector?: (grouped: GroupedObservable<K, T | R>) => Observable<any>): GroupByObservable<T, K, R> {
  let _this: Observable<T> = this;
  return new GroupByObservable(_this, keySelector, elementSelector, durationSelector);
}

export class GroupByObservable<T, K, R> extends Observable<GroupedObservable<K, T | R>> {
  constructor(public source: Observable<T>,
              private keySelector: (value: T) => K,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<K, T | R>) => Observable<any>) {
    super();
  }

  _subscribe(subscriber: Subscriber<any>): Subscription {
    const refCountSubscription = new RefCountSubscription();
    const groupBySubscriber = new GroupBySubscriber(
      subscriber, refCountSubscription, this.keySelector, this.elementSelector, this.durationSelector
    );
    refCountSubscription.setPrimary(this.source.subscribe(groupBySubscriber));
    return refCountSubscription;
  }
}

class GroupBySubscriber<T, K, R> extends Subscriber<T> {
  private groups: Map<K, Subject<T|R>> = null;

  constructor(destination: Subscriber<R>,
              private refCountSubscription: RefCountSubscription,
              private keySelector: (value: T) => K,
              private elementSelector?: (value: T) => R,
              private durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>) {
    super();
    this.destination = destination;
    this.add(destination);
  }

  protected _next(x: T): void {
    let key = tryCatch(this.keySelector)(x);
    if (key === errorObject) {
      this.error(errorObject.e);
    } else {
      let groups = this.groups;
      const elementSelector = this.elementSelector;
      const durationSelector = this.durationSelector;

      if (!groups) {
        groups = this.groups = typeof key === 'string' ? new FastMap() : new Map();
      }

      let group = groups.get(key);

      if (!group) {
        groups.set(key, group = new Subject<T|R>());
        let groupedObservable = new GroupedObservable(key, group, this.refCountSubscription);

        if (durationSelector) {
          let duration = tryCatch(durationSelector)(new GroupedObservable<K, R>(key, <any>group));
          if (duration === errorObject) {
            this.error(errorObject.e);
          } else {
            this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
          }
        }

        this.destination.next(groupedObservable);
      }

      if (elementSelector) {
        let value = tryCatch(elementSelector)(x);
        if (value === errorObject) {
          this.error(errorObject.e);
        } else {
          group.next(value);
        }
      } else {
        group.next(x);
      }
    }
  }

  protected _error(err: any): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.error(err);
        this.removeGroup(key);
      });
    }
    this.destination.error(err);
  }

  protected _complete(): void {
    const groups = this.groups;
    if (groups) {
      groups.forEach((group, key) => {
        group.complete();
        this.removeGroup(key);
      });
    }
    this.destination.complete();
  }

  removeGroup(key: K): void {
    this.groups.delete(key);
  }
}

class GroupDurationSubscriber<K, T> extends Subscriber<T> {
  constructor(private key: K,
              private group: Subject<T>,
              private parent: GroupBySubscriber<any, K, T>) {
    super();
  }

  protected _next(value: T): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }

  protected _error(err: any): void {
    this.group.error(err);
    this.parent.removeGroup(this.key);
  }

  protected _complete(): void {
    this.group.complete();
    this.parent.removeGroup(this.key);
  }
}
