export function usePlaceholderQuery(featureName: string) {
  return {
    featureName,
    status: "placeholder" as const,
  };
}
