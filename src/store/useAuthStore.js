import { create } from "zustand";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/index";
import { doc, getDoc } from "firebase/firestore";

const useAuthStore = create((set) => ({
  user: null,
  authLoading: true,

  initAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          set({
            user: userData,
            authLoading: false,
          });
        } else {
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            },
            authLoading: false,
          });
        }
      } else {
        set({ user: null, authLoading: false });
      }
    });
  },

  logout: async ({ navigate }) => {
    try {
      await signOut(auth);
      navigate("/login");
      set({ user: null });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },
}));

export default useAuthStore;
