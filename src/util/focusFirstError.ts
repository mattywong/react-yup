import { ValidationError } from "yup";

export const focusFirstError = (
  form: HTMLFormElement,
  yupErrors: ValidationError
): void => {
  const formErrorKeys = yupErrors.inner.reduce((acc, cur) => {
    acc[cur.path] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const formEls = Array.from(form.elements);
  formEls.some((el) => {
    const name = el.attributes.getNamedItem("name")?.value;

    if (name && formErrorKeys[name]) {
      (el as HTMLElement).focus();
      return true;
    }

    return false;
  });
};
