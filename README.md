# DEPRECATION NOTICE
This lib was built before yup migrated to typescript (from versions 0.30 onwards). The types from 0.29.x to 0.30.x + have changed somewhat and more than likely this library will not be updated to support versions past 0.29.x (atleast nothing is planned yet, and we have started using Zod instead for new projects). We still use yup 0.29.x in production with this library, but going forward I can't recommend new projects use this.

# react-yup

This is my attempt to solve form validation in React. It takes inspiration from some wonderful existing form libraries notably Formik, React Hook Form, and Final Form, but makes some important decisions that separate the goals of this library with the ones listed.

This form library does not have any other way to validate forms other than with Yup. This is a fundamental design decision.

The goals of this project are:
1. Work out of the box with Yup
2. Provide a simple and minimal API to create basic and advanced web forms powered by Yup
3. Have a great developer experience
4. Align with React as closely as possible (react-yup is built with react context)
5. Not use DOM refs &mdash; all input bindings are through React onChange, onBlur, controlled/uncontrolled value etc.
6. Support server side rendering

Thus, this package does not come bundled with any validation library or any other way to validate a field through regex or other means. If this is something you `require`, this library is not for you and you should use one of the amazing libraries mentioned above.

This package has a peerDependency on Yup, and you must include Yup in your own project too. See installation section below.

It is around ~8kb gzipped (without Yup).

## Installation

```
yarn add yup react-yup
```

```
npm install yup react-yup
```

## Basic usage
- [Basic Form](examples/src/BasicForm.tsx)


## Advanced Usage
- [Basic Form Extended](examples/src/BasicFormExtended.tsx)
- [Advanced Form](examples/src/AdvancedForm.tsx)
- [Bootstrap-Typeahead](examples/src/BootstrapTypeahead.tsx)
- [Pure Form example (form using a pure component/memoized component)](examples/src/PureForm.tsx)
  - See also [PureField](examples/src/Field.tsx#L72) implementation in [Field](examples/src/Field.tsx)
- [Checkbox example](examples/src/CheckboxForm.tsx)
- [Nested Form example](examples/src/NestedForm.tsx)

## Examples

Additionally, you may run the examples in this repository to understand how it works by running `yarn start` within this repository and going to `http://localhost:8080`


## API

## Hooks
### `useForm<T>(options?: UseFormHookOptions<T>): UseFormHookResult<FormValues>`
```
interface UseFormHookOptions<FormValues extends Record<string, unknown>> {
  defaultValues?: ValueState<FormValues>;
  defaultErrors?: ErrorState<FormValues>;
  defaultTouched?: TouchedState<FormValues>;
  validationSchema?: Schema<FormValues>;
  submitFocusError?: boolean;
}

interface UseFormHookResult<FormValues> extends FormBagContext<FormValues> {
  values: ValueState<FormValues>;
  errors: ErrorState<FormValues>;
  touched: TouchedState<FormValues>;
  isValid: boolean;
  isSubmitting: boolean;
  FormProvider: ({ children }: { children: React.ReactNode }) => JSX.Element;
}

// Example usage
const schema = Yup.object({
  firstName: Yup.string().required(),
  nested: Yup.object({
    value: Yup.boolean()
  }).defined()
}).defined();

const {
  isSubmitting,
  isValid,
  FormProvider,
  values,
  touched,
  errors,
  ...formBag
} = useForm({
  validationSchema: schema,
  defaultValues: {
    firstName: "hello",
    nested: {
      value: true,
    }
  },
  defaultErrors: {
    firstName: "First name is required"
  },
  defaultTouched: {
    firstName: true
  }
});

```
### `useFormBag<FormValues extends Record<string, unknown>>(): FormBagContext<FormValues>`

useFormBag will use the closest parent `<FormProvider />` context provided by the `useForm()` hook.

Read more at FormProvider.

```
export const Field = <FormValues extends Record<string, unknown>>({
  label,
  name,
  ...rest
}: FieldProps): JSX.Element => {
  if (!name) {
    throw Error("No name passed to Field");
  }

  const { getValue, getError, isTouched, field } = useFormBag<FormValues>();

  const value = getValue(name) || "";
  const error = getError(name);
  const touched = isTouched(name);

  React.useEffect(() => {
    track("Field");
  }, [getValue, getError, isTouched, field]);

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        className="form-control"
        id={name}
        name={name}
        value={value as string | number | string[]}
        {...rest}
        {...field}
      />
      {error && touched && (
        <div className="invalid-feedback d-block mb-2">{error}</div>
      )}
    </div>
  );
};
```

## FormBag Context

```
interface FormBagContext<FormValues> {
  createSubmitHandler: CreateSubmitHandler<FormValues>;
  field: Field;
  getError: {
    (name: string): string | undefined;
    (callback: (errors: ErrorState<FormValues>) => string | undefined):
      | string
      | undefined;
  };
  getErrors: () => ErrorState<FormValues>;
  getValue: {
    (name: string): unknown;
    <R>(callback: (values: ValueState<FormValues>) => R | undefined):
      | R
      | undefined;
  };
  getValues: () => ValueState<FormValues>;
  getTouched: () => TouchedState<FormValues>;
  isTouched: {
    (name: string): boolean;
    (callback: (touched: TouchedState<FormValues>) => undefined | boolean):
      | undefined
      | boolean;
  };
  isChecked: IsChecked;
  setSubmitting: (isSubmitting: boolean) => void;
  setTouched: SetTouched<FormValues>;
  setValue: SetValue;
  setValues: SetValues<FormValues>;
  resetErrors: () => void;
  validateForm: (
    options?: ValidateFormOptions
  ) => ValidateFormResult<FormValues>;
  validateField: (
    name: string,
    values: ValueState<FormValues>,
    shouldTouch?: boolean
  ) => Promise<unknown>;
}
```

## Methods
### `createSubmitHandler`
A higher order function which accepts an onSuccess callback and an optional onError callback, and returns a function that accepts an event of type React.FormEvent.

The returned function fires preventDefault() on the React.FormEvent object.

```
type CreateSubmitHandler<FormValues> = (
  onSuccess: (values: ValueState<FormValues>) => void,
  onError?:
    | ((
        errors: ErrorState<FormValues>,
        values: ValueState<FormValues>,
        yupErrors: ValidationError
      ) => void)
    | undefined
) => (event: React.FormEvent<HTMLFormElement>) => void;

// Usage inside a form component
const { createSubmitHandler } = useForm();
const handleSubmit = React.useMemo(() => {
  return createSubmitHandler(values => {
    // form is valid
  }, (errors, values, yupErrors) => {
    // form is invalid
  });
}, [createSubmitHandler])

return <form onSubmit={handleSubmit} />
```

If you want to validate the form with this library but preserve the default browser form submission, create a `ref` to the form element and `submit` the form in the createSubmitHandler.

```

const formRef = React.useRef<HTMLFormElement>(null);

const handleSubmit = React.useMemo(() => {
  return createSubmitHandler(values => {
    formRef.current.submit();
  });
}, [createSubmitHandler])

<form ref={formRef} onSubmit={handleSubmit} />
```

### `getValue`
This method will return the value of the desired input[name]. This method will return undefined if there is no value set from `defaultValues` or if the field has not been interacted with (onBlur/onChange), therefore like when using `values`, you should always have a fallback value for when this method returns undefined.

```
function getValue(name: string): unknown;
function getValue<R>(callback: (values: ValueState<FormValues>) => R): R;

// Usage
const { getValue, field } = useForm();

getValue("firstName")
getValue(values => values.firstName)

// Note the fallback value ""
<input value={getValue("firstName") || ""} />
```

### `getValues`
This method will return you all the values as an object. The return value is the same as `values`.

This function is stable which means you can pass it to useMemo, useCallback, useEffect etc.

```
function getValues(): ValueState<FormValues>

// Usage
const { getValues, values } = useForm();

console.log(values === getValues()); // true
```


### `getError`
```
function getError(name: string): string | undefined;
function getError(
  callback: (errors: ErrorState<FormValues>) => string | undefined
): string | undefined;

// Usage
const { getError, field } = useForm();

getError("firstName")
getError(errors => errors.firstName)
```

### `getErrors`
This method will return you all the errors as an object. If there are no errors, it will return an empty object `{}`.

This function is stable which means you can pass it to useMemo, useCallback, useEffect etc.
```
function getErrors(): ErrorState<FormValues>;

// Usage
const { getErrors, errors } = useForm();

console.log(errors === getErrors()); // true
```

### `getTouched`
This method will return you all touched fields as an object. If there are no touched fields, it will return an empty object `{}`.

This function is stable which means you can pass it to useMemo, useCallback, useEffect etc.
```
function getTouched(): TouchedState<FormValues>;

const { getTouched, touched } = useForm();

console.log(touched === getTouched()); // true
```

### `isTouched`
```
function isTouched(name: string): boolean;
function isTouched(callback: (touched: TouchedState<FormValues>) => undefined | boolean):
    | undefined
    | boolean;

// Usage
const { isTouched } = useForm();

isTouched("firstName");
isTouched(touched => touched.firstName);
```

### `isChecked`
This method is mainly used in reusable form checkbox inputs. It does not provide any type checking. If you need type checking, opt to use `values` or `getValue`.

```
function isChecked(name: string, value?: never): boolean;
function isChecked(
  name: string,
  value: (curValue: any) => boolean
): boolean;
function isChecked(name: string, value: any): boolean;

// Usage
const { field, isChecked } = useForm();

<input type="checkbox" name="confirm" checked={isChecked("confirm")} />

<input
  type="radio"
  name="gender"
  value="male"
  checked={isChecked("gender", "male")}
  {...field}
/>

<input
  type="radio"
  name="gender"
  value="male"
  checked={isChecked("gender", value => value === "male")}
  {...field}
/>
```

### `setSubmitting`
`isSubmitting` will be set to `true` on a successful submission (when onSubmit fires and the onSuccess callback is fired). It is your responsibility to reset `isSubmitting` back to `false` in your callback if doing async operations.
```
function setSubmitting(isSubmitting: boolean) => void;

// Usage
const { setSubmitting, isSubmitting, createSubmitHandler } = useForm();


const handleSubmit = React.useMemo(() => {
  return createSubmitHandler(values => {
    fetch("")
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
      });
  });
}, [createSubmitHandler, setSubmitting])

<form onSubmit={handleSubmit}>
  <button type="submit" disabled={isSubmitting}>Submit</button>
</form>
```

### `setTouched`
```
function setTouched(
  callback: (touched: TouchedState<FormValues>) => TouchedState<FormValues>,
)

// Usage
const { setTouched } = useForm();
setTouched(touched => {
  touched.firstName = true;
  return touched;
});
```


### TODO :
- setValue: SetValue;
- setValues: SetValues<FormValues>;
- resetErrors: () => void;
- validateForm: (
    options?: ValidateFormOptions
  ) => ValidateFormResult<FormValues>;
- validateField: (
    name: string,
    values: ValueState<FormValues>,
    shouldTouch?: boolean
  ) => Promise<unknown>;
- FormProvider
- isValid
- isSubmitting


## Typescript

This package was built with Typescript and includes typings. When you provide a Yup schema to validationSchema, you will get autocompletion when accessing properties in `touched`, `values`, `errors` etc.
