import * as React from "react";
import { useForm } from "../../src";
import * as Yup from "yup";

// Define your Yup schema
const schema = Yup.object({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
}).defined();

const focusMapper = {
  firstName: "input[name=pseudoFirstName]",
  lastName: "#pseudoLastName",
};

export const FocusMapper = () => {
  const pseudoLastNameRef = React.useRef<HTMLInputElement>(null);
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
    focusMapper: focusMapper,
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

      <div>
        <input name="pseudoFirstName" />
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

      <div>
        <input id="pseudoLastName" />
      </div>

      <button className="btn btn-primary" type="submit">
        Submit
      </button>
      <div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={(e) => {
            console.dir(e.target);
          }}
        >
          Submit alt
        </button>
      </div>
    </form>
  );
};
