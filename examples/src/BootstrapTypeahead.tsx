import * as React from "react";

import { set } from "lodash-es";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

import * as Yup from "yup";

import { useForm } from "../../src/index";

import "react-bootstrap-typeahead/css/Typeahead.css";

const DUMMY_LOCATIONS = [
  "Australia",
  "Africa",
  "America",
  "Russia",
  "Indonesia",
  "China",
  "Brazil",
  "United Kingdom",
  "New Zealand",
];

const SCHEMA = Yup.object({
  form: Yup.object({
    location: Yup.lazy((v) => {
      console.log(v);

      if (typeof v === "object") {
        return Yup.object({
          id: Yup.number().required(),
          name: Yup.string().required(),
        }).required();
      }

      return Yup.mixed().required();
    }),
    firstName: Yup.string().required(),
    gender: Yup.mixed()
      .oneOf(["male", "female"] as const)
      .required()
      .defined(),
  }),
}).defined();

interface BootstrapTypeaheadProps {
  form: {
    location: {
      id: number;
      name: string;
    } | null;
  };
}

export const BootstrapTypeahead = () => {
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState([]);

  const handleSearch = React.useMemo(() => {
    let timer: NodeJS.Timeout;

    return (q: string) => {
      console.log(q);
      setLoading(true);
      clearTimeout(timer);
      return new Promise((res, rej) => {
        timer = setTimeout(() => {
          const OPTIONS = DUMMY_LOCATIONS.map((n) => ({
            id: Math.floor(Math.random() * 1000),
            name: q + n,
          }));

          setLoading(false);
          setOptions(OPTIONS);
          res(OPTIONS);
        }, 500);
      });
    };
  }, []);

  const {
    errors,
    touched,
    values,
    createSubmitHandler,
    setValue,
    setTouched,
    validateForm,
  } = useForm<Yup.InferType<typeof SCHEMA>>({
    validationSchema: SCHEMA,
    // defaultValues: {
    //   form: {
    //     location: {
    //       id: 0,
    //     },
    //   },
    // },
    defaultValues: {
      form: {
        location: {
          id: 0,
          name: "Brazil",
        },
      },
    },
  });

  const handleSubmit = React.useCallback(
    createSubmitHandler((v) => {
      console.log(v);
    }),
    []
  );

  return (
    <div className="row">
      <div className="col-12">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            {errors.form?.location && touched.form?.location && (
              <div className="text-danger">{errors.form?.location}</div>
            )}
            <AsyncTypeahead
              id="location"
              inputProps={{
                name: "form.location",
              }}
              isInvalid={!!errors.form?.location && !!touched.form?.location}
              isLoading={loading}
              onSearch={handleSearch}
              options={options}
              labelKey={(o) => `${o.name}`}
              useCache={false}
              onChange={(val) => {
                setValue("form.location", val[0], true);
              }}
              onBlur={(e) => {
                setTouched((t) => {
                  set(t, "form.location", true);
                  return t;
                });
                validateForm({ touch: false });
              }}
            />
            <input
              type="hidden"
              name="form.location.id"
              value={((values.form?.location?.id as unknown) as string) || ""}
            />
            <input
              type="hidden"
              name="form.location.name"
              value={((values.form?.location?.name as unknown) as string) || ""}
            />
          </div>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
          <pre>{JSON.stringify(values, null, 2)}</pre>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
