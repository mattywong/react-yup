import * as React from "react";
import { useForm } from "../../src/index";

import * as Yup from "yup";
import { Field } from "./Field";

const schema = Yup.object({
  email: Yup.string().required().email().defined(),
  firstName: Yup.string().required().defined(),
  lastName: Yup.string().required().defined(),
  gender: Yup.mixed().oneOf(["male", "female", "unknown"]).defined(),
}).defined();

type FormValues = Yup.InferType<typeof schema>;

export const BasicForm = () => {
  const {
    createSubmitHandler,
    field,
    FormProvider,
    values,
    getValue,
    touched,
    errors,
  } = useForm<FormValues>({
    validationSchema: schema,
    defaultValues: {},
    defaultErrors: {},
    defaultTouched: {},
  });

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler((values) => {
      console.log(values);
    });
  }, [createSubmitHandler]);

  return (
    <FormProvider>
      <form onSubmit={handleSubmit}>
        <Field name="email" label="Email Address" />
        <Field name="firstName" label="First name" />

        <div className="form-group">
          <label htmlFor="lastName">Last name</label>

          <input
            className="form-control"
            id="lastName"
            type="text"
            name="lastName"
            {...field}
            value={values.lastName || ""}
          />
          {errors.lastName && touched.lastName && (
            <div className="invalid-feedback d-block mb-2">
              {errors.lastName}
            </div>
          )}
        </div>
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
                  checked={values.gender === "male"}
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
                  checked={getValue((v) => v.gender) === "female"}
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
                  checked={getValue((v) => v.gender) === "unknown"}
                  {...field}
                />
                <label className="form-check-label" htmlFor="unknown">
                  Prefer not to say
                </label>
              </div>
            </div>
          </div>
          {errors.gender && touched.gender && (
            <div className="invalid-feedback d-block mb-2">{errors.gender}</div>
          )}
        </fieldset>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </FormProvider>
  );
};
