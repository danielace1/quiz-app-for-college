import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/index";

const useAuthStore = create((set) => ({
  user: null,
  authLoading: true,

  initAuth: () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      set({ user: firebaseUser, authLoading: false });
    });
  },
}));

export default useAuthStore;
