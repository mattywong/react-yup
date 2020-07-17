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
    let name = el.attributes.getNamedItem("name")?.value;

    if (!name) {
      return false;
    }

    name = name.endsWith("[]") ? name.slice(0, -2) : name;

    if (name && formErrorKeys[name]) {
      (el as HTMLElement).focus();
      console.log(el);
      return true;
    }

    return false;
  });
};
