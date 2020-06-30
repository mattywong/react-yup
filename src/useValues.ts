import { useThunkReducer } from "./useThunkReducer";

export type ValueState<FormValues> = {
  [Key in keyof FormValues]?: ValueState<FormValues[Key]>;
};

type ValuesActions<FormValues> = {
  type: "values/update";
  payload: (values: ValueState<FormValues>) => ValueState<FormValues>;
};

interface UseValuesHookProps<FormValues> {
  defaultValues?: ValueState<FormValues>;
}

const createValuesReducer = <FormValues>() => {
  return (state: ValueState<FormValues>, action: ValuesActions<FormValues>) => {
    switch (action.type) {
      case "values/update": {
        return action.payload(Object.assign({}, state));
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
