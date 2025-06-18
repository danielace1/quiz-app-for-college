import useTestStore from "../../store/testStore";
import TestMetaForm from "../../components/Admin/TestMetaForm";
import QuestionForm from "../../components/Admin/QuestionForm";

const ManageTests = () => {
  const testMeta = useTestStore((state) => state.testMeta);

  return <div>{testMeta ? <QuestionForm /> : <TestMetaForm />}</div>;
};

export default ManageTests;
