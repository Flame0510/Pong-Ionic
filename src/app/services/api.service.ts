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

  me = (playerId: string) =>
    this.http.get(`${apiLink}/auth/me/${playerId}`).toPromise();

  getMatch = (id: string) =>
    this.http.get(`${apiLink}/matches/${id}`).toPromise();

  createMatch = (playerId: string) =>
    this.http.post(`${apiLink}/matches`, { headers: { playerId } }).toPromise();

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
