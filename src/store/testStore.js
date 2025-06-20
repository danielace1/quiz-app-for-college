import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTestStore = create(
  persist(
    (set) => ({
      testMeta: null,
      questionFormData: null,

      setTestMeta: (meta) => set({ testMeta: meta }),
      setQuestionFormData: (data) => set({ questionFormData: data }),
      resetTest: () => set({ testMeta: null, questionFormData: null }),
    }),
    {
      name: "test-meta-data",
      getStorage: () => localStorage,
    }
  )
);

export default useTestStore;
