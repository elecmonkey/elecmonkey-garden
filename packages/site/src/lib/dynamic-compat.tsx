import * as React from 'react';

type Loader<TProps extends object> = () => Promise<{ default: React.ComponentType<TProps> } | React.ComponentType<TProps>>;

interface DynamicOptions {
  loading?: () => React.ReactNode;
  ssr?: boolean;
}

export default function dynamic<TProps extends object>(loader: Loader<TProps>, options: DynamicOptions = {}) {
  const LazyComponent = React.lazy(async () => {
    const loaded = await loader();
    return typeof loaded === 'function' ? { default: loaded } : loaded;
  });

  return function DynamicComponent(props: TProps) {
    const fallback = options.loading ? options.loading() : null;
    return (
      <React.Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}
