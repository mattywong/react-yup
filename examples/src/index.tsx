import * as React from "react";
import * as ReactDOM from "react-dom";
import { BasicForm } from "./BasicForm";
import { NestedForm } from "./NestedForm";
import { CheckboxForm } from "./CheckboxForm";
import { AdvancedForm } from "./AdvancedForm";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  Link,
} from "react-router-dom";
import { Success } from "./Success";

const Container: React.FC<{}> = ({ children }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    setCount((count) => count + 1);
  }, []);
  return (
    <div className="container py-4">
      <div>Render count: {count}</div>
      {children}
    </div>
  );
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
            <Link to="/nested">Nested</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/checkbox">Checkbox</Link>
          </li>
          <li className="list-inline-item">
            <Link to="/advanced">Advanced</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/basic">
          <Container>
            <BasicForm />
          </Container>
        </Route>
        <Route path="/nested">
          <Container>
            <NestedForm />
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
