import * as React from "react";
import { produce, Draft } from "immer";

import { useThunkReducer } from "./useThunkReducer";
import { LeafsToType } from "./types";

export type TouchedState<T> = LeafsToType<T, boolean>;

type TouchedActions<FormValues> =
  | {
      type: "touched/update";
      payload: (touched: Draft<TouchedState<FormValues>>) => void;
    }
  | {
      type: "touched/update/all";
      payload: TouchedState<FormValues>;
    };

interface UseTouchedHookProps<FormValues> {
  defaultTouched?: TouchedState<FormValues>;
}

const createTouchedReducer = <FormValues>() => {
  return (
    state: TouchedState<FormValues>,
    action: TouchedActions<FormValues>
  ) => {
    switch (action.type) {
      case "touched/update": {
        return produce(state, (draft) => {
          action.payload(draft);
        });
      }
      case "touched/update/all": {
        return action.payload;
      }
      default:
        return state;
    }
  };
};

export const useTouched = <FormValues>({
  defaultTouched = {} as TouchedState<FormValues>,
}: UseTouchedHookProps<FormValues>) => {
  const reducer = React.useMemo(() => {
    return createTouchedReducer<FormValues>();
  }, []);

  const [getTouched, setTouched] = useThunkReducer(reducer, defaultTouched);

  return {
    getTouched,
    setTouched,
  };
};
