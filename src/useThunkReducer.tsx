import * as React from "react";

export const useThunkReducer = <State, Actions>(
  reducer: React.Reducer<State, Actions>,
  initialState: State
) => {
  const internalReducer = React.useMemo(() => {
    return reducer;
  }, []);

  const [$state, $setState] = React.useState(initialState);

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

  type GetState = () => State;

  type ThunkDispatch = (
    dispatch: React.Dispatch<Actions>,
    getState: GetState
  ) => void;

  type DispatchArguments = Actions | ThunkDispatch;

  const dispatch = React.useMemo(() => {
    return (action: DispatchArguments) => {
      if (typeof action === "function") {
        return (action as ThunkDispatch)(dispatch, getState);
      }

      return setState(reduce(action));
    };
  }, [setState, reduce, getState]);

  return [getState, dispatch] as const;
};
