import * as React from "react";
import { useFormBag } from "../../src/index";
import { track } from "../../src/util/tracker";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * By using the useFormBag() hook, we are expecting the Field component
 * to be executed every render, so we do not want to wrap a component like this
 * inside a React.memo as otherwise it will only update when one of it's props changes,
 * which will never change as we are getting the value, error and touched state of the field
 * inside the Field component itself.
 *
 * Note that this doesn't affect DOM rendering, only the React lifecycle.
 *
 * If you really need/want to opt out of the React rendering lifecycle with React.memo,
 * you will have to pass the value, error and touched values to the Component itself and mark
 * it as a PureComponent or wrap the component with React.memo.
 *
 * See PureField below for an implementation of this,
 * and PureForm of how it's all used together.
 * */
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

interface PureFieldProps extends FieldProps {
  error?: string;
  touched?: boolean;
}

const _PureField = <FormValues extends Record<string, unknown>>({
  label,
  name,
  error,
  touched,
  ...rest
}: PureFieldProps): JSX.Element => {
  if (!name) {
    throw Error("No name passed to Field");
  }

  React.useEffect(() => {
    track("PureField");
  }, []);

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input className="form-control" id={name} name={name} {...rest} />
      {error && touched && (
        <div className="invalid-feedback d-block mb-2">{error}</div>
      )}
    </div>
  );
};

export const PureField = React.memo(_PureField);
PureField.whyDidYouRender = true;

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
      <input className="form-check-input" {...rest} checked={isChecked(name)} />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
