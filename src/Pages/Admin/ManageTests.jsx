import { useEffect, useState } from "react";
import useTestStore from "../../store/testStore";
import TestMetaForm from "../../components/Admin/TestMetaForm";
import QuestionForm from "../../components/Admin/QuestionForm";

const ManageTests = () => {
  const testMeta = useTestStore((state) => state.testMeta);
  const [step, setStep] = useState("meta");

  useEffect(() => {
    if (testMeta) {
      setStep("questions");
    } else {
      setStep("meta");
    }
  }, [testMeta]);

  return (
    <div>
      {step === "meta" ? (
        <TestMetaForm onNext={() => setStep("questions")} />
      ) : (
        <QuestionForm onBack={() => setStep("meta")} />
      )}
    </div>
  );
};

export default ManageTests;
