import * as React from "react";

// react-yup exports two hooks
// in this example, only useForm is shown
// to see an example of useFormBag,
// see Field.tsx in examples/src

import { useForm, useFormBag } from "../../src";
import * as Yup from "yup";

// Define your Yup schema
const schema = Yup.object({
  firstName: Yup.string().required().min(2),
  lastName: Yup.string().required().min(1),
  gender: Yup.number(),
  confirm: Yup.boolean().oneOf([true]).required(),
}).defined();

export const BasicForm = () => {
  // By providing a schema to validationSchema,
  // Typescript will infer your form data and give you auto completion
  // for values, touched, errors and some functions like setValues
  const {
    values,
    getValues,
    touched,
    errors,
    field,
    createSubmitHandler,
    isChecked,
  } = useForm({
    validationSchema: schema,
  });

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler(
      (values) => {
        // form is valid and you have access to values
        console.log(values);
      },
      (errors, values, yupErrors) => {
        // form is invalid and you have access to errors
        // this callback function is optional
        console.log(errors);
        console.log(values);
        console.log(yupErrors);
      }
    );
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <pre>
        {JSON.stringify(
          {
            values,
            errors,
            touched,
          },
          null,
          2
        )}
      </pre>
      <div className="form-group">
        <label htmlFor="firstName">First name</label>
        {errors.firstName && touched.firstName && <p>{errors.firstName}</p>}
        <input
          type="text"
          className="form-control"
          id="firstName"
          name="firstName"
          value={values.firstName || ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last name</label>
        {errors.lastName && touched.lastName && <p>{errors.lastName}</p>}
        <input
          type="text"
          className="form-control"
          id="lastName"
          name="lastName"
          value={values.lastName || ""}
          {...field}
        />
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        {errors.gender && touched.gender && <p>{errors.gender}</p>}
        <select
          className="custom-select"
          id="gender"
          name="gender"
          value={values.gender || ""}
          {...field}
        >
          <option value={1}>Male</option>
          <option value={2}>Female</option>
        </select>
      </div>

      <div className="form-group">
        {errors.confirm && touched.confirm && <p>{errors.confirm}</p>}
        <div className="form-check">
          <input
            id="confirm"
            type="checkbox"
            checked={isChecked("confirm")}
            name="confirm"
            {...field}
          />
          <label htmlFor="confirm">Confirm</label>
        </div>
      </div>

      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
};
