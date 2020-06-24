import { produce, Draft } from "immer";

import { useThunkReducer } from "./useThunkReducer";

export type ValueState<FormValues> = {
  [Key in keyof FormValues]?: ValueState<FormValues[Key]>;
};

type ValuesActions<FormValues> = {
  type: "values/update";
  payload: (values: Draft<ValueState<FormValues>>) => void;
};

interface UseValuesHookProps<FormValues> {
  defaultValues?: ValueState<FormValues>;
}

const createValuesReducer = <FormValues>() => {
  return (state: ValueState<FormValues>, action: ValuesActions<FormValues>) => {
    switch (action.type) {
      case "values/update": {
        return produce(state, (draft) => {
          action.payload(draft);
        });
      }
      default:
        return state;
    }
  };
};

export const useValues = <FormValues>({
  defaultValues = {},
}: UseValuesHookProps<FormValues>) => {
  const [getValues, setValues] = useThunkReducer(
    createValuesReducer(),
    defaultValues
  );

  return {
    getValues,
    setValues,
  };
};
