export interface JwtClaims {
  sub: string;
  role: string;
  permissions: string[];
}
