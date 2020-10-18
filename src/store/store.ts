import { zipObj } from "ramda";
import {
  Observable,
  of,
  Subject,
} from "rxjs";
import {
  shareReplay,
  startWith,
  takeUntil,
  map,
  combineAll,
} from "rxjs/operators";

type ObservableState = { [x: string]: Observable<any> };
type SubjectState = { [x: string]: Subject<unknown> };
// small stores that stream state

type InitState = { [x: string]: unknown };

// Very Simple store
export class Store {
  private _state: SubjectState = {};
  private _observables: ObservableState = {};
  private _destroy$ = new Subject();
  public state$: Observable<{[x: string]: any}>;

  constructor(initState: InitState) {
    let keys = Object.keys(initState);

    for (let key of keys) {
      this._state[key] = new Subject();
      this._observables[key] = this._state[key].pipe(
        startWith(initState[key]),
        shareReplay(1),
        takeUntil(this._destroy$)
      );
    }

    this.state$ = of(...keys).pipe(map((key: string) => this._observables[key]), combineAll(), map(zipObj(keys)));
  }

  get(key: keyof SubjectState) {
    if (key in this._state) {
      return this._observables[key];
    } else {
      throw new Error("No such key in store");
    }
  }

  set(key: keyof SubjectState, value: unknown) {
    if (key in this._state) {
      this._state[key].next(value);
    } else {
      throw new Error("No such key in store");
    }
  }

  destroy(cleanup: () => void = () => {}) {
    this._destroy$.next();
    cleanup();
  }
}
