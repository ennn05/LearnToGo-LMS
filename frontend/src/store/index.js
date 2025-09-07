import {create} from 'zustand';

const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) ?? null,
  setCredentials: (user) => set({user}),
  signOut: () => set({user: null}),
//   theme: localStorage.getItem('theme') ?? 'light',
//   setTheme: (value) => set({theme: value}),
// setCredentials: (user) => {
//   localStorage.setItem("user", JSON.stringify(user));
//   set({ user });
// },
}));

export default useStore;