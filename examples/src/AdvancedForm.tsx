import * as React from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "../../src/index";

import * as Yup from "yup";
import { Field, FieldCheck } from "./Field";

const schema = Yup.object({
  form: Yup.object({
    email: Yup.string().email().required("Email is required"),
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string(),
    address: Yup.object({
      number: Yup.number(),
      street: Yup.string(),
    }),
    description: Yup.string().required("Description is required"),
  }).defined(),
}).defined();

type FormValues = Yup.InferType<typeof schema>;

export const AdvancedForm = () => {
  const { push } = useHistory();
  const {
    createSubmitHandler,
    field,
    FormProvider,
    validateForm,
    values,
    errors,
    touched,
    isSubmitting,
    setSubmitting,
    setValue,
    setValues,
    getErrors,

    resetErrors,
  } = useForm<FormValues>({
    validationSchema: schema,
    defaultValues: {
      form: {
        address: {
          number: 22,
          street: "yea boi",
        },
      },
    },
  });

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler((values) => {
      console.log(values);
      // setSubmitting(false);

      // do things async
      return new Promise((res, rej) => {
        setTimeout(res, 3000);
      }).then((d) => {
        // alert("Succes");
        push("/success");
      });
    });
  }, [createSubmitHandler]);

  return (
    <FormProvider>
      <div>
        <button
          onClick={(e) => {
            setValues((v) => {
              v.form = {
                ...v.form,
                email: "hello@test.com",
                firstName: "test",
                address: {
                  ...v.form?.address,
                  street: "Changed St",
                },
                description: "Hello world",
              };
            }, true);
          }}
        >
          Fill form
        </button>
        <button
          onClick={(e) => {
            console.log(getErrors());
          }}
        >
          Log stats
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <Field name="form.email" label="Email Address" type="email" />
        <Field name="form.firstName" label="First name" />
        <Field name="form.lastName" label="Last name" />
        <Field name="form.address.number" label="Number" />
        <Field name="form.address.street" label="Street" />
        <div className="form-group">
          <label htmlFor="form.description">Description</label>
          {errors.form?.description && touched.form?.description && (
            <div className="invalid-feedback d-block mb-2">
              {errors.form?.description}
            </div>
          )}
          <textarea
            id="form.description"
            name="form.description"
            rows={3}
            className="form-control"
            {...field}
          />
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting" : "Submit"}
        </button>
      </form>
    </FormProvider>
  );
};
