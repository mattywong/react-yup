# @eduka/form

This is an attempt to solve the form validation problem in React.

This package does not come bundled with any validation library, and for now, unless for better reasons, I have decided to align the goals of this library with the wonderful [Yup](https://github.com/jquense/yup) schema validation library. The `validationSchema` option in the exported `useForm` hook accepts any Yup schema.

This package has a peerDependency on Yup, and you must include Yup in your own project too. See installation section below.


## Documentation

Generated documentation is available in the /docs/ folder.


## Examples

Additionally, you may run the examples in this repository to understand how it works by running `yarn start` within this repository and going to `http://localhost:8080`

## Installation

Setup initial .npmrc file in your project root to read from the @eduka Azure package registry

You can find the setup guide:
1. Go to Azure devops
2. Click "Artifcats" link in the sidebar
3. Click "npm"
4. Follow setup instructions there

```
yarn add yup @eduka/form
```

```
npm install yup @eduka/form
```


## Basic usage

```
import { useForm } from '@eduka/form';
import * as Yup from 'yup';

const schema = Yup.object({
    firstName: Yup.string().required(),
    lastName: Yup.string()
}).defined()


type FormValues = Yup.InferType<typeof schema>


const BasicForm = () => {
    const { values, touched, errors, field, createSubmitHandler } = useForm<FormValues>();

    return (
        <form>
            <input type="text" name="firstName" value={values.firstName} {...field} />
            <input type="text" name="lastName" value={values.lastName} {...field} />
        </form>
    );
}
```

## Typescript

This package was built with Typescript and includes typings. If you provide a generic interface to `useForm`, you will get autocompletion of your schema when accessing properties in `touched`, `values`, `errors` etc.