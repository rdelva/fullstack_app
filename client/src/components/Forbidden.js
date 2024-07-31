import {Link } from 'react-router-dom';
const Forbidden = () => {
    return (
        <main>
            <div className="wrap">
                <h2>Forbidden</h2>
                <p>Oh oh! You can't access this page! Please <Link to="/signin">sign in</Link> to have access.</p>
            </div>
        </main>
    );


}


export default Forbidden;