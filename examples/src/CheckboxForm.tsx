import * as React from "react";
import { useForm } from "../../src/index";

import * as Yup from "yup";
import { Field } from "./Field";

// interface FormValues {

// }

export const CheckboxForm = () => {
  const {
    createSubmitHandler,
    field,
    FormProvider,
    values,
    getValue,
    setValue,
    touched,
    errors,
  } = useForm<{
    gender: string;
  }>({});

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
            <legend className="col-form-label col-sm-2 pt-0">Gender</legend>
            <div className="col-sm-10">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="male"
                  value="male"
                  checked={getValue((v) => v.gender) === "male"}
                  {...field}
                />
                <label className="form-check-label" htmlFor="male">
                  Male
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="female"
                  value="female"
                  checked={getValue("gender") === "female"}
                  {...field}
                />
                <label className="form-check-label" htmlFor="female">
                  Female
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="unknown"
                  value="unknown"
                  checked={getValue("gender") === "unknown"}
                  {...field}
                />
                <label className="form-check-label" htmlFor="unknown">
                  Prefer not to say
                </label>
              </div>
            </div>
          </div>
        </fieldset>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </FormProvider>
  );
};
