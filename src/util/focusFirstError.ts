import { ValidationError } from "yup";

export const focusFirstError = (
  form: HTMLFormElement,
  yupErrors: ValidationError,
  focusMapper?: Record<string, string>
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
    // console.log(name);
    // console.log(focusMapper[name]);

    if (name && formErrorKeys[name]) {
      // redirect focus from focusMapper
      if (focusMapper && focusMapper[name]) {
        const el = document.querySelector(
          `${focusMapper[name]}`
        ) as HTMLElement;

        if (el) {
          el.focus();
          return true;
        }
      }

      (el as HTMLElement).focus();
      return true;
    }

    return false;
  });
};
