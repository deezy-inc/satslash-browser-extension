// the value of `__DEFAULT_INSTANCE__` is set by webpack according to the `instance` argument provided
// to `yarn dev` or `yarn build`
export const DEFAULT_INSTANCE = __DEFAULT_INSTANCE__ || 'https://ordinals.com';
const ORD_INSTANCE_KEY = 'ordInstanceUrl';

export const getInstanceUrl = () => localStorage.getItem(ORD_INSTANCE_KEY) || DEFAULT_INSTANCE;
export const setInstanceUrl = (url) => localStorage.setItem(ORD_INSTANCE_KEY, url);
