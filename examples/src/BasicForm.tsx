import * as React from "react";
import { useForm } from "../../src/index";

import * as Yup from "yup";
import { Field } from "./Field";

const schema = Yup.object({
  email: Yup.string().required().email().defined(),
  firstName: Yup.string().required().defined(),
  lastName: Yup.string().required().defined(),
  experience: Yup.string().required().defined(),
  colours: Yup.array().of(Yup.string()).required().defined(),
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
        <div className="form-group">
          <label htmlFor="experience">Experience</label>
          {errors.experience && touched.experience && (
            <div className="invalid-feedback d-block mb-2">
              {errors.experience}
            </div>
          )}
          <select
            id="experience"
            name="experience"
            className="form-control"
            defaultValue=""
            {...field}
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="0 - 5">0 to 5 years</option>
            <option value="5 - 10">5 to 10 years</option>
            <option value="10+ years">10+ years</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="colours">Colours</label>
          {errors.colours && touched.colours && (
            <div className="invalid-feedback d-block mb-2">
              {errors.colours}
            </div>
          )}
          <select
            id="colours"
            name="colours"
            className="form-control"
            multiple
            {...field}
          >
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="orange">Orange</option>
          </select>
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
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </FormProvider>
  );
};
