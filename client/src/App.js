/*  IMPORTS */

  /* plugins, styles */
  import React, { useContext } from 'react';
  import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom';
  import { Container, Row } from 'react-bootstrap';
  
  /* common pages, components, styles, helpers */
  import './bootstrap.scss';
  import './App.css';
  import Home from './pages/common/Home';
  import { Login, Logout } from './pages/common/Login';
  import Register from './pages/common/Register.js';
  import GetAuth from './misc/GetAuth';
  import Header from './components/Header';
  import Footer from './components/Footer'
  import FileUpload from './FileUpload';
  import DisplayCheque from './DisplayCheque';
  import { AuthContext } from './misc/AuthContext';

  /* client pages */
  import Accounts from './pages/client/Accounts';
  import Account from './pages/client/Account';
  import NewAccountC from './pages/client/NewAccount';
  import Deposit from './pages/client/Deposit';
  import Transactions from './pages/client/Transactions';
  import NewTransfer from './pages/client/NewTransfer';
  import PayFees from './pages/client/PayFees';
  import RecurringPayment from './pages/client/RecurringPayment';
  import NewRecurringPayment from './pages/client/NewRecurringPayment';

  /* admin pages */
  import AdminAccounts from './pages/admin/Accounts';
  import NewAccountA from './pages/admin/NewAccount';
  import TransferA from './pages/admin/Transfer';
  import Users from './pages/admin/Users';
  import ApproveCheques from './pages/admin/ApproveCheques';

/* IMPORTS END */


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
            <Route path="logout" element={<Logout/>}/>
            <Route path="register" element={<Register/>}/>
            <Route path="fileUpload" element={<FileUpload/>}/>
            <Route path="displayCheque" element={<DisplayCheque/>}/>
        {/* client routes */}
            <Route path="client" element={<Client/>}>
              <Route path="" element={<ClientHome/>}/>
                <Route path="accounts" element={<Accounts/>}>
                  <Route path=":accountId" element={<Account/>}/>
                  {/* <Route path=":accountId/chequedeposit" element={<Deposit/>}/> */}
                  <Route path="openAccount" element={<NewAccountC/>}/>
                </Route>
                <Route path="chequedeposit" element={<Deposit/>}>
                  <Route path=":accountId" element={<Deposit/>}/>
                </Route>
                <Route path="recurringpayment" element={<RecurringPayment/>}>
                  <Route path=":accountId" element={<RecurringPayment/>}/>
                </Route>
                <Route path="newrecurringpayment" element={<NewRecurringPayment/>}>
                  <Route path=":accountId" element={<NewRecurringPayment/>}/>
                </Route>
                <Route path="payfees" element={<PayFees/>}>
                  <Route path=":accountId" element={<PayFees/>}/>
                </Route>
                <Route path="transfer" element={<NewTransfer/>}>
                  <Route path=":accountId" element={<NewTransfer/>}/>
                </Route>
            </Route>

        {/* admin routes */}
          <Route path="admin" element={<Admin/>}>
            <Route path="accounts" element={<AdminAccounts/>}/>
            {/* <Route path="openAccount" element={<NewAccountA/>}/> */}
            <Route path="transfer" element={<TransferA/>}/>
            <Route path="users" element={<Users/>}/>
            <Route path="approvecheques" element={<ApproveCheques />}/>
          </Route>
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
    <>
      <Header />
        <Container>
        <Row className='my-4 gx-0 justify-content-md-center text-start'>
          <Outlet/>
        </Row>
        </Container>
      <Footer/>
    </>
  )
}

function Admin() {
  const state = useContext(AuthContext);
  if(state.authState === false){
    return <Navigate to='/login'/>
  }
  if(state.authState === true){    
    if(state.authUser.role === 'client'){
      return <Navigate to='/client'/>
    }
    if(state.authUser.role === 'admin'){
      switch(state.authUser.status){
        case 'disabled':
          return <Navigate to='/login'/>
        case 'inactive':
          return <div>Your account has not yet been approved</div>
        case 'active':
          return <Outlet />
        default:
          break;
      }
    }
  }
  return <div>Loading...</div>
}

function Client() {
  const state = useContext(AuthContext);
  if(state.authState === false){
    return <Navigate to='/login'/>
  }
  if(state.authState === true){
    if(state.authUser.role === 'admin'){
      return <Navigate to='/admin'/>
    }
    if(state.authUser.role === 'client'){
      switch(state.authUser.status){
        case 'disabled':
          return <Navigate to='/login'/>
        case 'inactive':
          return <div>Sit tight!<br/>You haven't been approved yet</div>
        case 'active':
          return <Outlet />
        default:
          break;
      }
    }
  }
  return <div>Loading...</div>
}

function ClientHome(){
  return <div>Welcome</div>
}

export default App;
