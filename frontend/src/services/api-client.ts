export interface ApiClientOptions {
  baseUrl: string;
  accessToken?: string;
}

export function createApiClient(options: ApiClientOptions) {
  return {
    baseUrl: options.baseUrl,
    accessToken: options.accessToken,
  };
}
