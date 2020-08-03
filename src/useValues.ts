import { useThunkReducer } from "./useThunkReducer";

// export type ValueState<T> = {
//   [Key in keyof T]?: ValueState<T[Key]>;
// };

export type InnerValueState<T> = T extends
  | string
  | number
  | boolean
  | undefined
  | Function
  | Date
  ? T // if primitive, leave as primitive
  : {
      [P in keyof T]?: InnerValueState<T[P]>;
    };

export type ValueState<T> = {
  [Key in keyof T]?: InnerValueState<T[Key]>;
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
