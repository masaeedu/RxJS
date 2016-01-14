import {Observer} from './Observer';
import {Operator} from './Operator';
import {Scheduler} from './Scheduler';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {root} from './util/root';
import {CoreOperators} from './CoreOperators';
import {SymbolShim} from './util/SymbolShim';
import {GroupedObservable} from './operator/groupBy-support';
import {ConnectableObservable} from './observable/ConnectableObservable';
import {Subject} from './Subject';
import {Notification} from './Notification';
import {toSubscriber} from './util/toSubscriber';
import {tryCatch} from './util/tryCatch';
import {errorObject} from './util/errorObject';

import {combineLatest as combineLatestStatic} from './operator/combineLatest-static';
import {concat as concatStatic} from './operator/concat-static';
import {merge as mergeStatic} from './operator/merge-static';
import {zip as zipStatic} from './operator/zip-static';
import {BoundCallbackObservable} from './observable/bindCallback';
import {BoundNodeCallbackObservable} from './observable/bindNodeCallback';
import {DeferObservable} from './observable/defer';
import {EmptyObservable} from './observable/empty';
import {ForkJoinObservable} from './observable/forkJoin';
import {FromObservable} from './observable/from';
import {ArrayObservable} from './observable/fromArray';
import {FromEventObservable} from './observable/fromEvent';
import {FromEventPatternObservable} from './observable/fromEventPattern';
import {PromiseObservable} from './observable/fromPromise';
import {IntervalObservable} from './observable/interval';
import {TimerObservable} from './observable/timer';
import {race as raceStatic} from './operator/race-static';
import {RangeObservable} from './observable/range';
import {InfiniteObservable} from './observable/never';
import {ErrorObservable} from './observable/throw';
import {AjaxCreationMethod} from './observable/dom/ajax';
import {WebSocketSubject} from './observable/dom/webSocket';

import {buffer} from './operator/buffer';
import {bufferCount} from './operator/bufferCount';
import {bufferTime} from './operator/bufferTime';
import {bufferToggle} from './operator/bufferToggle';
import {bufferWhen} from './operator/bufferWhen';
import {_catch} from './operator/catch';
import {combineAll} from './operator/combineAll';
import {combineLatest} from './operator/combineLatest';
import {concat} from './operator/concat';
import {concatAll} from './operator/concatAll';
import {concatMap} from './operator/concatMap';
import {concatMapTo} from './operator/concatMapTo';
import {count} from './operator/count';
import {dematerialize} from './operator/dematerialize';
import {debounce} from './operator/debounce';
import {debounceTime} from './operator/debounceTime';
import {defaultIfEmpty} from './operator/defaultIfEmpty';
import {delay} from './operator/delay';
import {distinctUntilChanged} from './operator/distinctUntilChanged';
import {_do} from './operator/do';
import {expand} from './operator/expand';
import {filter} from './operator/filter';
import {_finally} from './operator/finally';
import {first} from './operator/first';
import {groupBy} from './operator/groupBy';
import {ignoreElements} from './operator/ignoreElements';
import {last} from './operator/last';
import {letProto} from './operator/let';
import {every} from './operator/every';
import {map} from './operator/map';
import {mapTo} from './operator/mapTo';
import {materialize} from './operator/materialize';
import {merge} from './operator/merge';
import {mergeAll} from './operator/mergeAll';
import {mergeMap} from './operator/mergeMap';
import {mergeMapTo} from './operator/mergeMapTo';
import {multicast} from './operator/multicast';
import {observeOn} from './operator/observeOn';
import {partition} from './operator/partition';
import {pluck} from './operator/pluck';
import {publish} from './operator/publish';
import {publishBehavior} from './operator/publishBehavior';
import {publishReplay} from './operator/publishReplay';
import {publishLast} from './operator/publishLast';
import {race} from './operator/race';
import {reduce} from './operator/reduce';
import {repeat} from './operator/repeat';
import {retry} from './operator/retry';
import {retryWhen} from './operator/retryWhen';
import {sample} from './operator/sample';
import {sampleTime} from './operator/sampleTime';
import {scan} from './operator/scan';
import {share} from './operator/share';
import {single} from './operator/single';
import {skip} from './operator/skip';
import {skipUntil} from './operator/skipUntil';
import {skipWhile} from './operator/skipWhile';
import {startWith} from './operator/startWith';
import {subscribeOn} from './operator/subscribeOn';
import {_switch} from './operator/switch';
import {switchMap} from './operator/switchMap';
import {switchMapTo} from './operator/switchMapTo';
import {take} from './operator/take';
import {takeUntil} from './operator/takeUntil';
import {takeWhile} from './operator/takeWhile';
import {throttle} from './operator/throttle';
import {throttleTime} from './operator/throttleTime';
import {timeout} from './operator/timeout';
import {timeoutWith} from './operator/timeoutWith';
import {toArray} from './operator/toArray';
import {toPromise} from './operator/toPromise';
import {window} from './operator/window';
import {windowCount} from './operator/windowCount';
import {windowTime} from './operator/windowTime';
import {windowToggle} from './operator/windowToggle';
import {windowWhen} from './operator/windowWhen';
import {withLatestFrom} from './operator/withLatestFrom';
import {zipProto} from './operator/zip';
import {zipAll} from './operator/zipAll';

/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export class Observable<T> implements CoreOperators<T>  {

  public _isScalar: boolean = false;

  protected source: Observable<any>;
  protected operator: Operator<any, T>;

  /**
   * @constructor
   * @param {Function} subscribe the function that is
   * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
   * of a successful completion.
   */
  constructor(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription | Function | void) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: Since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static create signature
  /**
   * @static
   * @method create
   * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
   * @returns {Observable} a new cold observable
   * @description creates a new cold Observable by calling the Observable constructor
   */
  static create: Function = <T>(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription | Function | void) => {
    return new Observable<T>(subscribe);
  };

  /**
   * @method lift
   * @param {Operator} operator the operator defining the operation to take on the observable
   * @returns {Observable} a new observable with the Operator applied
   * @description creates a new Observable, with this Observable as the source, and the passed
   * operator defined as the new observable's operator.
   */
  lift<R>(operator: Operator<T, R>): Observable<R> {
    const observable = new Observable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  /**
   * @method subscribe
   * @param {Observer|Function} observerOrNext (optional) either an observer defining all functions to be called,
   *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
   * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
   *  the error will be thrown as unhandled
   * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
   * @returns {Subscription} a subscription reference to the registered handlers
   * @description registers handlers for handling emitted values, error and completions from the observable, and
   *  executes the observable's subscriber function, which will take action to set up the underlying data stream
   */
  subscribe(observerOrNext?: Observer<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): Subscription {

    const { operator } = this;
    const subscriber = toSubscriber(observerOrNext, error, complete);

    if (operator) {
      subscriber.add(this._subscribe(this.operator.call(subscriber)));
    } else {
      subscriber.add(this._subscribe(subscriber));
    }

    return subscriber;
  }

  /**
   * @method forEach
   * @param {Function} next a handler for each value emitted by the observable
   * @param {any} [thisArg] a `this` context for the `next` handler function
   * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
   * @returns {Promise} a promise that either resolves on observable completion or
   *  rejects with the handled error
   */
  forEach(next: (value: T) => void, thisArg: any, PromiseCtor?: PromiseConstructor): Promise<void> {
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

    const source = this;

    return new PromiseCtor<void>((resolve, reject) => {
      source.subscribe((value: T) => {
        const result: any = tryCatch(next).call(thisArg, value);
        if (result === errorObject) {
          reject(errorObject.e);
        }
      }, reject, resolve);
    });
  }

  _subscribe(subscriber: Subscriber<any>): Subscription | Function | void {
    return this.source.subscribe(subscriber);
  }

  // static method stubs
  static ajax: AjaxCreationMethod;
  static bindCallback: typeof BoundCallbackObservable.create;
  static bindNodeCallback: typeof BoundNodeCallbackObservable.create;
  static combineLatest: typeof combineLatestStatic;
  static concat: typeof concatStatic;
  static defer: typeof DeferObservable.create;
  static empty: typeof EmptyObservable.create;
  static forkJoin: typeof ForkJoinObservable.create;
  static from: typeof FromObservable.create;
  static fromArray: typeof ArrayObservable.create;
  static fromEvent: typeof FromEventObservable.create;
  static fromEventPattern: typeof FromEventPatternObservable.create;
  static fromPromise: typeof PromiseObservable.create;
  static interval: typeof IntervalObservable.create;
  static merge: typeof mergeStatic;
  static never: typeof InfiniteObservable.create;
  static of: typeof ArrayObservable.of;
  static race: typeof raceStatic;
  static range: typeof RangeObservable.create;
  static throw: typeof ErrorObservable.create;
  static timer: typeof TimerObservable.create;
  static webSocket: typeof WebSocketSubject.create;
  static zip: typeof zipStatic;

  // core operators
  buffer: buffer<T>;
  bufferCount: bufferCount<T>;
  bufferTime: bufferTime<T>;
  bufferToggle: bufferToggle<T>;
  bufferWhen: bufferWhen<T>;
  catch: _catch<T>;
  combineLatest: combineLatest<T>;
  concat: concat<T>;
  concatMap: concatMap<T>;
  concatMapTo: concatMapTo<T>;
  count: count<T>;
  debounce: debounce<T>;
  debounceTime: debounceTime<T>;
  defaultIfEmpty: defaultIfEmpty<T>;
  delay: delay<T>;
  distinctUntilChanged: distinctUntilChanged<T>;
  do: _do<T>;
  expand: expand<T>;
  filter: filter<T>;
  finally: _finally<T>;
  first: first<T>;
  flatMap: mergeMap<T>;
  flatMapTo: mergeMapTo<T>;
  groupBy: groupBy<T>;
  ignoreElements: ignoreElements<T>;
  last: last<T>;
  let: letProto<T>;
  letBind: letProto<T>;
  every: every<T>;
  map: map<T>;
  mapTo: mapTo<T>;
  materialize: materialize<T>;
  merge: merge<T>;
  mergeMap: mergeMap<T>;
  mergeMapTo: mergeMapTo<T>;
  multicast: multicast<T>;
  observeOn: observeOn<T>;
  partition: partition<T>;
  pluck: typeof pluck;
  publish: publish<T>;
  publishBehavior: publishBehavior<T>;
  publishReplay: publishReplay<T>;
  publishLast: publishLast<T>;
  reduce: reduce<T>;
  race: race<T>;
  repeat: repeat<T>;
  retry: retry<T>;
  retryWhen: retryWhen<T>;
  sample: sample<T>;
  sampleTime: sampleTime<T>;
  scan: scan<T>;
  share: share<T>;
  single: single<T>;
  skip: skip<T>;
  skipUntil: skipUntil<T>;
  skipWhile: skipWhile<T>;
  startWith: startWith<T>;
  subscribeOn: subscribeOn<T>;
  switchMap: switchMap<T>;
  switchMapTo: switchMapTo<T>;
  take: take<T>;
  takeUntil: takeUntil<T>;
  takeWhile: takeWhile<T>;
  throttle: throttle<T>;
  throttleTime: throttleTime<T>;
  timeout: timeout<T>;
  timeoutWith: timeoutWith<T>;
  toArray: toArray<T>;
  toPromise: toPromise<T>;
  window: window<T>;
  windowCount: windowCount<T>;
  windowTime: windowTime<T>;
  windowToggle: windowToggle<T>;
  windowWhen: windowWhen<T>;
  withLatestFrom: withLatestFrom<T>;
  zip: zipProto<T>;
  
  // nested observable methods
  combineAll: combineAll<any, any>;
  concatAll: concatAll<any, any>;
  mergeAll: mergeAll<any, any>;
  zipAll: zipAll<any, any>;
  switch: _switch<any, any>;
  
  // materialized observable methods
  dematerialize: dematerialize<any, any>;

  /**
   * @method Symbol.observable
   * @returns {Observable} this instance of the observable
   * @description an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   */
  [SymbolShim.observable]() {
    return this;
  }
}
