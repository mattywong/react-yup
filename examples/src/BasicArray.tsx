import * as React from "react";

// react-yup exports two hooks
// in this example, only useForm is shown
// to see an example of useFormBag,
// see Field.tsx in examples/src

import { useForm, useFormBag } from "../../src";
import * as Yup from "yup";

// Define your Yup schema
const personSchema = Yup.object({
  firstName: Yup.string().required().min(2),
  lastName: Yup.string().required().min(1),
  gender: Yup.number().required(),
}).defined();

const schema = Yup.object({
  memberNumber: Yup.number().label("Member number").nullable().notRequired(),
  members: Yup.array().of(personSchema).defined(),
}).defined();

export const BasicArray = () => {
  // By providing a schema to validationSchema,
  // Typescript will infer your form data and give you auto completion
  // for values, touched, errors and some functions like setValues
  const {
    values,
    getValue,
    getError,
    isTouched,
    isChecked,
    getValues,
    setValues,
    touched,
    errors,
    field,
    createSubmitHandler,
  } = useForm({
    validationSchema: schema,
    defaultValues: {
      members: [],
    },
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
  console.log(values);

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
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setValues((v) => {
            v.members = [...v.members, {}];
            return v;
          });
        }}
      >
        Add member
      </button>

      <div className="form-group">
        <label htmlFor="memberNumber">Member Number</label>
        <input
          id="memberNumber"
          className="form-control"
          name="memberNumber"
          value={values.memberNumber || ""}
          {...field}
        />
        {!!getError(`memberNumber`) &&
          isTouched(`memberNumber`) &&
          getError(`memberNumber`)}
      </div>

      {values?.members?.map((member, idx) => {
        const fieldName = `members[${idx}]`;

        return (
          <div key={idx}>
            <div className="form-group">
              <label htmlFor={`${fieldName}.firstName`}>First name</label>
              {!!getError(`${fieldName}.firstName`) &&
                isTouched(`${fieldName}.firstName`) &&
                getError(`${fieldName}.firstName`)}
              <input
                type="text"
                className="form-control"
                id={`${fieldName}.firstName`}
                name={`${fieldName}.firstName`}
                value={getValue(`${fieldName}.firstName`) || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${fieldName}.lastName`}>Last name</label>
              {!!getError(`${fieldName}.lastName`) &&
                isTouched(`${fieldName}.lastName`) &&
                getError(`${fieldName}.lastName`)}
              <input
                type="text"
                className="form-control"
                id={`${fieldName}.lastName`}
                name={`${fieldName}.lastName`}
                value={getValue(`${fieldName}.lastName`) || ""}
                {...field}
              />
            </div>

            <fieldset>
              <legend>Gender</legend>
              <div className="custom-control custom-radio">
                <input
                  id={`${fieldName}.gender__male`}
                  name={`${fieldName}.gender`}
                  type="radio"
                  className="custom-control-input"
                  value={0}
                  checked={isChecked(`${fieldName}.gender`, 0)}
                  {...field}
                />
                <label
                  htmlFor={`${fieldName}.gender__male`}
                  className="custom-control-label"
                >
                  Male
                </label>
              </div>
              <div className="custom-control custom-radio">
                <input
                  id={`${fieldName}.gender__female`}
                  name={`${fieldName}.gender`}
                  type="radio"
                  className="custom-control-input"
                  value={1}
                  checked={isChecked(`${fieldName}.gender`, 1)}
                  {...field}
                />
                <label
                  htmlFor={`${fieldName}.gender__female`}
                  className="custom-control-label"
                >
                  Female
                </label>
              </div>
            </fieldset>
          </div>
        );
      })}

      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
};
