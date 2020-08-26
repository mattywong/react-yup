/**
 * BasicFormExtended takes the principles of BasicForm,
 * and extends on those foundations to create things slightly more complex.
 *
 * If you are viewing this inside via an IDE with Typescript like VSCode,
 * there are comments in the code that will tell you to try change
 * a variable to see how Typescript autocompletion works
 */

import * as React from "react";
import { useForm } from "../../src/index";

import * as Yup from "yup";
import { Field } from "./Field";

export const BasicFormExtended = () => {
  const [shouldValidate, setShouldValidate] = React.useState(true);

  const schema = React.useMemo(() => {
    if (!shouldValidate) {
      return undefined;
    }
    return Yup.object({
      email: Yup.string().required().email().defined(),
      firstName: Yup.string().required().defined(),
      lastName: Yup.string().required().defined(),
      experience: Yup.string().required().defined(),
      colours: Yup.array().of(Yup.string()).required().defined(),
      number: Yup.number().oneOf([1, 2, 3, 4]).required().defined(),
      confirmNumber: Yup.number()
        .oneOf([Yup.ref("number")])
        .defined(),
      freeNumber: Yup.number(),
    }).defined();
  }, [shouldValidate]);

  const {
    createSubmitHandler,
    field,
    FormProvider,
    values,
    getValue,
    touched,
    errors,
    isChecked,
  } = useForm({
    validationSchema: schema,
    defaultValues: {},
    defaultErrors: {},
    defaultTouched: {},
  });

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler(
      (values) => {
        console.log(values);
      },
      (errors, values, yupErrors) => {
        console.log(errors);
        console.log(values);
        console.log(yupErrors);
      }
    );
  }, [createSubmitHandler]);

  return (
    <FormProvider>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          name="shouldValidate"
          id="shouldValidate"
          onChange={(e) => setShouldValidate(e.target.checked)}
          checked={shouldValidate}
        />
        <label className="form-check-label" htmlFor="shouldValidate">
          Should validate
        </label>
      </div>

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
            // Try remove lastName below and press
            // Ctrl + Space to see autocompletion
            value={values.lastName || ""}
          />
          {/* Try autocompleting lastName from touched and errors */}
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
            <legend className="col-form-label col-sm-2 pt-0">
              Pick a number
            </legend>
            {/* 
              This section shows 3 ways you can use to get a value
              1. By checking the values object straight
              2. By passing a callback function to getValue
              3. By passing a string with a related input control's name.
                 This can also be a nested object string reference e.g "user.firstName"
                 If you opt to use option 3, you will not get Typescripts checking.
                 It is mainly used when building primitive input components.
            */}
            <div className="col-sm-10">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="number"
                  id="number__1"
                  value={1}
                  // Try changing 1 to "1"
                  // e.g values.number === "1"
                  checked={values.number === 1}
                  {...field}
                />
                <label className="form-check-label" htmlFor="number__1">
                  One
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="number"
                  id="number__2"
                  value={2}
                  checked={getValue((v) => v.number) === 2}
                  {...field}
                />
                <label className="form-check-label" htmlFor="number__2">
                  Two
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="number"
                  id="number__3"
                  value={3}
                  checked={getValue("number") === 3}
                  {...field}
                />
                <label className="form-check-label" htmlFor="number__3">
                  Three
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="number"
                  id="number__4"
                  value={4}
                  checked={isChecked("number", (value) => value === 4)}
                  {...field}
                />
                <label className="form-check-label" htmlFor="number__4">
                  Four
                </label>
              </div>
            </div>
          </div>
          {errors.number && touched.number && (
            <div className="invalid-feedback d-block mb-2">{errors.number}</div>
          )}
        </fieldset>

        <div className="form-group">
          <Field name="confirmNumber" label="Confirm number" />
        </div>

        <div className="form-group">
          <Field name="freeNumber" label="Free number" />
        </div>

        <div className="form-group">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="confirm"
              id="confirm"
              checked={isChecked("confirm")}
              {...field}
            />
            <label className="form-check-label" htmlFor="confirm">
              Confirm
            </label>
          </div>
        </div>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
      <pre>{JSON.stringify({ values, touched, errors }, null, 4)}</pre>
    </FormProvider>
  );
};
