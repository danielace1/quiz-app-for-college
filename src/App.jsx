import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import GuestLayout from "./Layout/GuestLayout";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Home from "./Pages/Home";
import Final from "./Pages/Final";
import ErrorPage from "./ErrorPage/Error";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<GuestLayout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/student/:id"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />
        <Route
          path="/student/:id/final"
          element={
            <>
              <Navbar />
              <Final />
            </>
          }
        />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default App;
