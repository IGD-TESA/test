import type { Route } from '@angular/router';

export function featurePageRoute(
  path: string,
  heading: string,
  description: string,
): Route {
  return {
    path,
    title: `${heading} | IGD`,
    data: {
      heading,
      description,
    },
    loadComponent: () =>
      import('../pages/feature-placeholder/feature-placeholder.page').then(
        (module) => module.FeaturePlaceholderPage,
      ),
  };
}