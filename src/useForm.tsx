import * as React from "react";
import type { ValidationError, Schema } from "yup";

import { get, set } from "lodash-es";

import { useValues, ValueState } from "./useValues";
import { useTouched, TouchedState } from "./useTouched";
import { useErrors, ErrorState } from "./useErrors";

import { track } from "./util/tracker";
import { focusFirstError } from "./util/focusFirstError";
import { Draft } from "immer";

interface UseFormHookOptions<FormValues extends Record<string, unknown>> {
  defaultValues?: ValueState<FormValues>;
  defaultErrors?: ErrorState<FormValues>;
  defaultTouched?: TouchedState<FormValues>;
  validationSchema?: Schema<FormValues>;
  submitFocusError?: boolean;
}

type CreateSubmitHandler<FormValues> = (
  onSuccess: (values: FormValues) => void,
  onError?:
    | ((errors: ErrorState<FormValues>, values: ValueState<FormValues>) => void)
    | undefined
) => (event: React.FormEvent<HTMLFormElement>) => void;

type Field = {
  onBlur: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

type GetState<T, Y> = (name: string | ((state: T) => Y)) => Y;

type SetValue = (
  name: string,
  value: unknown,
  shouldValidate?: boolean
) => void;

type SetValues<FormValues> = (
  callback: (values: Draft<ValueState<FormValues>>) => void,
  shouldValidate?: boolean
) => void;

type SetTouched<FormValues> = (
  callback: (touched: Draft<TouchedState<FormValues>>) => void
) => void;

type IsTouched<FormValues> = (
  name: string | ((touched: TouchedState<FormValues>) => undefined | boolean)
) => undefined | boolean;

interface ValidateFormOptions {
  touch?: boolean;
}

type ValidateFormResult<FormValues> = Promise<{
  values: ValueState<FormValues>;
  errors?: ErrorState<FormValues>;
  yupErrors?: ValidationError;
}>;

interface FormBagContext<FormValues> {
  createSubmitHandler: CreateSubmitHandler<FormValues>;
  field: Field;
  getError: GetState<FormValues, string | undefined>;
  getErrors: () => ErrorState<FormValues>;
  getValue: GetState<FormValues, unknown>;
  getValues: () => ValueState<FormValues>;
  getTouched: () => TouchedState<FormValues>;
  isTouched: IsTouched<FormValues>;
  isChecked: (name: string, value: any) => boolean;
  setSubmitting: (isSubmitting: boolean) => void;
  setTouched: SetTouched<FormValues>;
  setValue: SetValue;
  setValues: SetValues<FormValues>;
  resetErrors: () => void;
  validateForm: (
    options?: ValidateFormOptions
  ) => ValidateFormResult<FormValues>;
}

interface UseFormHookResult<FormValues> extends FormBagContext<FormValues> {
  values: ValueState<FormValues>;
  errors: ErrorState<FormValues>;
  touched: TouchedState<FormValues>;
  isValid: boolean;
  isSubmitting: boolean;
  FormProvider: ({ children }: { children: React.ReactNode }) => JSX.Element;
}

const FormBagContext = React.createContext<FormBagContext<unknown> | undefined>(
  undefined
);

export const useForm = <FormValues extends Record<string, unknown>>(
  options?: UseFormHookOptions<FormValues>
): UseFormHookResult<FormValues> => {
  const {
    defaultValues,
    defaultErrors,
    defaultTouched,
    validationSchema,
    submitFocusError = true,
  } = options || {};

  const { getValues, setValues } = useValues<FormValues>({
    defaultValues,
  });

  const { getTouched, setTouched } = useTouched<FormValues>({
    defaultTouched,
  });

  const { getErrors, setErrors } = useErrors<FormValues>({
    defaultErrors,
  });

  const [submitting, setSubmitting] = React.useState(false);

  const getValue = React.useCallback(
    (name) => {
      if (typeof name === "function") {
        return name(getValues());
      }

      return get(getValues(), name);
    },
    [getValues]
  );

  const getError = React.useCallback(
    (name) => {
      if (typeof name === "function") {
        return name(getErrors());
      }

      return get(getErrors(), name);
    },
    [getErrors]
  );

  const isTouched: IsTouched<FormValues> = React.useMemo(() => {
    return (
      name:
        | string
        | ((touched: TouchedState<FormValues>) => undefined | boolean)
    ) => {
      if (typeof name === "string") {
        return get(
          getTouched() as TouchedState<FormValues>,
          name,
          undefined
        ) as boolean | undefined;
      }

      if (typeof name === "function") {
        return name(getTouched());
      }

      throw Error(
        `Parameter of type ${typeof name} is not allowed in isTouched call`
      );
    };
  }, [getTouched]);

  const isChecked = React.useMemo(() => {
    return (name: string, value?: unknown) => {
      const chkBoxName = name.endsWith("[]") ? name.slice(0, -2) : name;
      const curValue = get(getValues(), chkBoxName, false);

      if (Array.isArray(curValue)) {
        return curValue.includes(value);
      } else if (typeof curValue === "boolean") {
        return curValue;
      } else if (typeof curValue === "string") {
        return curValue === value;
      } else {
        return false;
      }
    };
  }, []);

  const resetErrors = React.useCallback(() => {
    setErrors({
      type: "errors/reset",
    });
  }, [setErrors]);

  const validateForm = React.useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      track("validateForm");
    }

    return (options?: ValidateFormOptions) => {
      const { touch = true } = options || {};
      return new Promise<{
        values: FormValues;
        errors?: ErrorState<FormValues>;
        yupErrors?: ValidationError;
      }>((resolve, reject) => {
        if (!validationSchema) {
          setErrors({
            type: "errors/reset",
          });
          return resolve({ values: getValues() as FormValues });
        }

        validationSchema
          .validate(getValues(), {
            abortEarly: false,
          })
          .then((values) => {
            setErrors({
              type: "errors/reset",
            });
            resolve({ values: values as FormValues });
          })
          .catch((errors: ValidationError) => {
            if (errors.name !== "ValidationError") {
              reject("Unhandled validation error");
            }

            const formErrors = errors.inner.reduce((acc, cur) => {
              set(acc, cur.path, cur.message);
              return acc;
            }, {} as ErrorState<FormValues>);

            setErrors({
              type: "errors/update/all",
              payload: formErrors,
            });

            if (touch) {
              const nextTouched = errors.inner.reduce((acc, cur) => {
                set(acc, cur.path, true);
                return acc;
              }, {} as TouchedState<FormValues>);

              setTouched({
                type: "touched/update/all",
                payload: nextTouched,
              });
            }

            resolve({
              values: errors.value,
              errors: formErrors,
              yupErrors: errors,
            });
          });
      });
    };
  }, [getValues, setErrors, setTouched, validationSchema]);

  const setValue: SetValue = React.useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      track("setValue");
    }

    return (name, value, shouldValidate) => {
      setValues((dispatch) => {
        dispatch({
          type: "values/update",
          payload: (values) => {
            set(values, name, value);
          },
        });

        if (shouldValidate) {
          validateForm({ touch: false });
        }
      });
    };
  }, [setValues, validateForm]);

  const setValuesProxy = React.useMemo(() => {
    return (
      callback: (values: Draft<ValueState<FormValues>>) => void,
      shouldValidate?: boolean
    ) => {
      setValues({
        type: "values/update",
        payload: callback,
      });

      if (shouldValidate) {
        validateForm({ touch: false });
      }
    };
  }, [setValues, validateForm]);

  const setTouchedProxy = React.useMemo(() => {
    return (callback: (touched: Draft<TouchedState<FormValues>>) => void) => {
      setTouched({
        type: "touched/update",
        payload: callback,
      });
    };
  }, [setTouched]);

  const handleFieldOnBlur = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;

      setTouched({
        type: "touched/update",
        payload: (touched) => {
          set(touched, name, true);
        },
      });

      validateForm({ touch: false });
    },
    [setTouched, validateForm]
  );

  /* 
    name[] = any[];
    name = any | any[];
  */
  const handleFieldOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, type, value } = e.target;

      switch (type) {
        case "checkbox": {
          const { checked } = e.target as HTMLInputElement;

          const isCheckboxArray = name.endsWith("[]");
          const chkboxName = isCheckboxArray ? name.slice(0, -2) : name;
          const curValue: any | any[] = get(getValues(), chkboxName);

          let tempValue: any;

          if (Array.isArray(curValue)) {
            tempValue = curValue.reduce((acc, cur) => {
              acc[cur] = true;
              return acc;
            }, {});

            tempValue[value] = checked;

            tempValue = Object.entries(tempValue)
              .filter((n) => n[1])
              .map((n) => n[0]);

            switch (tempValue.length) {
              case 0:
                tempValue = undefined;
                break;
              case 1:
                if (!isCheckboxArray) {
                  tempValue = tempValue[0];
                }
                break;
              default:
                break;
            }
          } else if (curValue === undefined) {
            if (isCheckboxArray) {
              tempValue = [value];
            } else {
              tempValue = value === "on" ? true : value;
            }
          } else {
            if (checked) {
              tempValue = [curValue, value];
            } else {
              tempValue = undefined;
            }
          }

          setValues((dispatch, getState) => {
            dispatch({
              type: "values/update",
              payload: (values) => {
                set(values, chkboxName, tempValue);
              },
            });

            validateForm({ touch: false });
          });

          break;
        }
        case "email":
        case "color":
        case "date":
        case "datetime-local":
        case "time":
        case "month":
        case "password":
        case "search":
        case "tel":
        case "url":
        case "week":
        case "radio":
        case "number":
        case "range":
        case "text":
        case "textarea":
        default:
          setValues((dispatch, getState) => {
            dispatch({
              type: "values/update",
              payload: (values) => {
                set(values, name, value);
              },
            });

            validateForm({ touch: false });
          });
          break;
      }
    },
    [setValues, getValues, validateForm]
  );

  const field = React.useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      track("field");
    }

    return {
      onBlur: handleFieldOnBlur,
      onChange: handleFieldOnChange,
    };
  }, [handleFieldOnBlur, handleFieldOnChange]);

  const createSubmitHandler: CreateSubmitHandler<FormValues> = React.useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      track("createSubmitHandler");
    }

    return (onSuccess, onError?) => (event) => {
      event.preventDefault();

      const form = event.currentTarget;

      setSubmitting(true);

      return validateForm().then(({ values, errors, yupErrors }) => {
        if (errors) {
          setSubmitting(false);

          if (submitFocusError) {
            focusFirstError(form, yupErrors);
          }

          if (onError) {
            return onError(errors, getValues());
          }

          return;
        }

        return onSuccess(values);
      });
    };
  }, [validateForm, submitFocusError, getValues]);

  const formBag: FormBagContext<FormValues> = React.useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      track("formBag");
    }

    return {
      createSubmitHandler,
      field,
      getError,
      getErrors,
      getTouched,
      getValue,
      getValues,
      isChecked,
      isTouched,
      resetErrors,
      setSubmitting,
      setTouched: setTouchedProxy,
      setValue,
      setValues: setValuesProxy,
      validateForm,
    };
  }, [
    createSubmitHandler,
    field,
    getError,
    getErrors,
    getTouched,
    getValue,
    getValues,
    isChecked,
    isTouched,
    resetErrors,
    setSubmitting,
    setTouchedProxy,
    setValue,
    setValuesProxy,
    validateForm,
  ]);

  const FormProvider = React.useMemo(() => {
    if (process.env.NODE_ENV !== "production") {
      track("FormProvider");
    }

    return ({ children }: { children: React.ReactNode }) => {
      return (
        <FormBagContext.Provider value={formBag}>
          {children}
        </FormBagContext.Provider>
      );
    };
  }, [formBag]);

  return Object.assign({}, formBag, {
    values: getValues(),
    errors: getErrors(),
    touched: getTouched(),
    isValid: Object.keys(getErrors()).length === 0,
    isSubmitting: submitting,
    FormProvider,
  }) as UseFormHookResult<FormValues>;
};

export const useFormBag = <
  FormValues extends Record<string, unknown>
>(): FormBagContext<FormValues> => {
  const ctx = React.useContext(FormBagContext);

  if (!ctx) {
    throw Error("useFormBag was called outside a FormProvider");
  }

  return ctx as FormBagContext<FormValues>;
};
