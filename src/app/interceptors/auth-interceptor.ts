import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Ne pas ajouter le token pour les routes d'authentification
  const isAuthRoute = req.url.includes('/auth/');
  
  let authReq = req;
  if (token && !isAuthRoute) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  console.log('Interceptor - URL:', req.url, 'Méthode:', req.method);
  console.log('Interceptor - IsAuthRoute:', isAuthRoute, 'HasToken:', !!token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erreur HTTP interceptée:', error);
      console.error('Erreur complète:', JSON.stringify(error, null, 2));
      
      // Gestion spécifique des erreurs
      if (error.status === 0) {
        console.error('Erreur de connexion: Impossible de joindre le serveur backend');
        console.error('URL de la requête:', error.url);
        console.error('Cette erreur peut être due à:');
        console.error('1. Le serveur backend n\'est pas accessible');
        console.error('2. Problème CORS');
        console.error('3. Blocage par le navigateur');
        console.error('4. Certificat SSL invalide');
      } else if (error.status === 401) {
        console.error('Erreur 401: Non autorisé - déconnexion...');
        if (!isAuthRoute) {
          authService.logout();
        }
      }
      
      return throwError(() => error);
    })
  );
};
