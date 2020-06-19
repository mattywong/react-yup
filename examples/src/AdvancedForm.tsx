import * as React from "react";
import { useForm } from "../../src/index";

import * as Yup from "yup";
import { Field, FieldCheck } from "./Field";

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
}).defined();

type FormValues = Yup.InferType<typeof schema>;

export const AdvancedForm = () => {
  const {
    createSubmitHandler,
    field,
    FormProvider,
    validateForm,
    values,
    isSubmitting,
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

      // do things async
      return new Promise((res, rej) => {
        setTimeout(res, 3000);
      }).then((d) => {
        alert("Succes");
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
                email: "test.com",
                firstName: "test",
                address: {
                  ...v.form?.address,
                  street: "Changed St",
                },
              };
            }, true);
          }}
        >
          Update first name
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
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
        >
          Submit
        </button>
      </form>
    </FormProvider>
  );
};
