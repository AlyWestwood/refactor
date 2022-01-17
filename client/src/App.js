
import React, { useState, useEffect } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes, Link, Outlet} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './misc/AuthContext'
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register.js';
import NewAccountA from './pages/admin/NewAccount';
import TransferA from './pages/admin/Transfer';
import Account from './pages/client/Account';
import Deposit from './pages/client/Deposit';
import NewAccountC from './pages/client/Account';
import PayBills from './pages/client/PayBills';
import Transactions from './pages/client/Transactions';
import TransferC from './pages/client/Transfer';

function App() {

/* authorization */
const [authState, setAuthState] = useState(false);
const [adminState, setAdminState] = useState(false);
const [clientState, setClientState] = useState(false);

useEffect(()=>{
  axios.get("/users/auth", {
    headers: {
      accessToken: localStorage.getItem("accessToken")
    }
  }).then(res => {
    if(!res.data.error){
      setAuthState(true);
    }
    if(res.data.role === "admin"){
      setAdminState(true);
    } else if(res.data.role === "client"){
      setClientState(true);
    } else {
      setAuthState(false);
    }
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
          <ul className='nav'>
            <li className='nav-item'><Link to="login" className='nav-link'>Log In</Link></li>
            <li className='nav-item'><Link to="register" className='nav-link'>Register</Link></li>
            <li><Link className='nav-link' to="/login" onClick={logout} >Log Out</Link></li>

          </ul>
        </nav>
        <h1>Refactor</h1>
      </header>
      <div className='container d-flex justify-content-center'><Outlet/></div>
    
    <Footer/>
    </div>
  )
}

const logout = function Logout(){
  localStorage.removeItem("accessToken");
}

function AdminLayout() {
  return (
    <div>
       <header>
        <nav>
          <ul>
          <li><Link className='nav-link' to="/login" onClick={logout} >Log Out</Link></li>
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
          <li><Link className='nav-link' to="/login" onClick={logout} >Log Out</Link></li>
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
