import * as React from "react";
import { useForm } from "../../src/index";

import * as Yup from "yup";
import { Field, FieldCheck } from "./Field";
import { RecursivePartial } from "../../src/types";

const schema = Yup.object({
  form: Yup.object({
    email: Yup.string().email().required("Email is required").defined(),
    firstName: Yup.string().required("First name is required").defined(),
    lastName: Yup.string(),
    address: Yup.object({
      number: Yup.number(),
      street: Yup.string(),
    }),
  }).defined(),
  shouldValidate: Yup.boolean(),
}).defined();

type FormValues = Yup.InferType<typeof schema>;

interface NestedFormProps {
  defaultValues?: RecursivePartial<FormValues>;
}

export const NestedForm: React.FC<NestedFormProps> = ({ defaultValues }) => {
  const [validationSchema, setValidationSchema] = React.useState<
    Yup.Schema<FormValues> | undefined
  >(schema);

  const {
    createSubmitHandler,
    field,
    FormProvider,
    values,
    getValue,
    getError,
    isTouched,
    touched,
    errors,
    setValue,
    setValues,
  } = useForm<FormValues>({
    validationSchema,
    defaultValues,
  });

  React.useEffect(() => {
    if (values.shouldValidate) {
      setValidationSchema(schema);
    } else {
      setValidationSchema(void 0);
    }
  }, [values.shouldValidate]);

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler((values) => {
      console.log(values);
    });
  }, [createSubmitHandler]);

  return (
    <FormProvider>
      <div>
        <button
          onClick={(e) => {
            setValues((v) => {
              // v.form.address = {
              //   number: 22,
              //   street: "test",
              // };

              v.form = {
                ...v.form,
                firstName: "test",
              };

              return v;
            });
          }}
        >
          Update first name
        </button>
      </div>
      <FieldCheck
        id="shouldValidate"
        label="Should validate"
        name="shouldValidate"
        type="checkbox"
        {...field}
      />
      <form onSubmit={handleSubmit}>
        <Field name="form.email" label="Email Address" type="email" />
        <Field name="form.firstName" label="First name" />
        <Field name="form.lastName" label="First name" />
        <Field name="form.address.street" label="Street" />

        <fieldset className="form-group">
          <div className="row">
            <legend className="col-form-label col-sm-2 pt-0">Gender</legend>
            <div className="col-sm-10">
              <div className="form-check">
                <FieldCheck
                  id="male"
                  label="Male"
                  value="male"
                  name="form.gender"
                  type="radio"
                  {...field}
                />
              </div>
              <div className="form-check">
                <FieldCheck
                  id="female"
                  label="Female"
                  value="female"
                  name="form.gender"
                  type="radio"
                  {...field}
                />
              </div>
              <div className="form-check">
                <FieldCheck
                  id="unknown"
                  label="Prefer not to say"
                  value="unknown"
                  name="form.gender"
                  type="radio"
                  {...field}
                />
              </div>
            </div>
          </div>
        </fieldset>

        <Field label="Age" name="form.age" type="number" />
        <Field label="Range" name="form.range" type="range" />
        <Field label="Color" name="form.color" type="color" />
        <Field label="Date" name="form.date" type="date" />
        <Field
          label="DateTime local"
          name="form.dateTimeLocal"
          type="datetime-local"
        />
        <Field label="Time" name="form.time" type="time" />
        <Field label="File" name="form.file" type="file" />
        <Field label="Month" name="form.month" type="month" />
        <Field label="Password" name="form.password" type="password" />
        <Field label="Search" name="form.search" type="search" />
        <Field label="Telephone" name="form.telephone" type="tel" />
        <Field label="URL" name="form.url" type="url" />
        <Field label="Week" name="form.week" type="week" />
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </FormProvider>
  );
};
