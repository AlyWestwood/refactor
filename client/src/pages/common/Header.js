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
            <li className="nav-item"><span className="nav-link">Testing to see if this works</span></li>
        </ul>
    )
}

function Header() {
    const state = useContext(AuthContext);
    console.log(state.authState)
    return (
        <header>
            <nav className='navbar bg-primary p-3'>
                <a className='navbar-brand' href='/'><img src="/refactorlogo.png" alt="logo" width={200}/></a>
            {/* <AuthContext.Consumer> */}
                {state.authState ? <LoggedIn /> : <LoggedOut/>}
        {/* </AuthContext.Consumer> */}
            </nav>
            <nav className='navbar bg-secondary navbar-dark'>
                {state.authRole === "client" && <Client/>}

            </nav>
        </header>
    )
}



export default Header;
