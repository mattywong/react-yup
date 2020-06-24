import * as React from "react";
import type { ValidationError, Schema } from "yup";

import { get, set } from "lodash-es";

import { useValues, ValueState } from "./useValues";
import { useTouched, TouchedState } from "./useTouched";
import { useErrors, ErrorState } from "./useErrors";

import { track } from "./util/tracker";
import { focusFirstError } from "./util/focusFirstError";

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
  callback: (values: ValueState<FormValues>) => void,
  shouldValidate?: boolean
) => void;

type IsTouched<FormValues> = (
  name: string | ((touched: TouchedState<FormValues>) => undefined | boolean)
) => undefined | boolean;

interface ValidateFormOptions {
  touch?: boolean;
}

interface FormBagContext<FormValues> {
  createSubmitHandler: CreateSubmitHandler<FormValues>;
  field: Field;
  getError: GetState<FormValues, string | undefined>;
  getErrors: () => ErrorState<FormValues>;
  getValue: GetState<FormValues, unknown>;
  getValues: () => ValueState<FormValues>;
  getTouched: () => TouchedState<FormValues>;
  isTouched: IsTouched<FormValues>;
  setSubmitting: (isSubmitting: boolean) => void;
  setValue: SetValue;
  setValues: SetValues<FormValues>;
  resetErrors: () => void;
  validateForm: (options?: ValidateFormOptions) => Promise<FormValues>;
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
      return new Promise<FormValues>((resolve, reject) => {
        if (!validationSchema) {
          setErrors({
            type: "errors/reset",
          });
          return resolve(getValues() as FormValues);
        }

        return validationSchema
          .validate(getValues(), {
            abortEarly: false,
          })
          .then((values) => {
            setErrors({
              type: "errors/reset",
            });
            return resolve(values as FormValues);
          })
          .catch((errors: ValidationError) => {
            const nextErrors = errors.inner.reduce((acc, cur) => {
              set(acc, cur.path, cur.message);
              return acc;
            }, {} as ErrorState<FormValues>);

            setErrors({
              type: "errors/update/all",
              payload: nextErrors,
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

            reject({ errors: nextErrors, yupErrors: errors });
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
          validateForm({ touch: false }).catch(() => {
            // do nothing
          });
        }
      });
    };
  }, [setValues, validateForm]);

  const setValuesProxy = React.useMemo(() => {
    return (
      callback: (values: ValueState<FormValues>) => void,
      shouldValidate?: boolean
    ) => {
      setValues({
        type: "values/update",
        payload: callback,
      });

      if (shouldValidate) {
        validateForm({ touch: false }).catch(() => {
          // do nothing
        });
      }
    };
  }, [setValues, validateForm]);

  const handleFieldOnBlur = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;

      setTouched({
        type: "touched/update",
        payload: (touched) => {
          set(touched, name, true);
        },
      });

      validateForm({ touch: false }).catch(() => {
        // do nothing
      });
    },
    [setTouched, validateForm]
  );

  const handleFieldOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, type, value } = e.target;

      switch (type) {
        case "checkbox": {
          const { checked } = e.target as HTMLInputElement;
          setValues((dispatch, getState) => {
            dispatch({
              type: "values/update",
              payload: (values) => {
                set(values, name, checked);
              },
            });

            validateForm({ touch: false }).catch(() => {
              // do nothing
            });
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

            validateForm({ touch: false }).catch(() => {
              // do nothing
            });
          });
          break;
      }
    },
    [setValues, validateForm]
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

      validateForm()
        .then(onSuccess)
        .finally(() => {
          setSubmitting(false);
        })
        .catch(
          ({
            errors,
            yupErrors,
          }: {
            errors: ErrorState<FormValues>;
            yupErrors: ValidationError;
          }) => {
            if (submitFocusError) {
              focusFirstError(form, yupErrors);
            }

            if (onError) {
              onError(errors, getValues());
            }
          }
        );
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
      isTouched,
      resetErrors,
      setSubmitting,
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
    isTouched,
    resetErrors,
    setSubmitting,
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
