import * as React from "react";
import { useFormBag } from "../../src/index";
import { track } from "../../src/util/tracker";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Field = <FormValues extends Record<string, unknown>>({
  label,
  name,
  ...rest
}: FieldProps): JSX.Element => {
  if (!name) {
    throw Error("No name passed to Field");
  }

  const { getValue, getError, isTouched, field } = useFormBag<FormValues>();

  const value = getValue(name) || "";
  const error = getError(name);
  const touched = isTouched(name);

  React.useEffect(() => {
    track("Field");
  }, [getValue, getError, isTouched, field]);

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        className="form-control"
        id={name}
        name={name}
        value={value as string | number | string[]}
        {...rest}
        {...field}
      />
      {error && touched && (
        <div className="invalid-feedback d-block mb-2">{error}</div>
      )}
    </div>
  );
};

export const FieldCheck = <FormValues extends Record<string, unknown>>({
  label,
  id,
  name,
  value,
  ...rest
}: FieldProps): JSX.Element => {
  if (!name) {
    throw Error("No name passed to Field");
  }

  const { getValue, getError, isTouched, field } = useFormBag<FormValues>();

  const internalValue = getValue(name) || "";

  React.useEffect(() => {
    track("Field");
  }, [getValue, getError, isTouched, field]);

  return (
    <>
      <input
        className="form-check-input"
        name="form.gender"
        id={id}
        value={value}
        checked={internalValue === value}
        {...field}
        {...rest}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </>
  );
};
