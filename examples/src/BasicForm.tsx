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

      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
};
