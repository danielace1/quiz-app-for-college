import { Outlet } from "react-router-dom";
import GuestLayout from "./Layout/GuestLayout";
import Header from "./components/header";

const App = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default App;
