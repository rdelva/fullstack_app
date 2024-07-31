import { useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiHelper'

import ErrorsDisplay from './ErrorsDisplay';
import UserContext from '../context/UserContext';

const CreateCourse = () => {
    const { authUser, authCred, actions } = useContext(UserContext);
    const navigate = useNavigate();

    //State
    const title = useRef(null);
    const description = useRef(null);
    const estimatedTime = useRef(null);
    const materialsNeeded = useRef(null);
    const [errors, setErrors] = useState([]);


    console.log(authUser);


    // Create CouRSE Event Handler
    const handleCreateCourse = async (event) => {
        event.preventDefault();

        const course = {
            title: title.current.value,
            description: description.current.value,
            estimatedTime: estimatedTime.current.value,
            materialsNeeded: materialsNeeded.current.value,
            userId: authUser.id
        }

        console.log(course);

        const credentials = {
            emailAddress: authCred.emailAddress,
            password: authCred.password
        };



        try {
            const response = await api("/courses", "POST", course, credentials);
            if (response.status === 201) {
                console.log(`${course.title} has now been created`);
                await actions.signIn(credentials);
                navigate("/");
            } else if (response.status === 400) {
                const data = await response.json();
                setErrors(data.errors);
            } else {
                throw new Error();
            }
        } catch (error) {
            console.log(errors);
            navigate("/error");

        }
    }

    const handleCancel = (event) => {
        event.preventDefault();
        navigate("/");

    }
    

    return (
        <main>
            <div className="wrap">
                <h2>Create Course</h2>
                <div className="validation--errors">
                    <h3>Validation Errors</h3>
                    <ErrorsDisplay errors={errors} />

                </div>
                <form onSubmit={handleCreateCourse}>
                    <div className="main--flex">
                        <div>
                            <label htmlFor="title">Course Title</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                ref={title}
                                placeholder="" />

                            <p>By {authUser.firstName} {authUser.lastName}</p>

                            <label htmlFor="description">Course Description</label>
                            <textarea
                                id="description"
                                name="description"
                                ref={description} >
                            </textarea>
                        </div>
                        <div>
                            <label htmlFor="estimatedTime">Estimated Time</label>
                            <input
                                id="estimatedTime"
                                name="estimatedTime"
                                type="text"
                                ref={estimatedTime}
                                placeholder="" />

                            <label htmlFor="materialsNeeded">Materials Needed</label>
                            <textarea
                                id="materialsNeeded"
                                name="materialsNeeded"
                                ref={materialsNeeded}
                                placeholder="">
                            </textarea>
                        </div>
                    </div>
                    <button className="button" type="submit">Create Course</button><button className="button button-secondary" onClick={handleCancel}>Cancel</button>
                </form>
            </div>
        </main>
    );
}

export default CreateCourse;
