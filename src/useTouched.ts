import { useThunkReducer } from "./useThunkReducer";
import { LeafsToType } from "./types";

export type TouchedState<T> = LeafsToType<T, boolean>;

type TouchedActions<FormValues> =
  | {
      type: "touched/update";
      payload: (touched: TouchedState<FormValues>) => TouchedState<FormValues>;
    }
  | {
      type: "touched/update/all";
      payload: TouchedState<FormValues>;
    };

interface UseTouchedHookProps<FormValues> {
  defaultTouched?: TouchedState<FormValues> | (() => TouchedState<FormValues>);
}

const createTouchedReducer = <FormValues>() => {
  return (
    state: TouchedState<FormValues>,
    action: TouchedActions<FormValues>
  ) => {
    switch (action.type) {
      case "touched/update": {
        return action.payload(Object.assign({}, state));
      }
      case "touched/update/all": {
        return Object.assign({}, action.payload);
      }
      default:
        throw Error(
          `The action type ${(action as any).type} is not recognized`
        );
    }
  };
};

export const useTouched = <FormValues>({
  defaultTouched = {} as TouchedState<FormValues>,
}: UseTouchedHookProps<FormValues>) => {
  const [getTouched, setTouched] = useThunkReducer(
    createTouchedReducer(),
    {},
    (initialState) => {
      if (typeof defaultTouched === "function") {
        return defaultTouched();
      }

      return defaultTouched || initialState;
    }
  );

  return {
    getTouched,
    setTouched,
  };
};
