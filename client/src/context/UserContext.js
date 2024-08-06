import { createContext, useState } from "react";
import Cookies from "js-cookie";
import { api } from '../utils/apiHelper'

const UserContext = createContext(null);

/**
 * Allows the user  to set up props to be used through out the entire application if
 * they use UserContext
 */
export const UserProvider = (props) => {
    /**
     * authenticated User, and authcreds are cookies which are used to hold the credentials and user log in info.
     */
    const cookie = Cookies.get("authenticatedUser");
    const cookieCred = Cookies.get("authCreds");


    /**
     * Checks to see if there is cookie
     */
    const [authUser, setAuthUser] = useState(cookie ? JSON.parse(cookie) : null ); //saves the user info
    const [authCred, setAuthCred] = useState(cookieCred ? JSON.parse(cookieCred) : null );  //saves the email adress and password
    // console.log(authCred);

    /**
     * When user signs in it goes to the util/api.js sends in the username and password information to log in.
     * and returns with a response. If the response is OK. It sets up the cookie and allows the user to log in
     */
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

    //Remove Cookies from the website and allows the user to sinout
    const signOut = () => {
        setAuthUser(null);
        setAuthCred(null);
        Cookies.remove("authenticatedUser", "");
        Cookies.remove("authCreds", "");
    }

    /**
     * sets up the variables and methods to be used throughout the application if they are
     * going to use a UserContext
     */
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