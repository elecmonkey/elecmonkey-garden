import * as React from 'react';

export type AsyncComponentProps<TProps extends object> = TProps & {
  fallback?: React.ReactNode;
};

export function createAsyncComponent<TProps extends object>(
  load: (props: TProps) => Promise<React.ReactNode>,
) {
  return function AsyncComponent({ fallback = null, ...props }: AsyncComponentProps<TProps>) {
    const [node, setNode] = React.useState<React.ReactNode>(fallback);
    const [error, setError] = React.useState<unknown>(null);

    React.useEffect(() => {
      let cancelled = false;

      load(props as TProps)
        .then((nextNode) => {
          if (!cancelled) setNode(nextNode);
        })
        .catch((nextError) => {
          if (!cancelled) setError(nextError);
        });

      return () => {
        cancelled = true;
      };
    }, [JSON.stringify(props)]);

    if (error) throw error;
    return <>{node}</>;
  };
}
