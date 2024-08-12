import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Pages/LoginPage/LoginPage";
import Home from "./Pages/Dashboard/Home";
import Customer from "./Pages/Customer/Customer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/customer" element={<Customer />} />
      </Routes>
    </Router>
  );
};

export default App;
