import * as React from "react";
import { ValidationError, Schema } from "yup";

import { get, set } from "lodash-es";

import { useValues, ValueState } from "./useValues";
import { useTouched, TouchedState } from "./useTouched";
import { useErrors, ErrorState } from "./useErrors";

import { track } from "./util/tracker";
import { focusFirstError } from "./util/focusFirstError";

interface UseFormHookOptions<FormValues extends Record<string, unknown>> {
  defaultValues?: ValueState<FormValues> | (() => ValueState<FormValues>);
  defaultErrors?: ErrorState<FormValues> | (() => ErrorState<FormValues>);
  defaultTouched?: TouchedState<FormValues> | (() => TouchedState<FormValues>);
  validationSchema?: Schema<FormValues>;
  submitFocusError?: boolean;
  focusMapper?: Parameters<typeof focusFirstError>[2];
}

type CreateSubmitHandler<FormValues> = (
  onSuccess: (values: ValueState<FormValues>) => void,
  onError?:
    | ((
        errors: ErrorState<FormValues>,
        values: ValueState<FormValues>,
        yupErrors: ValidationError
      ) => void)
    | undefined
) => (event: React.FormEvent<HTMLElement>) => void;

type Field = {
  onBlur: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
};

type SetValue = (
  name: string,
  value: unknown,
  shouldValidate?: boolean
) => void;

type SetValues<FormValues> = (
  callback: (values: ValueState<FormValues>) => ValueState<FormValues>,
  shouldValidate?: boolean
) => void;

type SetTouched<FormValues> = {
  (
    callback: (touched: TouchedState<FormValues>) => TouchedState<FormValues>,
    shouldValidate?: boolean,
    _?: never
  ): void;
  (name: string, value: boolean, shouldValidate?: boolean): void;
};

interface ValidateFormOptions {
  touch?: boolean;
}

type ValidateFormResult<FormValues> = Promise<{
  values: ValueState<FormValues>;
  errors?: ErrorState<FormValues>;
  yupErrors?: ValidationError;
}>;

type IsChecked = {
  (name: string, value: (curValue: any) => boolean): boolean;
  (name: string, value?: undefined): boolean;
  (name: string, value: any): boolean;
};

interface FormBagContext<FormValues> {
  createSubmitHandler: CreateSubmitHandler<FormValues>;
  field: Field;
  getError: {
    (name: string): string | undefined;
    (callback: (errors: ErrorState<FormValues>) => string | undefined):
      | string
      | undefined;
  };
  getErrors: () => ErrorState<FormValues>;
  getValue: {
    (name: string): unknown;
    <R>(callback: (values: ValueState<FormValues>) => R | undefined):
      | R
      | undefined;
  };
  getValues: () => ValueState<FormValues>;
  getTouched: () => TouchedState<FormValues>;
  isTouched: {
    (name: string): boolean;
    (callback: (touched: TouchedState<FormValues>) => undefined | boolean):
      | undefined
      | boolean;
  };
  isChecked: IsChecked;
  setSubmitting: (isSubmitting: boolean) => void;
  setDirty: (isDirty: boolean) => void;
  setTouched: SetTouched<FormValues>;
  setValue: SetValue;
  setValues: SetValues<FormValues>;
  resetErrors: () => void;
  validateForm: (
    options?: ValidateFormOptions
  ) => ValidateFormResult<FormValues>;
  validateField: (
    name: string,
    values: ValueState<FormValues>,
    shouldTouch?: boolean
  ) => Promise<unknown>;
}

interface UseFormHookResult<FormValues> extends FormBagContext<FormValues> {
  values: ValueState<FormValues>;
  errors: ErrorState<FormValues>;
  touched: TouchedState<FormValues>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
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
    focusMapper,
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

  const [dirty, setDirty] = React.useState(false);

  const getValue = React.useMemo(() => {
    function getValue(name: string): unknown;
    function getValue<R>(callback: (values: ValueState<FormValues>) => R): R;
    function getValue(name: any) {
      if (typeof name === "function") {
        return name(getValues());
      }

      return get(getValues(), name);
    }

    return getValue;
  }, [getValues]);

  const getError = React.useMemo(() => {
    function getError(name: string): string | undefined;
    function getError(
      callback: (errors: ErrorState<FormValues>) => string | undefined
    ): string | undefined;
    function getError(name: unknown) {
      if (typeof name === "function") {
        return name(getErrors());
      }

      return get(getErrors(), name as string);
    }

    return getError;
  }, [getErrors]);

  const isTouched = React.useMemo(() => {
    function isTouched(name: string): boolean;
    function isTouched(
      callback: (touched: TouchedState<FormValues>) => undefined | boolean
    ): undefined | boolean;
    function isTouched(name: unknown) {
      if (typeof name === "string") {
        return get(getTouched() as TouchedState<FormValues>, name, false);
      }

      if (typeof name === "function") {
        return name(getTouched());
      }

      throw Error(
        `Parameter of type ${typeof name} is not allowed in isTouched call`
      );
    }

    return isTouched;
  }, [getTouched]);

  const isChecked = React.useMemo(() => {
    function isChecked(name: string, value?: never): boolean;
    function isChecked(
      name: string,
      value: (curValue: any) => boolean
    ): boolean;
    function isChecked(name: string, value: any): boolean;
    function isChecked(name: any, value: any): boolean {
      const chkBoxName = name.endsWith("[]") ? name.slice(0, -2) : name;
      const curValue = get(getValues(), chkBoxName, null);

      if (typeof value === "function") {
        return value(curValue);
      }

      if (Array.isArray(curValue)) {
        return curValue.includes(value);
      } else if (typeof curValue === "boolean") {
        return curValue;
      } else {
        return curValue === value;
      }
    }

    return isChecked;
  }, [getValues]);

  const resetErrors = React.useCallback(() => {
    setErrors({
      type: "errors/reset",
    });
  }, [setErrors]);

  const validateForm = React.useMemo(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
      track("validateForm");
    }

    return (options?: ValidateFormOptions) => {
      const { touch = true } = options || {};
      return new Promise<{
        values: ValueState<FormValues>;
        errors?: ErrorState<FormValues>;
        yupErrors?: ValidationError;
      }>((resolve, reject) => {
        if (!validationSchema) {
          setErrors({
            type: "errors/reset",
          });
          return resolve({ values: getValues() as ValueState<FormValues> });
        }

        validationSchema
          .validate(getValues(), {
            abortEarly: false,
          })
          .then((values) => {
            setErrors({
              type: "errors/reset",
            });
            resolve({ values: values as ValueState<FormValues> });
          })
          .catch((errors: ValidationError) => {
            if (errors.name !== "ValidationError") {
              reject("Unhandled validation error");
            }

            const nextTouched = getTouched();

            const pathCache: Record<string, boolean> = {};

            const formErrors = errors.inner.reduce((acc, cur) => {
              if (pathCache[cur.path]) {
                // there can be multiple errors for one field,
                // so skip if message has already been set for cur.path
                return acc;
              }

              set(acc, cur.path, cur.message);

              if (touch) {
                set(nextTouched, cur.path, true);
              }

              pathCache[cur.path] = true;

              return acc;
            }, {} as ErrorState<FormValues>);

            setErrors({
              type: "errors/update/all",
              payload: formErrors,
            });

            if (touch) {
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
  }, [getValues, setErrors, setTouched, getTouched, validationSchema]);

  const validateField = React.useMemo(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
      track("validateField");
    }

    return (
      name: string,
      values: ValueState<FormValues>,
      shouldTouch = false
    ) => {
      return new Promise((resolve, reject) => {
        if (shouldTouch) {
          setTouched({
            type: "touched/update",
            payload: (touched) => {
              set(touched, name, true);
              return touched;
            },
          });
        }

        if (!validationSchema) {
          setErrors({
            type: "errors/reset",
          });
          return resolve(get(values, name));
        }

        let draft;

        try {
          draft = validationSchema.cast(values);
        } catch (error) {
          /* 
            This error block happens on a TypeError.
            This happens when a schema is expecting x type but received y
            e.g expects Yup.number() but received Yup.string().
            When this happens, because the Error is not of type ValidationError,
            we validate the whole form as the error messages will be different otherwise.
          */
          validateForm({ touch: false });

          if (error.name !== "TypeError") {
            return reject("Unhandled validation error");
          }

          return reject(error);
        }

        validationSchema
          .validateAt(name, draft, {
            abortEarly: false,
          })
          .then((value) => {
            setErrors({
              type: "errors/update",
              payload: (errors) => {
                set(errors, name, undefined);
                return errors;
              },
            });
            return resolve(value);
          })
          .catch((error: ValidationError) => {
            if (error.name !== "ValidationError") {
              return reject("Unhandled validateField error");
            }

            setErrors({
              type: "errors/update",
              payload: (errors) => {
                set(errors, name, error.errors[0]);
                return errors;
              },
            });

            reject(error);
          });
      });
    };
  }, [setErrors, setTouched, validateForm, validationSchema]);

  const setValue: SetValue = React.useMemo(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
      track("setValue");
    }

    return (name, value, shouldValidate) => {
      setValues((dispatch) => {
        dispatch({
          type: "values/update",
          payload: (values) => {
            set(values, name, value);
            return values;
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
      callback: (values: ValueState<FormValues>) => ValueState<FormValues>,
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
    function _setTouched(
      callback: (touched: TouchedState<FormValues>) => TouchedState<FormValues>,
      shouldValidate?: boolean,
      _?: never
    ): void;
    function _setTouched(
      name: string,
      value: boolean,
      shouldValidate?: boolean
    ): void;
    function _setTouched(x: any, y: boolean, z?: boolean) {
      if (typeof x === "function") {
        setTouched({
          type: "touched/update",
          payload: x,
        });

        if (y) {
          validateForm({ touch: false });
        }

        return;
      }

      if (typeof x === "string") {
        setTouched((dispatch, getTouched) => {
          dispatch({
            type: "touched/update",
            payload: (touched) => {
              set(touched, x, y);
              return touched;
            },
          });
        });

        if (z) {
          validateForm({ touch: false });
        }

        return;
      }
    }

    return _setTouched;
  }, [setTouched, validateForm]);

  const handleFieldOnBlur = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;

      const isCheckboxArray = name.endsWith("[]");
      const chkboxName = isCheckboxArray ? name.slice(0, -2) : name;

      setTouched((dispatch, getTouched) => {
        dispatch({
          type: "touched/update",
          payload: (touched) => {
            set(touched, chkboxName, true);
            return touched;
          },
        });
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
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, type, value } = e.target;
      setDirty(true);

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
          } else if (typeof curValue === "boolean") {
            tempValue = checked;
          } else {
            if (checked) {
              tempValue = [curValue, value];
            } else {
              tempValue = undefined;
            }
          }

          setValues((dispatch, getValues) => {
            const draft = getValues();
            set(draft, chkboxName, tempValue);

            validateField(chkboxName, draft)
              .then((value) => {
                console.log(tempValue);
                console.log(value);
                dispatch({
                  type: "values/update",
                  payload: (values) => {
                    set(values, chkboxName, value);
                    return values;
                  },
                });
              })
              .catch((err) => {
                dispatch({
                  type: "values/update",
                  payload: (values) => {
                    set(values, chkboxName, tempValue);
                    return values;
                  },
                });
              });
          });

          break;
        }

        // select element - multiple
        case "select-multiple": {
          const { options } = e.target as HTMLSelectElement;
          const selectedValues = Array.from(options)
            .filter((option) => option.selected)
            .map((option) => option.value);

          setValues((dispatch, getValues) => {
            const draft = getValues();
            set(draft, name, selectedValues);

            validateField(name, draft)
              .then((value) => {
                dispatch({
                  type: "values/update",
                  payload: (values) => {
                    set(values, name, selectedValues);
                    return values;
                  },
                });
              })
              .catch((err) => {
                dispatch({
                  type: "values/update",
                  payload: (values) => {
                    set(values, name, selectedValues);
                    return values;
                  },
                });
              });
          });

          break;
        }

        case "radio": {
          setValues((dispatch, getValues) => {
            const draft = getValues();
            set(draft, name, value);

            validateField(name, draft)
              .then((value) => {
                console.log(value);
                dispatch({
                  type: "values/update",
                  payload: (values) => {
                    set(values, name, value);
                    return values;
                  },
                });
              })
              .catch((err) => {
                dispatch({
                  type: "values/update",
                  payload: (values) => {
                    set(values, name, value);
                    return values;
                  },
                });
              });
          });
          break;
        }
        case "select-one":
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
        case "number":
        case "range":
        case "text":
        case "textarea":
        default: {
          setValues((dispatch, getValues) => {
            const draft = getValues();
            set(draft, name, value);
            dispatch({
              type: "values/update",
              payload: (values) => {
                set(values, name, value);
                return values;
              },
            });

            validateField(name, draft)
              .then((value) => {
                // console.log(value);
                // dispatch({
                //   type: "values/update",
                //   payload: (values) => {
                //     set(values, name, value);
                //     return values;
                //   },
                // });
              })
              .catch((err) => {
                // dispatch({
                //   type: "values/update",
                //   payload: (values) => {
                //     set(values, name, value);
                //     return values;
                //   },
                // });
              });
          });
          break;
        }
      }
    },
    [setValues, getValues, validateField]
  );

  const field = React.useMemo(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
      track("field");
    }

    return {
      onBlur: handleFieldOnBlur,
      onChange: handleFieldOnChange,
    };
  }, [handleFieldOnBlur, handleFieldOnChange]);

  const createSubmitHandler: CreateSubmitHandler<FormValues> = React.useMemo(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
      track("createSubmitHandler");
    }

    return (onSuccess, onError?) => (event) => {
      event.preventDefault();

      const el = event.currentTarget;
      const form = el.closest("form");

      setSubmitting(true);

      return validateForm().then(({ values, errors, yupErrors }) => {
        if (errors) {
          setSubmitting(false);

          if (submitFocusError) {
            focusFirstError(form, yupErrors, focusMapper);
          }

          if (onError) {
            return onError(errors, getValues(), yupErrors);
          }

          return;
        }

        return onSuccess(values);
      });
    };
  }, [validateForm, submitFocusError, focusMapper, getValues]);

  const formBag = React.useMemo(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
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
      setDirty,
      setSubmitting,
      setTouched: setTouchedProxy,
      setValue,
      setValues: setValuesProxy,
      validateForm,
      validateField,
    } as FormBagContext<FormValues>;
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
    setDirty,
    setSubmitting,
    setTouchedProxy,
    setValue,
    setValuesProxy,
    validateForm,
    validateField,
  ]);

  const FormProvider = React.useMemo(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
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
    isDirty: dirty,
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
