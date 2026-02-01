import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const NETWORK_ERROR_MSG =
  'Error de conexión. Verifica que el backend esté disponible.';

function getErrorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return NETWORK_ERROR_MSG;
  }
  const body = err.error;
  if (body && typeof body === 'object') {
    const msg = body.detail ?? body.error ?? body.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) {
      return msg.map((m: { msg?: string }) => m?.msg ?? String(m)).join('. ');
    }
  }
  if (err.status >= 500) {
    return 'Error del servidor. Intenta más tarde.';
  }
  if (err.status === 404) {
    return 'Recurso no encontrado.';
  }
  return err.message || NETWORK_ERROR_MSG;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = getErrorMessage(err);
      console.error('HTTP error:', err.status, message);
      return throwError(() => new Error(message));
    })
  );
};
