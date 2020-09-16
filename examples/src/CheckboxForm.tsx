import * as React from "react";
import { useForm, useFormBag } from "../../src/index";

import { InputField } from "./Field";

import * as Yup from "yup";

const SCHEMA = Yup.object({
  gender: Yup.array().of(Yup.string()).required(),
  genderNoArray: Yup.lazy((v) => {
    if (Array.isArray(v)) {
      return Yup.array().of(Yup.string());
    }

    return Yup.string();
  }),
  numbersArray: Yup.array().of(Yup.number()).required(),
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
  } = useForm({
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

        <fieldset>
          <div className="row">
            <legend className="col-form-label col-sm-2 pt-0">
              Pick a number
            </legend>
            <div className="col-sm-10">
              <div>
                <InputField
                  name="numbersArray[]"
                  type="checkbox"
                  id="numbersArray.1"
                  value={1}
                  label="One"
                  {...field}
                />
                <InputField
                  name="numbersArray[]"
                  type="checkbox"
                  id="numbersArray.2"
                  value={2}
                  label="Two"
                  {...field}
                />
                <InputField
                  name="numbersArray[]"
                  type="checkbox"
                  id="numbersArray.3"
                  value={3}
                  label="Three"
                  {...field}
                />
              </div>
              {errors.numbersArray && touched.numbersArray && (
                <div className="invalid-feedback d-block mb-2">
                  {errors.numbersArray}
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
