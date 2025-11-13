import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, throwError, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Ne pas ajouter le token pour les routes d'authentification (login, register, refresh)
  const isAuthRoute = req.url.includes('/auth/login') || 
                      req.url.includes('/auth/register') || 
                      req.url.includes('/auth/refresh');
  
  let authReq = req;
  // Ne jamais ajouter le token pour les routes d'authentification
  if (token && !isAuthRoute) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  } else if (isAuthRoute && token) {
    // Pour les routes d'authentification, s'assurer qu'aucun token n'est envoyé
    // Enlever le header Authorization s'il existe déjà
    authReq = req.clone({
      headers: req.headers.delete('Authorization')
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
        console.error('Erreur 401: Token expiré ou invalide');
        
        // Ne pas essayer de rafraîchir pour les routes d'authentification
        if (isAuthRoute) {
          return throwError(() => error);
        }
        
        // URLs qui peuvent échouer avec 401 sans déclencher une déconnexion
        const allowed401Urls = [
          '/projects/summary',
          '/contributors/rewards-won',
          '/projects/search',
          '/projects/status/',
          '/projects/sector/'
        ];
        
        const isAllowed401Url = allowed401Urls.some(url => req.url.includes(url));
        
        if (isAllowed401Url) {
          console.log('Erreur 401 autorisée pour cette URL - pas de déconnexion:', req.url);
          return throwError(() => error);
        }
        
        // Essayer de rafraîchir le token seulement si ce n'est pas déjà une requête de refresh
        const refreshToken = authService.getRefreshToken();
        if (refreshToken && !req.url.includes('/auth/refresh')) {
          console.log('Tentative de rafraîchissement du token...');
          return authService.refreshToken().pipe(
            switchMap((response) => {
              console.log('Token rafraîchi avec succès');
              // Retry la requête originale avec le nouveau token
              const newAuthReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${response.accessToken}`)
              });
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              console.error('Échec du rafraîchissement du token:', refreshError);
              console.error('Déconnexion de l\'utilisateur...');
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          console.error('Aucun refresh token disponible ou requête de refresh - déconnexion...');
          authService.logout();
        }
      }
      
      return throwError(() => error);
    })
  );
};
