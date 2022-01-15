
import React, { useState, useEffect } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes, Link, Outlet} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './misc/AuthContext'
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register.js';
import { NewAccount as NewAccountA } from './pages/admin/NewAccount';
import { Transfer as TransferA } from './pages/admin/Transfer';
import Account from './pages/client/Account';
import Deposit from './pages/client/Deposit';
import { NewAccount as NewAccountC } from './pages/client/Account';
import PayBills from './pages/client/PayBills';
import Transactions from './pages/client/Transactions';
import { Transfer as TransferC } from './pages/client/Transfer';

function App() {

/* authorization */
const [authState, setAuthState] = useState(false);

useEffect(()=>{
  axios.get("/auth", {
    headers: {
      accessToken: localStorage.getItem("accessToken")
    }
  }).then(res => {
    setAuthState(res.data.error ? false : true)
  });
}, []);


  return (
    <div className="App">
      <AuthContext.Provider value={{authState, setAuthState}}>
      <Router>
        <Routes>
          {/* react router dom v6 reference for nested routes https://reactrouter.com/docs/en/v6/getting-started/overview#nested-routes */}
          {/* <Route path="" element={</>}/> */}
 
        {/* common routes */}

          <Route path="/" element={<Layout/>}>
            <Route path="home" element={<Home/>}/>
            <Route path="login" element={<Login/>}/>
            <Route path="register" element={<Register/>}/>
          </Route>
        {/* client routes */}
          <Route path="client" element={<ClientLayout/>}> 
            <Route path="account" element={<Account/>}/>
            <Route path="chequedeposit" element={<Deposit/>}/>
            {/* <Route path="/requestpayment" element={</>}/> */}
            <Route path="paybills" element={<PayBills/>}/>
            <Route path="transactions" element={<Transactions/>}/>
            <Route path="transfer" element={<TransferC/>}/>
            <Route path="openAccount" element={<NewAccountC/>}/>
          </Route>

        {/* admin routes */}
        <Route path="admin" element={<AdminLayout/>}>
          <Route path="transfer" element={<TransferA/>}/>
          <Route path="openAccount" element={<NewAccountA/>}/>
        </Route>
        
        </Routes>
      </Router>
      </AuthContext.Provider>
    </div>
  );
}

function Layout() {
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="login">Log In</Link></li>
            <li><Link to="register">Register</Link></li>
          </ul>
        </nav>
        <h1>Refactor</h1>
      </header>
    <Outlet/>
    <Footer/>
    </div>
  )
}

function AdminLayout() {
  return (
    <div>
       <header>
        <nav>
          <ul>
            <li><Link to="login">Log In</Link></li>
            <li><Link to="register">Register</Link></li>
          </ul>
        </nav>
        <h1>Refactor</h1>
      </header>
    <h2>Admin Dashboard</h2>
    <Outlet/>
    <Footer/>
    </div>
  )
}

function ClientLayout() {
  return (
    <div>
       <header>
        <nav>
          <ul>
            <li><Link to="login">Log In</Link></li>
            <li><Link to="register">Register</Link></li>
          </ul>
        </nav>
        <h1>Refactor</h1>
      </header>
    <h2>Admin Dashboard</h2>
    <Outlet/>
    <Footer/>
    </div>
  )
}

function Footer(){
  return <footer>by Kate and Aly</footer>
}

export default App;
