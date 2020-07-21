# react-yup

This is an attempt to solve the form validation problem in React.

This package does not come bundled with any validation library, and for now, unless for better reasons, I have decided to align the goals of this library with the wonderful [Yup](https://github.com/jquense/yup) schema validation library. The `validationSchema` option in the exported `useForm` hook accepts any Yup schema.

This package has a peerDependency on Yup, and you must include Yup in your own project too. See installation section below.


## Documentation

Generated documentation is available in the /docs/ folder.


## Examples

Additionally, you may run the examples in this repository to understand how it works by running `yarn start` within this repository and going to `http://localhost:8080`

## Installation

```
yarn add yup react-yup
```

```
npm install yup react-yup
```


## Basic usage

```
// react-yup exports two hooks
import { useForm, useFormBag } from 'react-yup';
import * as Yup from 'yup';

const schema = Yup.object({
    firstName: Yup.string().required(),
    lastName: Yup.string()
}).defined()


const BasicForm = () => {

    // By providing a schema to validationSchema,
    // Typescript will infer your form data and give you auto completion
    // for values, touched, errors and some functions like setValues
    const { values, touched, errors, field, createSubmitHandler, setValues } = useForm({
        validationSchema: schema
    });


    const handleSubmit = React.useMemo(() => {
        return createSubmitHandler(values => {
            // form is valid and you have access to values

            fetch("/register", {
                method: "POST",
                body: JSON.stringify(values)
            }).then(res => {
                if (res.ok) {
                    return res.json();
                }
            })
        }, (errors) => {
            // form is invalid and you have access to errors
            // this callback function is optional
        });
    }, [])

    return (
        <form onSubmit={handleSubmit}>
            {errors.firstName && touched.firstName && <p>{errors.firstName}</p>}
            <input type="text" name="firstName" value={values.firstName} {...field} />

            {errors.lastName && touched.lastName && <p>{errors.lastName}</p>}
            <input type="text" name="lastName" value={values.lastName} {...field} />

            <button type="submit>Submit</button>
        </form>
    );
}
```

## Typescript

This package was built with Typescript and includes typings. When you provide a Yup schema to validationSchema, you will get autocompletion when accessing properties in `touched`, `values`, `errors` etc.