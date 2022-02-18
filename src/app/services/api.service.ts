import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

const { apiLink } = environment;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  login = (username: string, password: string) =>
    this.http.post(`${apiLink}/auth/login`, { username, password }).toPromise();

  me = () => this.http.get(`${apiLink}/auth/me`).toPromise();

  session = () => this.http.get(`${apiLink}/auth/session`).toPromise();

  token = () => this.http.get(`${apiLink}/auth/token`).toPromise();

  //MATCHES
  getMatch = (id: string) =>
    this.http.get(`${apiLink}/matches/${id}`).toPromise();

  getMatches = () => this.http.get(`${apiLink}/matches`).toPromise();

  createMatch = () => this.http.post(`${apiLink}/matches`, {}).toPromise();

  play = (matchId: string) =>
    this.http.post(`${apiLink}/matches/${matchId}/play`, {}).toPromise();

  stop = (matchId: string) =>
    this.http.post(`${apiLink}/matches/${matchId}/stop`, {}).toPromise();

  setPlayerPosition = (id: string, playerId: string, playerPosition: number) =>
    this.http
      .post(`${apiLink}/matches/${id}/move`, {
        playerId,
        playerPosition,
      })
      .toPromise();
}
