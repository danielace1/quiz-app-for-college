import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTestStore = create(
  persist(
    (set) => ({
      testMeta: null,
      questionFormData: null,

      questions: [],
      answers: {},
      currentPage: 0,
      startTime: null,
      endTime: null,
      hasHydrated: false,

      setTestMeta: (meta) => set({ testMeta: meta }),
      setQuestionFormData: (data) => set({ questionFormData: data }),

      setQuestions: (qs) => set({ questions: qs }),
      setAnswers: (answers) => set({ answers }),
      updateAnswer: (questionId, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
        })),
      setCurrentPage: (page) => set({ currentPage: page }),
      setStartTime: (time) => set({ startTime: time }),
      setEndTime: (endTime) => set({ endTime }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      resetTest: () =>
        set({
          testMeta: null,
          questionFormData: null,
          answers: {},
          currentPage: 0,
          endTime: null,
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
        startTime: state.startTime,
        endTime: state.endTime,
        questions: state.questions,
      }),

      onRehydrateStorage: () => (state, error) => {
        if (error) console.error("Failed to rehydrate:", error);
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useTestStore;
