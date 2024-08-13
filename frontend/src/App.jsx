import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./Components/Pages/Login/LoginPage";
import Home from "./Components/Pages/Dashboard/Home";
import Customer from "./Components/Pages/Customer/Customer";
import AddItem from "./Components/Pages/Additem/Additem";
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
        <Route path="/additem" element={<AddItem />} />
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
