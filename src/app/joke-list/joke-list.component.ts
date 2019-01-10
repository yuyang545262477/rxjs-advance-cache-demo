import {Component, OnInit} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {Joke} from '../joke';
import {JokeService} from '../joke-service/joke.service';
import {mapTo, mergeMap, skip, switchMap, take} from 'rxjs/operators';
import {mergeResolvedReflectiveProviders} from '@angular/core/src/di/reflective_provider';

@Component({
    selector: 'app-joke-list',
    templateUrl: './joke-list.component.html',
    styleUrls: ['./joke-list.component.sass'],
})
export class JokeListComponent implements OnInit {
    showNotification$: Observable<boolean>;
    jokes$: Observable<Joke[]>;
    update$ = new Subject<void>();
    forceReload$ = new Subject<void>();

    constructor(private jokeService: JokeService) {
    }

    ngOnInit() {
        const initialJokes$ = this.getDataOnce();
        const updates$ = merge(this.forceReload$, this.update$)
            .pipe(mergeMap(() => this.getDataOnce()));
        this.jokes$ = merge(initialJokes$, updates$);

        const reload$ = this.forceReload$.pipe(switchMap(() => this.getNotifications()));
        const initialNotification$ = this.getNotifications();
        const show$ = merge(initialNotification$, reload$).pipe(mapTo(true));
        const hide$ = this.update$.pipe(mapTo(false));

        this.showNotification$ = merge(show$, hide$);

    }

    getDataOnce() {
        return this.jokeService.jokes.pipe(take(1));
    }

    forceReload() {
        this.jokeService.forceReload();
        this.forceReload$.next();
    }

    private getNotifications() {
        return this.jokeService.jokes.pipe(skip(1));
    }
}
