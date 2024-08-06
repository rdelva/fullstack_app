import {useContext} from "react";
import UserContext from "../context/UserContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";



/*This component control where the user goes if they try to access a part of the site is private.
*if a user logs in they can go to CreateCourse and Update Couse if not they would have to go to the sign in page to get access
*
*/
const PrivateRoute = () => {

    const {authUser } = useContext(UserContext);
    const location = useLocation();
    console.log(location);

    if(authUser) {
        return <Outlet />   
    } else {
        return <Navigate to="/signin"  state={{from:location.pathname}} />
    }
   
}


export default PrivateRoute;