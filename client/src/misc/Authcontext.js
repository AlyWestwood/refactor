import { createContext } from "react";

export const AuthContext = createContext({
    authState: null,
    authUser: {},
    setAuthState: null,
    setAuthUser: null
});