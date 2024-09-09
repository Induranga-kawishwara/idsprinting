import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./Components/Pages/Login/LoginPage";
import Home from "./Components/Pages/Dashboard/Home";
import Customer from "./Components/Pages/Customer/Customer";
import CreditCustomers from "./Components/Pages/CreditCustomers/CreditCustomers";
import AddItem from "./Components/Pages/Additem/Additem";
import SalesHistory from "./Components/Pages/SalesHistory/SalesHistory";
import Supplier from "./Components/Pages/Supplier/Supplier";
import NavBar from "./Components/Reusable/NavBar/NavBar";
import Footer from "./Components/Reusable/Footer/Footer";
import Category from "./Components/Pages/AddCategory/AddCategory";
import Expenses from "./Components/Pages/AddExpenses/Expenses";
import CashUp from "./Components/Pages/CashUp/Cashup";
import Sales from "./Components/Pages/Sales/Sales";
import Settings from "./Components/Pages/RegEmployee/RegEmp";
import AdminReg from "./Components/Pages/RegAdmin/AdminReg";
import Quatation from "./Components/Pages/Quotation/Quotation";
import Loading from "./Components/Reusable/Loadingcomp/Loading";

const Layout = () => {
  const location = useLocation();

  const isLoginPage = location.pathname === "/"; // Check if current path is login

  return (
    <>
      {!isLoginPage && <NavBar />} {/* Show NavBar if not on login page */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/additem" element={<AddItem />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="/category" element={<Category />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/cashups" element={<CashUp />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/adminreg" element={<AdminReg />} />
        <Route path="/quatation" element={<Quatation />} />
        <Route path="/credit-customers" element={<CreditCustomers />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
      {!isLoginPage && <Footer />} {/* Show Footer if not on login page */}
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
