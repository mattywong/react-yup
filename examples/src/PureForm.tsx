import * as React from "react";

import * as Yup from "yup";

import { useForm } from "../../src";

import { PureField } from "./Field";

const SCHEMA = Yup.object()
  .shape({
    firstName: Yup.string().min(2).required(),
    lastName: Yup.string().min(2).required(),
    age: Yup.number().required(),
  })
  .defined();

/**
 * <PureField /> will not rerender unless one of it's props changes
 */
export const PureForm = () => {
  const {
    field,
    getValue,
    getError,
    isTouched,
    values,
    createSubmitHandler,
  } = useForm({
    validationSchema: SCHEMA,
  });

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler((v) => {
      console.log(v);
    });
  }, [createSubmitHandler]);

  return (
    <form onSubmit={handleSubmit}>
      <PureField
        label="First name"
        name="firstName"
        id="firstName"
        {...field}
        value={getValue((v) => v.firstName) || ""}
        error={getError((e) => e.firstName)}
        touched={isTouched((t) => t.firstName)}
      />
      <PureField
        label="Last name"
        name="lastName"
        id="lastName"
        {...field}
        value={getValue((v) => v.lastName) || ""}
        error={getError((e) => e.lastName)}
        touched={isTouched((t) => t.lastName)}
      />
      <pre>{JSON.stringify({ values }, null, 2)}</pre>
      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
};
