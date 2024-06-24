import { useEffect, useState } from 'react';

type EffectReturnType = (() => void) | void;
type AsyncEffectFuncType<U extends EffectReturnType> = () => Promise<U>;

export function useAsyncEffect<U extends EffectReturnType>(
  func: AsyncEffectFuncType<U>,
  depends?: Array<unknown>,
) {
  const [err, setError] = useState<unknown>(null);
  if (err !== null) {
    throw err;
  }

  useEffect(() => {
    try {
      const result = func();
      const cleanup = result.then(
        (resolve) => resolve,
        (reject) => {
          setError(reject);
        },
      );
      return () => {
        void cleanup.then((maybeCallable) => {
          maybeCallable?.();
        });
      };
    } catch (e) {
      setError(e);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, depends);
}
