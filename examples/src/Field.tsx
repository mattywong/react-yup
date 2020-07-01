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

interface InputFieldProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: React.ReactNode;
}

export const FieldCheck: React.FC<InputFieldProps> = (props) => {
  const { label, ...rest } = props;
  const { value, id, name } = rest;

  const { isChecked } = useFormBag();

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        {...rest}
        // checked={isChecked(name, value)}
        checked={isChecked(name)}
        // checked={isChecked(name, (v) => {
        //   return value === v;
        // })}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
