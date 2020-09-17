import { ValidationError } from "yup";

import { get, set } from "lodash-es";

type FocusMapperCallback = (yupErrors: ValidationError) => HTMLElement;

export const focusFirstError = (
  form: HTMLFormElement,
  yupErrors: ValidationError,
  focusMapper?: Record<string, string | FocusMapperCallback>
): void => {
  const formErrorKeys = yupErrors.inner.reduce((acc, cur) => {
    set(acc, cur.path, true);
    return acc;
  }, {} as Record<string, unknown>);

  const formEls = Array.from(form.elements);

  formEls.some((el) => {
    let name = el.attributes.getNamedItem("name")?.value;

    if (!name) {
      return false;
    }

    name = name.endsWith("[]") ? name.slice(0, -2) : name;

    if (name && get(formErrorKeys, name)) {
      // redirect focus from focusMapper
      if (focusMapper && focusMapper[name]) {
        let el;

        switch (typeof focusMapper[name]) {
          case "string":
            el = document.querySelector(`${focusMapper[name]}`) as HTMLElement;
            break;
          case "function":
            el = (focusMapper[name] as FocusMapperCallback)(yupErrors);
            break;
        }

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
