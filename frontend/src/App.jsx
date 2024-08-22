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
import Supplier from "./Components/Pages/Supplier/Supplier";
import NavBar from "./Components/Reusable/NavBar/NavBar";
import Category from "./Components/Pages/AddCategory/AddCategory";
import Expenses from "./Components/Pages/AddExpenses/Expenses";

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
        <Route path="/supplier" element={<Supplier />} />
        <Route path="/category" element={<Category />} />
        <Route path="/expenses" element={<Expenses />} />
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
