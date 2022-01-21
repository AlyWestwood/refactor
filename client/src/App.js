
import React, { useContext } from 'react';
import './bootstrap.scss';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom';
import Home from './pages/common/Home';
import { Login, Logout } from './pages/common/Login';
import Register from './pages/common/Register.js';
import NewAccountA from './pages/admin/NewAccount';
import TransferA from './pages/admin/Transfer';
import Accounts from './pages/client/Accounts';
import Account from './pages/client/Account';
import Deposit from './pages/client/Deposit';
import NewAccountC from './pages/client/NewAccount';
import PayBills from './pages/client/PayBills';
import Transactions from './pages/client/Transactions';
import TransferC from './pages/client/Transfer';
import Header from './components/Header';
import GetAuth from './misc/GetAuth';
import Footer from './components/Footer'
import FileUpload from './FileUpload';
import DisplayCheque from './DisplayCheque';
import {Container, Row} from 'react-bootstrap';
import { AuthContext } from './misc/AuthContext';

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
                {/* <Route path="/requestpayment" element={</>}/> */}
                <Route path="paybills" element={<PayBills/>}/>
                <Route path="transactions" element={<Transactions/>}/>
                <Route path="transfer" element={<TransferC/>}/>
            </Route>

        {/* admin routes */}
          <Route path="admin" element={<Admin/>}>
            <Route path="transfer" element={<TransferA/>}/>
            <Route path="openAccount" element={<NewAccountA/>}/>
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
        <Row className='my-4 gx-0 justify-content-md-center'>
          <Outlet/>
        </Row>
        </Container>
      <Footer/>
    </>
  )
}

function Admin() {
  const state = useContext(AuthContext);
  console.log(state)
  return state.authState === null ? 
    <div>Loading...</div> : state.authRole === null ? 
    <div>Loading...</div> : state.authRole === 'admin' ? 
    <Outlet/> : <Navigate to='/login'/>
  
}

function Client() {
  const state = useContext(AuthContext);
  // return state.authState === null ? 
  //   <div>Loading...</div> : state.authUser.role === null ? 
  //   <div>Loading...</div> : state.authUser.role === 'client' ? 
  //   state.authUser.status === 'active' ?
  //     <Outlet /> : state.authUser.status === 'inactive' ?
  //       <div>Sit tight!<br/>You haven't been approved yet</div> : <Navigate to='/login'/> :
  //   <Navigate to='/login'/>

  // if(state.authState === null){
  //   return <div>Loading...</div>
  // }
  if(state.authState === false){
    return <Navigate to='/login'/>
  }
  if(state.authState === true){    
    if(state.authUser.role === 'admin'){
      <Navigate to='/admin'/>
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
