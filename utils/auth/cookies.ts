import { User } from 'firebase/auth';

export function saveAuthTokenToCookie(user: User) {
  user.getIdToken().then(idToken => {
    document.cookie = `idToken=${idToken}; max-age=3600; path=/; secure=${process.env.NODE_ENV === 'production'}; samesite=lax`;
  });
}

export function removeAuthTokenFromCookie() {
  document.cookie = 'idToken=; max-age=0; path=/';
}

export function refreshAuthToken(user: User) {
  user.getIdToken(true).then(idToken => {
    document.cookie = `idToken=${idToken}; max-age=3600; path=/; secure=${process.env.NODE_ENV === 'production'}; samesite=lax`;
  });
}
