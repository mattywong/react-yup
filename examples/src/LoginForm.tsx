import * as React from "react";

// react-yup exports two hooks
// in this example, only useForm is shown
// to see an example of useFormBag,
// see Field.tsx in examples/src

import { useForm, useFormBag } from "../../src";
import * as Yup from "yup";

// Define your Yup schema
const schema = Yup.object({
  username: Yup.string().required().min(2),
  password: Yup.string().required().min(1),
}).defined();

export const LoginForm = () => {
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

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler(
      (values) => {
        // form is valid and you have access to values
        console.log(values);
        formRef.current.submit();
      },
      (errors, values, yupErrors) => {
        // form is invalid and you have access to errors
        // this callback function is optional
        console.log(errors);
        console.log(values);
        console.log(yupErrors);
      }
    );
  }, [createSubmitHandler]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} method="POST">
      <div className="form-group">
        <label htmlFor="username">Username</label>
        {errors.username && touched.username && <p>{errors.username}</p>}
        <input
          type="text"
          className="form-control"
          id="username"
          name="username"
          value={values.username || ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        {errors.password && touched.password && <p>{errors.password}</p>}
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={values.password || ""}
          {...field}
        />
      </div>

      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
};
