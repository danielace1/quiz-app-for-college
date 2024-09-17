import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Question from "../components/Question";

const Home = () => {
  const [username, setUsername] = useState("user");
  const [rollNo, setRollNo] = useState();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const isValidId = id && id.length === 28 && /^[a-zA-Z0-9]+$/.test(id);
    if (!isValidId) {
      navigate("/error");
    }

    async function fetchDocument(docId) {
      const docRef = doc(db, "students", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        setUsername(docSnap.data().username);
        setRollNo(docSnap.data().rollNo);
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    }

    fetchDocument(id);
  }, [id, navigate]);

  return (
    <div className="pb-10 bg-orange-100 min-h-screen">
      <h1 className="text-orange-500 font-semibold text-3xl ml-10 mb-3 text-center">
        Welcome to Java Quiz App! 🚀
      </h1>
      <div className="mt-5 bg-white rounded-lg max-w-xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-orange-500">
            Hello, <span className="capitalize">{username}</span>
          </h1>
          <h2 className="text-orange-500 font-semibold">
            Roll No. : <span className="uppercase">{rollNo}</span>
          </h2>
        </div>
        <div className="mt-3 flex justify-between">
          <h2 className="text-orange-500 font-semibold underline underline-offset-2">
            Take your test !
          </h2>
          <div className="bg-orange-400 bg-opacity-20 px-4 py-2 rounded-xl font-bold text-sky-500">
            Time Left : 1:00
          </div>
        </div>
        <hr className="mt-2 border-orange-100" />

        <Question />
      </div>
    </div>
  );
};

export default Home;
