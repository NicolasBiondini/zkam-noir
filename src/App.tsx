import { Outlet } from "react-router-dom";
import LowNavBar from "./components/LowNavBar";
import NavBar from "./components/NavBar";

function App() {
  return (
    <div className="w-full h-[100vh] flex flex-col justify-center items-center bg-background text-foreground dark">
      <div className="flex h-full max-w-[400px]  flex-col items-center w-full bg-card">
        <NavBar />
        <Outlet />
        <LowNavBar />
      </div>
    </div>
  );
}

export default App;
