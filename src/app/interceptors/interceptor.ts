import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpHeaders,
} from '@angular/common/http';

import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Storage } from '@ionic/storage-angular';

@Injectable()
export class Interceptor implements HttpInterceptor {
  loggedRoutes = ['/me', '/token', '/match', '/matches'];

  accessToken: string = '';

  baseHeader: HttpHeaders = new HttpHeaders({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Accept: 'application/json',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/json; charset=utf-8',
  });

  constructor(private storage: Storage) {}

  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      this.loggedRoutes.some((endpoint) =>
        httpRequest.url.includes(endpoint)
      ) /*  &&
      httpRequest.method !== 'GET' */
    ) {
      return from(this.storage.get('accessToken')).pipe(
        switchMap((accessToken) => {
          httpRequest = httpRequest.clone({
            headers: this.baseHeader.set(
              'Authorization',
              `Bearer ${accessToken}`
            ),
          });

          return next.handle(httpRequest);
        })
      );
    } else {
      return next.handle(httpRequest);
    }
  }
}
