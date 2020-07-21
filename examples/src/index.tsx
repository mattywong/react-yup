import * as React from "react";
import whyDidYouRender from "@welldone-software/why-did-you-render";

import * as ReactDOM from "react-dom";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  Link,
} from "react-router-dom";

import { BasicFormExtended } from "./BasicFormExtended";
import { BasicForm } from "./BasicForm";
import { NestedForm } from "./NestedForm";
import { CheckboxForm } from "./CheckboxForm";
import { AdvancedForm } from "./AdvancedForm";
import { PureForm } from "./PureForm";
import { BootstrapTypeahead } from "./BootstrapTypeahead";

import { Success } from "./Success";

if (process.env.NODE_ENV !== "production") {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

const Container: React.FC<{}> = ({ children }) => {
  const [count, setCount] = React.useState(0);

  return <div className="container py-4">{children}</div>;
};

const App = () => {
  return (
    <Router>
      <nav>
        <ul className="list-unstyled list-inline">
          <li className="list-inline-item">
            <Link to="/basic">Basic</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/basic-extended">Basic Extended</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/nested">Nested</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/checkbox">Checkbox</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/advanced">Advanced</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/typeahead">BS Typeahead</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/pure-form">Pure form</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/basic">
          <Container>
            <BasicForm />
          </Container>
        </Route>
        <Route path="/basic-extended">
          <Container>
            <BasicFormExtended />
          </Container>
        </Route>
        <Route path="/nested">
          <Container>
            <NestedForm
              defaultValues={{
                form: {
                  firstName: "John",
                  address: {
                    number: 22,
                    street: "yea boi",
                  },
                },
                shouldValidate: true,
              }}
            />
          </Container>
        </Route>
        <Route path="/checkbox">
          <Container>
            <CheckboxForm />
          </Container>
        </Route>
        <Route path="/advanced">
          <Container>
            <AdvancedForm />
          </Container>
        </Route>
        <Route path="/typeahead">
          <Container>
            <BootstrapTypeahead />
          </Container>
        </Route>
        <Route path="/pure-form">
          <Container>
            <PureForm />
          </Container>
        </Route>
        <Route path="/success">
          <Success />
        </Route>

        <Redirect to="/basic" />
      </Switch>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));

document.write(
  `<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">`
);
