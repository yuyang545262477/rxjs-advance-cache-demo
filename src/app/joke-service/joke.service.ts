import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {JokeResponse} from '../joke-response';
import {Observable, Subject, timer} from 'rxjs';
import {Joke} from '../joke';

const API_ENDPOINT = 'https://api.icndb.com/jokes/random/5?limitTo=[nerdy]';
const CACHE_SIZE = 1;
const REFRESH_INTERVAL = 1000 * 10;

@Injectable({
    providedIn: 'root',
})
export class JokeService {
    private cache$: Observable<Array<Joke>>;
    private reload$ = new Subject<void>();

    constructor(private http: HttpClient) {
    }

    get jokes() {
        if (!this.cache$) {
            const time$ = timer(0, REFRESH_INTERVAL);
            this.cache$ = time$.pipe(
                switchMap(() => this.requestJokes()),
                shareReplay(CACHE_SIZE));
        }
        return this.cache$;
    }

    forceReload() {
        this.reload$.next();
        this.cache$ = null;
    }

    private requestJokes() {
        return this.http.get<JokeResponse>(API_ENDPOINT).pipe(
            map(response => response.value),
        );
    }


}
