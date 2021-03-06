import * as React from "react";
import { cloneDeep } from "lodash-es";

type ThunkDispatch<State, Actions> = (
  dispatch: React.Dispatch<Actions>,
  getState: () => State
) => void;

export const useThunkReducer = <State, Actions>(
  reducer: React.Reducer<State, Actions>,
  initialState: State,
  initialiser?: (initialState: State) => State
): Readonly<
  [() => State, (action: Actions | ThunkDispatch<State, Actions>) => void]
> => {
  const internalReducer = React.useMemo(() => {
    return reducer;
  }, []);

  /**
   * We allow nested values in the state,
   * and object.assign only does a shallow copy,
   * so potentially props could be mutated unintendedly
   * if the initial state is coming from props.
   * */

  const [$state, $setState] = React.useState(() => {
    if (initialiser && typeof initialiser === "function") {
      return cloneDeep(initialiser(initialState));
    }
    return cloneDeep(initialState);
  });

  const stateRef = React.useRef<State>($state);

  const getState = React.useMemo(() => {
    return () => stateRef.current;
  }, [stateRef]);

  const setState = React.useMemo(() => {
    return (nextState: State) => {
      stateRef.current = nextState;
      $setState(nextState);
    };
  }, []);

  const reduce = React.useMemo(() => {
    return (action: Actions) => {
      return internalReducer(getState(), action);
    };
  }, [internalReducer, getState]);

  type DispatchArguments = Actions | ThunkDispatch<State, Actions>;

  const dispatch = React.useMemo(() => {
    return (action: DispatchArguments) => {
      if (typeof action === "function") {
        return (action as ThunkDispatch<State, Actions>)(dispatch, getState);
      }

      return setState(reduce(action));
    };
  }, [setState, reduce, getState]);

  return [getState, dispatch] as const;
};
