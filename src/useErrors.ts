import { useThunkReducer } from "./useThunkReducer";
import produce, { Draft } from "immer";
import type { LeafsToType } from "./types";

export type ErrorState<T> = LeafsToType<T, string>;

type ErrorsActions<FormValues> =
  | {
      type: "errors/update";
      payload: (errors: Draft<ErrorState<FormValues>>) => void;
    }
  | {
      type: "errors/update/all";
      payload: ErrorState<FormValues>;
    }
  | {
      type: "errors/reset";
    };

interface UseErrorsHookProps<FormValues> {
  defaultErrors?: ErrorState<FormValues>;
}

const createErrorsReducer = <FormValues>() => {
  return (state: ErrorState<FormValues>, action: ErrorsActions<FormValues>) => {
    switch (action.type) {
      case "errors/update": {
        return produce(state, (draft) => {
          action.payload(draft);
        });
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
    defaultErrors
  );

  return {
    getErrors,
    setErrors,
  };
};
