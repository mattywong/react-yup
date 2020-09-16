import { useThunkReducer } from "./useThunkReducer";
import type { LeafsToType } from "./types";

export type ErrorState<T> = LeafsToType<T, string>;

type ErrorsActions<FormValues> =
  | {
      type: "errors/update";
      payload: (errors: ErrorState<FormValues>) => ErrorState<FormValues>;
    }
  | {
      type: "errors/update/all";
      payload: ErrorState<FormValues>;
    }
  | {
      type: "errors/reset";
    };

interface UseErrorsHookProps<FormValues> {
  defaultErrors?: ErrorState<FormValues> | (() => ErrorState<FormValues>);
}

const createErrorsReducer = <FormValues>() => {
  return (state: ErrorState<FormValues>, action: ErrorsActions<FormValues>) => {
    switch (action.type) {
      case "errors/update": {
        return action.payload(Object.assign({}, state));
      }
      case "errors/update/all": {
        return action.payload;
      }
      case "errors/reset":
        return {} as ErrorState<FormValues>;
      default:
        return state;
    }
  };
};

export const useErrors = <FormValues>({
  defaultErrors = {} as ErrorState<FormValues>,
}: UseErrorsHookProps<FormValues>) => {
  const [getErrors, setErrors] = useThunkReducer(
    createErrorsReducer(),
    {},
    (initialState) => {
      if (typeof defaultErrors === "function") {
        return defaultErrors();
      }

      return defaultErrors || initialState;
    }
  );

  return {
    getErrors,
    setErrors,
  };
};
