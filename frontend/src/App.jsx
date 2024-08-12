import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./Components/Pages/Login/LoginPage";
import Home from "./Components/Pages/Dashboard/Home";
import Customer from "./Components/Pages/Customer/Customer";
import NavBar from "./Components/Reusable/NavBar/NavBar";

const Layout = () => {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/customer" element={<Customer />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
