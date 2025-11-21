import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Persist = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs>,
  options: { name: string }
) => StateCreator<T, Mps, Mcs>;

type PersistImpl = <T>(
  config: StateCreator<T, [], []>,
  options: { name: string }
) => StateCreator<T, [], []>;

const persistImpl: PersistImpl = (config, options) => (set, get, store) => {
  const name = options.name;
  try {
    const str = sessionStorage.getItem(name);
    if (str !== null) {
      set(JSON.parse(str));
    }
  } catch (err) {
    console.error(`Error loading state for ${name} from sessionStorage`, err);
  }

  return config(
    (payload) => {
      set(payload);
      try {
        sessionStorage.setItem(name, JSON.stringify(get()));
      } catch (err) {
        console.error(`Error saving state for ${name} to sessionStorage`, err);
      }
    },
    get,
    store
  );
};

export const persist = persistImpl as unknown as Persist;
