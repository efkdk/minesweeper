const Context = (() => {
  let state = {};

  let listeners = [];

  return {
    getState() {
      return state;
    },
    setState(newState) {
      state = { ...state, ...newState };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.push(listener);
    },
  };
})();

export default Context;

export const selectField = () => {
  return Context.getState().field;
};
