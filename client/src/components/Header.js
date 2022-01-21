import React, {useContext} from 'react'
// import {Link, NavLink} from 'react-router-dom';
import { AuthContext } from '../misc/AuthContext';
import {Navbar, Nav} from 'react-bootstrap';

/* PIMARY HEADER */

function LoggedIn(){
    // const navigate = Navigate()
    return (
        <Nav.Link href="/logout" className='headerbtn'>Log Out</Nav.Link>
        )
    }
    
function LoggedOut(){
    return (
        <>
        <Nav.Link className='headerbtn' href="/login">Log In</Nav.Link>
        <Nav.Link className="headerbtn" href="/register">Register</Nav.Link>
        </>
    )
}
    
/* SECONDARY HEADER */

function Client(){
    return (
        <>
        <Nav.Link href="/client/accounts">Accounts</Nav.Link>
        <Nav.Link href="/client/chequedeposit">Deposit</Nav.Link>
        <Nav.Link href="/client/transfer">Transfer funds</Nav.Link>
        </>
    )
}

function Admin(){
    return (
        <>
        <Nav.Link href="/admin/accounts">Accounts</Nav.Link>
        <Nav.Link href="/admin/users">Users</Nav.Link>
        </>
    )
}

function NoAuth(){
    return (
        <Nav.Link href='/'>Products</Nav.Link>
    )
}

function Header() {
    const state = useContext(AuthContext);
    return (
        <header>
            <Navbar bg="primary" className="p-3">
                <Navbar.Brand href="/" className='me-auto'>
                    <img src="/refactorlogo.png" alt="logo" width={200}/>
                </Navbar.Brand>
                {/* <Nav> */}
                {state.authState ? <LoggedIn /> : <LoggedOut/>}
                {/* </Nav> */}
            </Navbar>
            <Navbar bg="secondary" expand="lg" variant="dark">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    {/* {state.authState ? 
                        state.authUser ? 
                            state.authUser.role === "client" && <Client/> ||
                            state.authUser.role === "admin" && <Admin/>
                        : <div>Loading...</div>
                    : <NoAuth/>
                    } */}
                    {state.authUser.role === null && <NoAuth/>}
                    {state.authUser.role === "client" && <Client/>}
                    {state.authUser.role === "admin" && <Admin/>}
                </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    )
}

export default Header;
