import * as React from "react";
import { useForm, useFormBag } from "../../src/index";

import * as Yup from "yup";

interface InputFieldProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = (props) => {
  const { label, ...rest } = props;
  const { value, id, name } = rest;

  const { isChecked } = useFormBag();

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        {...rest}
        checked={isChecked(name, value)}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

const SCHEMA = Yup.object({
  gender: Yup.array().of(Yup.string()).required(),
  genderNoArray: Yup.mixed()
    .when("isArray", {
      is: (v) => Array.isArray(v),
      then: Yup.array().of(Yup.string()),
      otherwise: Yup.string(),
    })
    .required(),
  confirm: Yup.boolean(),
}).defined();

export const CheckboxForm = () => {
  const {
    createSubmitHandler,
    field,
    FormProvider,
    values,
    getValue,
    setValue,
    isChecked,
    touched,
    errors,
  } = useForm<Yup.InferType<typeof SCHEMA>>({
    validationSchema: SCHEMA,
    defaultValues: {
      confirm: false,
    },
  });

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler((values) => {
      console.log(values);
    });
  }, [createSubmitHandler]);

  return (
    <FormProvider>
      <form onSubmit={handleSubmit}>
        <fieldset className="form-group">
          <div className="row">
            <legend className="col-form-label col-sm-2 pt-0">
              Gender (gender[])
            </legend>
            <div className="col-sm-10">
              <div>
                <InputField
                  name="gender[]"
                  type="checkbox"
                  id="male"
                  value="male"
                  label="Male"
                  {...field}
                />
                <InputField
                  name="gender[]"
                  type="checkbox"
                  id="female"
                  value="female"
                  label="Female"
                  {...field}
                />
                <InputField
                  name="gender[]"
                  type="checkbox"
                  id="unknown"
                  value="unknown"
                  label="Prefer not to say"
                  {...field}
                />
              </div>
              {errors.gender && touched.gender && (
                <div className="invalid-feedback d-block mb-2">
                  {errors.gender}
                </div>
              )}
            </div>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <div className="row">
            <legend className="col-form-label col-sm-2 pt-0">
              Gender (no array)
            </legend>
            <div className="col-sm-10">
              <div>
                <InputField
                  name="genderNoArray"
                  type="checkbox"
                  id="genderNoArray.male"
                  value="male"
                  label="Male"
                  {...field}
                />
                <InputField
                  name="genderNoArray"
                  type="checkbox"
                  id="genderNoArray.female"
                  value="female"
                  label="Female"
                  {...field}
                />
                <InputField
                  name="genderNoArray"
                  type="checkbox"
                  id="genderNoArray.unknown"
                  value="unknown"
                  label="Prefer not to say"
                  {...field}
                />
              </div>
              {errors.genderNoArray && touched.genderNoArray && (
                <div className="invalid-feedback d-block mb-2">
                  {errors.genderNoArray}
                </div>
              )}
            </div>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <div className="row">
            <legend className="col-form-label col-sm-2 pt-0">
              Confirm (no value)
            </legend>
            <div className="col-sm-10">
              <InputField
                name="confirm"
                type="checkbox"
                id="confirm"
                label="Confirm"
                {...field}
              />
            </div>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <div className="row">
            <legend className="col-form-label col-sm-2 pt-0">
              Confirm (with value)
            </legend>
            <div className="col-sm-10">
              <InputField
                name="confirmWithValue"
                type="checkbox"
                id="confirmWithValue"
                label="Confirm with value"
                value="Yes"
                {...field}
              />
            </div>
          </div>
        </fieldset>
        <pre>{JSON.stringify({ errors, touched, values }, null, 2)}</pre>

        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </FormProvider>
  );
};
