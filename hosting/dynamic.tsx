import { lazy, Suspense, type ComponentType } from "react";
// Client-only delivery target. The Next.js application continues to use next/dynamic.
export default function dynamic<P extends object>(loader: () => Promise<{ default: ComponentType<P> }>, options: { ssr?: boolean; loading?: ComponentType } = {}) {
  const Component = lazy(loader);
  const Loading = options.loading;
  return function HostedDynamic(props: P) { return <Suspense fallback={Loading ? <Loading /> : null}><Component {...props} /></Suspense>; };
}
