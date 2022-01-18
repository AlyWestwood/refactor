import React, {useContext} from 'react'
import {Link} from 'react-router-dom';
import { AuthContext } from '../../misc/AuthContext'



function LoggedIn(){
    // const navigate = Navigate()
    return (
        <ul className='nav'>
            <li className='nav-item'>
                <Link className='headerbtn nav-link' to="/logout">Log Out</Link>
            </li>
          </ul>
        )
    }
    
function LoggedOut(){
    return (
        <ul className='nav'>
        <li className='nav-item'>
            <Link className='headerbtn' to="/login">Log In</Link>
        </li>
        <li className='nav-item'>
            <Link to="register" className='headerbtn'>Register</Link>
        </li>
        </ul>
    )
}
    
function Client(){
    return (
        <ul className='navbar-nav'>
        <li className="nav-item"><span className="nav-link">This is the CLIENT subheader</span></li>
    </ul>
)
}
function Admin(){
    return (
        <ul className='navbar-nav'>
        <li className="nav-item"><span className="nav-link">This is the ADMIN subheader</span></li>
    </ul>
)
}

function Header() {
    const state = useContext(AuthContext);
    console.log(state)
    return (
        <header>
            <nav className='navbar bg-primary p-3'>
                <a className='navbar-brand' href='/'><img src="/refactorlogo.png" alt="logo" width={200}/></a>
                {state.authState ? <LoggedIn /> : <LoggedOut/>}
            </nav>
            <nav className='navbar bg-secondary navbar-dark'>
                {state.authRole === "client" && <Client/>}
                {state.authRole === "admin" && <Admin/>}
            </nav>
        </header>
    )
}

export default Header;
