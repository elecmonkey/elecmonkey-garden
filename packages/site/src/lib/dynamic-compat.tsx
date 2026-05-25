import * as React from 'react';

type Loader<TProps extends object> = () => Promise<{ default: React.ComponentType<TProps> } | React.ComponentType<TProps>>;

interface DynamicOptions<TProps extends object> {
  loading?: (props: TProps) => React.ReactNode;
  ssr?: boolean;
}

export default function dynamic<TProps extends object>(loader: Loader<TProps>, options: DynamicOptions<TProps> = {}) {
  const LazyComponent = React.lazy(async () => {
    const loaded = await loader();
    return typeof loaded === 'function' ? { default: loaded } : loaded;
  });

  return function DynamicComponent(props: TProps) {
    const ssrDisabled = options.ssr === false;
    const fallback = options.loading ? options.loading(props) : null;
    const [canRender, setCanRender] = React.useState(!ssrDisabled);

    React.useEffect(() => {
      if (ssrDisabled) {
        setCanRender(true);
      }
    }, [ssrDisabled]);

    if (!canRender) {
      return fallback;
    }

    return (
      <React.Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}
