import { renderHook, act } from "@testing-library/react-hooks";

import { useForm } from "./useForm";
import * as Yup from "yup";

const SCHEMA = Yup.object({
  firstName: Yup.string().required().defined(),
  lastName: Yup.string().required().defined(),
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
