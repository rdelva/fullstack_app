import { createContext, useState } from "react";
import Cookies from "js-cookie";
import { api } from '../utils/apiHelper'

const UserContext = createContext(null);


/*
*/

export const UserProvider = (props) => {
    const cookie = Cookies.get("authenticatedUser");
    const cookieCred = Cookies.get("authCreds");

    // console.log(cookie);
    // console.log(cookieCred);
    
    const [authUser, setAuthUser] = useState(cookie ? JSON.parse(cookie) : null ); //saves the user info
    const [authCred, setAuthCred] = useState(cookieCred ? JSON.parse(cookieCred) : null );  //saves the email adress and password
    // console.log(authCred);


    const signIn = async (credentials) => {

        const response = await api("/users", "GET", null, credentials);
        if (response.status === 200) {
            const user = await response.json();
            setAuthUser(user);
            setAuthCred(credentials);
            Cookies.set("authenticatedUser", JSON.stringify(user),{expires: 1}); //creates the cookie for the user profile
            Cookies.set("authCreds", JSON.stringify(credentials),{expires: 1}); //creates the cookie for the username and password
            return user;
        } else if (response.status === 401) {
            return null;

        } else {
            throw new Error();
        }

    }

    //Remove Cookies from the website 
    const signOut = () => {
        setAuthUser(null);
        setAuthCred(null);
        Cookies.remove("authenticatedUser", "");
        Cookies.remove("authCreds", "");
    }


    return (
        <UserContext.Provider value={{
            authUser,
            authCred,
            actions: {
                signIn,
                signOut
            }
        }}>

            {props.children}
        </UserContext.Provider>
    );

}


export default UserContext;