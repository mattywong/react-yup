import * as React from "react";
import * as Yup from "yup";

import { AsyncTypeahead } from "react-bootstrap-typeahead";

import { InputField } from "./Field";

import { useForm } from "../../src";

const SCHEMA = Yup.object({
  locations: Yup.array().of(
    Yup.object({
      suburb: Yup.string().required(),
      state: Yup.string().required(),
    })
  ),
  gender: Yup.number(),
});

const DUMMY_LOCATIONS = [
  {
    suburb: "Perth",
    state: "Western Australia",
  },
  {
    suburb: "Waterford",
    state: "Western Australia",
  },
  {
    suburb: "East Perth",
    state: "Western Australia",
  },
  {
    suburb: "West Perth",
    state: "Western Australia",
  },
  {
    suburb: "Carlisle",
    state: "Western Australia",
  },
  {
    suburb: "East Victoria Park",
    state: "Western Australia",
  },
  {
    suburb: "Victoria Park",
    state: "Western Australia",
  },
  {
    suburb: "Laithlain",
    state: "Western Australia",
  },
  {
    suburb: "Subiaco",
    state: "Western Australia",
  },
];

const useTypeahead = () => {
  const [state, setState] = React.useState(() => ({
    isLoading: false,
    options: [],
  }));

  const onSearch = React.useMemo(() => {
    return (query: string) => {
      console.log(query);

      new Promise((res, rej) => {
        setTimeout(res, 1000);
      }).then(() => {
        const OPTIONS = DUMMY_LOCATIONS.map((n) => ({
          suburb: n.suburb,
          state: n.state,
        }));

        setState((prev) => ({
          ...prev,
          options: OPTIONS,
        }));
      });
    };
  }, []);

  return {
    onSearch,
    isLoading: state.isLoading,
    options: state.options,
  };
};

export const TypeaheadArray = () => {
  const {
    field,
    createSubmitHandler,
    values,
    touched,
    errors,
    setValue,
    setValues,
    setTouched,
    FormProvider,
  } = useForm({
    validationSchema: SCHEMA,
  });

  const typeahead = useTypeahead();

  const handleSubmit = React.useMemo(() => {
    return createSubmitHandler((v) => {
      console.log(v);
    });
  }, [createSubmitHandler]);

  const addLocation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setValues((v) => {
      v.locations = v.locations
        ? [
            ...v.locations,
            {
              suburb: "",
              state: "",
            },
          ]
        : [
            {
              suburb: "",
              state: "",
            },
          ];

      return v;
    });
  };

  return (
    <FormProvider>
      <pre>
        {JSON.stringify(
          {
            values,
            touched,
            errors,
          },
          null,
          2
        )}
      </pre>
      <form action="" onSubmit={handleSubmit}>
        <fieldset>
          {values.locations &&
            values.locations.map((n, idx) => {
              return (
                <div key={idx} className="form-group">
                  <label>Location</label>
                  {errors.locations &&
                    errors.locations[idx] &&
                    touched.locations &&
                    touched.locations[idx] && (
                      <p className="text-danger">Location invalid</p>
                    )}
                  <AsyncTypeahead
                    id={`location__${idx}`}
                    inputProps={{
                      name: `locations[${idx}]`,
                    }}
                    isInvalid={
                      !!(
                        errors.locations &&
                        errors.locations[idx] &&
                        touched.locations &&
                        touched.locations[idx]
                      )
                    }
                    labelKey={(o) => [o.suburb, o.state].join(" ")}
                    useCache={false}
                    onChange={(val) => {
                      setValue(`locations[${idx}]`, val[0], true);
                    }}
                    onBlur={(e) => {
                      setTouched(`locations[${idx}]`, true, true);
                    }}
                    {...typeahead}
                  />
                </div>
              );
            })}
          <button type="button" onClick={addLocation}>
            Add location
          </button>{" "}
        </fieldset>

        <fieldset className="form-group">
          <div className="row">
            <legend className="col-form-label col-sm-2 pt-0">
              Gender
            </legend>
            <div className="col-sm-10">
              <div>
                <InputField
                  name="gender"
                  type="radio"
                  id="male"
                  value={1}
                  label="Male"
                  {...field}
                />
                <InputField
                  name="gender"
                  type="radio"
                  id="female"
                  value={2}
                  label="Female"
                  {...field}
                />
                <InputField
                  name="gender"
                  type="radio"
                  id="unknown"
                  value={3}
                  label="Prefer not to say"
                  {...field}
                />
              </div>
              {errors.gender && touched.gender && (
                <div className="invalid-feedback d-block mb-2">
                  {errors.gender}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};
