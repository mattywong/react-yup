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

describe("useForm value setters", () => {
  test("useForm().setValues works correctly ", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
      })
    );

    /* setValues test */
    act(() => {
      result.current.setValues((v) => (v.firstName = "joe biggs"));
    });

    expect(result.current.values.firstName).toBe("joe biggs");
  });

  test("useForm().setValue works correctly ", () => {
    const { result } = renderHook(() =>
      useForm<Yup.InferType<typeof SCHEMA>>({
        validationSchema: SCHEMA,
      })
    );

    /* setValues test */
    act(() => {
      result.current.setValue("firstName", "clive biggs");
    });

    expect(result.current.values.firstName).toBe("clive biggs");
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

    /* setValues test */
    act(() => {
      result.current.setTouched((v) => (v.firstName = true));
    });

    expect(result.current.touched.firstName).toBe(true);
  });
});
