import {Joke} from './joke';

export interface JokeResponse {
    type: string;
    value: Array<Joke>;
}
