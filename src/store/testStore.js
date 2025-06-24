import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTestStore = create(
  persist(
    (set) => ({
      testMeta: null,
      questionFormData: null,

      answers: {},
      currentPage: 0,
      timeLeft: null,

      setTestMeta: (meta) => set({ testMeta: meta }),
      setQuestionFormData: (data) => set({ questionFormData: data }),

      setAnswers: (answers) => set({ answers }),
      updateAnswer: (questionId, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
        })),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTimeLeft: (seconds) => set({ timeLeft: seconds }),

      resetTest: () =>
        set({
          testMeta: null,
          questionFormData: null,
          answers: {},
          currentPage: 0,
          timeLeft: null,
        }),
    }),
    {
      name: "test-meta-data",
      getStorage: () => localStorage,

      partialize: (state) => ({
        testMeta: state.testMeta,
        questionFormData: state.questionFormData,
        answers: state.answers,
        currentPage: state.currentPage,
        timeLeft: state.timeLeft,
      }),
    }
  )
);

export default useTestStore;
