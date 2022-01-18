
import React, { useState, useEffect } from 'react';
import './bootstrap.scss';
import './App.css';
import {BrowserRouter as Router, Route, Routes, Link, Outlet, Navigate} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './misc/AuthContext'
import Home from './pages/common/Home';
import { Login, Logout } from './pages/common/Login';
import Register from './pages/common/Register.js';
import NewAccountA from './pages/admin/NewAccount';
import TransferA from './pages/admin/Transfer';
import Account from './pages/client/Account';
import Deposit from './pages/client/Deposit';
import NewAccountC from './pages/client/Account';
import PayBills from './pages/client/PayBills';
import Transactions from './pages/client/Transactions';
import TransferC from './pages/client/Transfer';
import Header from './pages/common/Header';
import GetAuth from './misc/GetAuth';

function App() {


  return (
    <div className="App">
      <GetAuth>
      <Router>
        <Routes>
          {/* react router dom v6 reference for nested routes https://reactrouter.com/docs/en/v6/getting-started/overview#nested-routes */}
          {/* <Route path="" element={</>}/> */}
 
        {/* common routes */}

          <Route path="/" element={<Layout />}>
            <Route path="home" element={<Home/>}/>
            <Route path="login" element={<Login/>}/>
            <Route path="/logout" element={<Logout/>}/>
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
      </GetAuth>
    </div>
  );
}

function Layout() {
  // console.log(authState)
  return (
    <div>
      <Header />
      <div className='container d-flex justify-content-center'><Outlet/></div>
    
    <Footer/>
    </div>
  )
}

// const logout = function(){
//   localStorage.removeItem("accessToken");
//   Navigate("/");
// }

function AdminLayout() {
  return (
    <div>
      <Header />
    <h2>Admin Dashboard</h2>
    <Outlet/>
    <Footer/>
    </div>
  )
}

function ClientLayout() {
  return (
    <div>
      <Header />
    <h2>Admin Dashboard</h2>
    <Outlet/>
    <Footer/>
    </div>
  )
}

function Footer(){
  return <footer className='fixed-bottom bg-light'>by Kate and Aly</footer>
}

export default App;
