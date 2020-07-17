import * as React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import { useForm, useFormBag } from "./useForm";
import * as Yup from "yup";

import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

const SCHEMA = Yup.object({
  firstName: Yup.string().required().defined(),
  lastName: Yup.string().required().defined(),
  gender: Yup.mixed()
    .oneOf(["male", "female", "unknown"] as const)
    .defined(),
  agreeToTos: Yup.boolean().required().defined(),
  colours: Yup.array().of(Yup.string()),
}).defined();

test("useForm hook doesn't crash", () => {
  const { result } = renderHook(() => useForm());

  expect(result.error).toBe(undefined);
});

describe("validation errors", () => {
  test("yup integration working and errors successfully show", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
      })
    );

    expect(result.current.errors.firstName).toBe(undefined);

    act(() => {
      result.current.validateForm().catch(() => {});
    });

    await waitForNextUpdate();

    expect(result.current.errors.firstName).toBe("firstName must be defined");
  });

  test("resetErrors() works correctly", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
      })
    );

    expect(result.current.errors.firstName).toBe(undefined);

    act(() => {
      result.current.validateForm().catch(() => {});
    });

    await waitForNextUpdate();

    expect(result.current.errors.firstName).toBe("firstName must be defined");

    act(() => {
      result.current.resetErrors();
    });

    expect(result.current.errors.firstName).toBe(undefined);
  });
});

describe("useValues", () => {
  test("useForm().setValues works correctly ", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
      })
    );

    act(() => {
      result.current.setValues((v) => {
        v.firstName = "joe biggs";
        return v;
      });
    });

    expect(result.current.values.firstName).toBe("joe biggs");
  });

  test("useForm().setValue works correctly ", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
      })
    );

    act(() => {
      result.current.setValue("firstName", "clive biggs");
    });

    expect(result.current.values.firstName).toBe("clive biggs");
  });

  test("useForm().getValues works correctly ", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
        defaultValues: {
          firstName: "joe",
        },
      })
    );

    expect(result.current.getValues()).toEqual({
      firstName: "joe",
    });
  });

  test("useForm().getValue works correctly ", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
        defaultValues: {
          firstName: "joe",
          lastName: "biggs",
        },
      })
    );

    expect(result.current.getValue("firstName")).toBe("joe");
    expect(result.current.getValue((v) => v.lastName)).toBe("biggs");
  });
});

describe("useForm touched setters", () => {
  test("useForm().setTouched works correctly ", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
      })
    );

    expect(result.current.touched.firstName).toBe(undefined);

    act(() => {
      result.current.setTouched((t) => {
        t.firstName = true;
        return t;
      });
    });

    expect(result.current.touched.firstName).toBe(true);
  });
});

describe("useForm isChecked method works correctly", () => {
  test("isChecked with name argument", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
        defaultValues: {
          agreeToTos: true,
        },
      })
    );

    expect(result.current.isChecked("agreeToTos")).toBe(true);
  });

  test("isChecked with name argument and value as primitive", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
        defaultValues: {
          gender: "male",
        },
      })
    );

    expect(result.current.isChecked("gender", "male")).toBe(true);
    expect(result.current.isChecked("gender", "female")).toBe(false);
  });

  test("isChecked with value as an array, with name argument and value as primitive", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
        defaultValues: {
          colours: ["red", "orange"],
        },
      })
    );

    expect(result.current.isChecked("colours", "red")).toBe(true);
    expect(result.current.isChecked("colours", "blue")).toBe(false);
    expect(result.current.isChecked("colours", "orange")).toBe(true);
  });

  test("isChecked with name argument and value as callback function", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
        defaultValues: {
          gender: "male",
        },
      })
    );

    expect(
      result.current.isChecked("gender", (v) => {
        return v === "male";
      })
    ).toBe(true);
  });

  test("isChecked with name[] argument and value as callback function", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
        defaultValues: {
          colours: ["red", "orange"],
        },
      })
    );

    expect(
      result.current.isChecked("colours[]", (v: string[]) => {
        // return v === "male";

        expect(Array.isArray(v)).toBe(true);

        expect(v).toEqual(["red", "orange"]);

        return v.includes("true");
      })
    ).toBe(false);
  });
});

describe("createSubmitHandler works correctly when form is valid and invalid", () => {
  test("createSubmitHandler works correctly when form is valid", async () => {
    const FormComponent = () => {
      const [success, setSuccess] = React.useState(false);
      const { values, createSubmitHandler, field } = useForm({
        defaultValues: {
          firstName: "hello world",
        },
      });

      const handleSubmit = React.useMemo(() => {
        return createSubmitHandler((v) => {
          console.log(v);
          setSuccess(true);
        });
      }, []);

      return (
        <form onSubmit={handleSubmit}>
          <input type="text" value={values.firstName} {...field} />
          {success && <div role="alert">Success</div>}
          <button type="submit">Submit</button>
        </form>
      );
    };

    const { container, asFragment } = render(<FormComponent />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent("Success");
  });

  test("createSubmitHandler works correctly when form is invalid", async () => {
    const FormComponent = () => {
      const [failed, setFailed] = React.useState(false);
      const { values, createSubmitHandler, field } = useForm({
        validationSchema: Yup.object({
          firstName: Yup.string().required(),
        }),
      });

      const handleSubmit = React.useMemo(() => {
        return createSubmitHandler(
          (v) => {},
          (e) => {
            setFailed(true);
          }
        );
      }, []);

      return (
        <form onSubmit={handleSubmit}>
          <input type="text" value={values.firstName} {...field} />
          {failed && <div role="alert">Failed</div>}
          <button type="submit">Submit</button>
        </form>
      );
    };

    const { container, asFragment } = render(<FormComponent />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
  });

  test("createSubmitHandler works correctly when form is invalid and no error callback handler is passed", async () => {
    const FormComponent = () => {
      const { values, errors, createSubmitHandler, field } = useForm({
        validationSchema: Yup.object({
          firstName: Yup.string().required(),
        }),
      });

      const handleSubmit = React.useMemo(() => {
        return createSubmitHandler((v) => {});
      }, []);

      return (
        <form onSubmit={handleSubmit}>
          <input type="text" value={values.firstName} {...field} />
          <button type="submit">Submit</button>
          {errors.firstName && <div role="alert">{errors.firstName}</div>}
        </form>
      );
    };

    const { container, asFragment } = render(<FormComponent />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "firstName is a required field"
    );
  });
});

describe("useFormBag", () => {
  test("useFormBag correctly throws an error if used outside a FormProvider", () => {
    const { result } = renderHook(() => useFormBag());
    expect(result.error.message).toBe(
      "useFormBag was called outside a FormProvider"
    );
  });

  test("useFormBag renders correctly when wrapped in a FormProvider", () => {
    const FieldComponent = () => {
      const ctx = useFormBag();
      return <div role="alert">Success</div>;
    };

    const FormComponent = () => {
      const { values, errors, createSubmitHandler, FormProvider } = useForm({
        validationSchema: Yup.object({
          firstName: Yup.string().required(),
        }),
      });

      const handleSubmit = React.useMemo(() => {
        return createSubmitHandler((v) => {});
      }, []);

      return (
        <FormProvider>
          <form onSubmit={handleSubmit}>
            <FieldComponent />
          </form>
        </FormProvider>
      );
    };

    const { container, asFragment } = render(<FormComponent />);

    // fireEvent.click(screen.getByText("Submit"));

    // await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent("Success");
  });
});
