import {create} from 'zustand';

const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) ?? null,
  setCredentials: (user) => set({user}),
  signOut: () => set({user: null}),
//   theme: localStorage.getItem('theme') ?? 'light',
//   setTheme: (value) => set({theme: value}),
}));

export default useStore;