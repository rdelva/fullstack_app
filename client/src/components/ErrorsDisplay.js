//Displays erros that occur within the application
const ErrorsDisplay = ({ errors }) => {
    let errorsDisplay = null;

    if (errors.length) {
        console.log(errors);
        errorsDisplay = (
            <div>               
                <div className="validation--errors">
                    <ul>
                        {errors.map((error, i) => <li key={i}>{error}</li>)}
                    </ul>
                </div>
            </div>
        );
    }

    return errorsDisplay;

}


export default ErrorsDisplay;