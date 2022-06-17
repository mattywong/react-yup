import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";

import { useForm, useFormBag } from "../../src";
import * as Yup from "yup";

// Define your Yup schema
const schema = Yup.object({
  firstName: Yup.string().required().min(2),
}).defined();

export const AsyncValidation = () => {
  const [valSchema, setValSchema] = useStableState(() => schema);

  const {
    values,
    getValues,
    touched,
    errors,
    field,
    createSubmitHandler,
    isChecked,
    validateForm,
  } = useForm({
    validationSchema: valSchema,
  });

  console.log("rerendered");

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler(
      (values) => {
        // form is valid and you have access to values
        console.log(values);
      },
      (errors, values, yupErrors) => {
        // form is invalid and you have access to errors
        // this callback function is optional
        console.log(errors);
        console.log(values);
        console.log(yupErrors);
      }
    );
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <pre>
        {JSON.stringify(
          {
            values,
            errors,
            touched,
          },
          null,
          2
        )}
      </pre>
      <div className="form-group">
        <label htmlFor="firstName">First name</label>
        {errors.firstName && touched.firstName && <p>{errors.firstName}</p>}
        <input
          type="text"
          className="form-control"
          id="firstName"
          name="firstName"
          value={values.firstName || ""}
          onChange={field.onChange}
          onBlur={(e) => {
            field.onBlur(e);
            const value = e.target.value;
            setTimeout(() => {
              setValSchema(
                (prev) =>
                  prev
                    .concat(
                      Yup.object({
                        firstName: Yup.string()
                          .required()
                          .min(2)
                          .notOneOf([value], `Can't be ${value}`),
                      })
                    )
                    .defined(),
                (schema) => {
                  validateForm({
                    touch: false,
                    validationSchema: schema,
                  });
                  // setTimeout
                }
              );
            }, 500);
          }}
        />
      </div>

      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
};

/* helper hook */

export function useStableState<T>(initialState: T | (() => T)): typeof info {
  const [state, $setState] = useState(initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  const getState = useCallback(() => {
    return stateRef.current;
  }, []);

  const setState = useCallback(
    (
      nextState: ((prevState: T) => T) | T,
      callback?: (nextState: T) => void
    ) => {
      let _nextState;
      if (typeof nextState === "function") {
        _nextState = (nextState as (prevState: T) => T)(getState());
      } else {
        _nextState = nextState;
      }

      $setState(_nextState);
      callback && callback(_nextState);
    },
    [getState]
  );

  const info = [state, setState, getState] as const;
  return info;
}
