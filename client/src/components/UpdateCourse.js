import { useRef, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiHelper'
import ErrorsDisplay from './ErrorsDisplay';
import UserContext from '../context/UserContext';

/**
 * This componenet allows account holders to update the their own courses only. 
 * If a user who does not have an account they will be required to sign in. Or create an
 * account.
 */
const UpdateCourse = () => {

  const { authUser, authCred, actions } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();


  //State
  const title = useRef(null);
  const description = useRef(null);
  const estimatedTime = useRef(null);
  const materialsNeeded = useRef(null);



  useEffect(() => {


     /**
 * When  Account holder clicks on Update Course handleGetCourse() will pull course based on id. 
 * The data will be used as a "default values" in the fields. If the creator of the course wants
 *  to change the information.
 */ 

    const handleGetCourse = async () => {
         try {
        const response = await api(`/courses/${id}`, "GET", null, null);       
          if (response.status === 200) {         
            const data = await response.json();
            setCourses(data);
            // await actions.signIn(credentials);
          } else if (response.status === 400) {
            const data = await response.json();
            setErrors(data.errors);
          } else if (response.status === 403) {
            navigate("/forbidden");        
          } else if (response.status === 404) {
            navigate("/notfound");
          }
          else {
            throw new Error();
          }
        } catch (error) {
          console.log(errors);
          navigate("/error");

        }
      } // end of handleGet Course

    handleGetCourse();
    
    }, [id, actions, errors, navigate, courses, authUser]);
   

  //Update Course Handler

  const handleUpdateCourse = async (event) => {
    event.preventDefault();

    const course = {
      title: title.current.value,
      description: description.current.value,
      estimatedTime: estimatedTime.current.value,
      materialsNeeded: materialsNeeded.current.value,

    }


    const credentials = {
      emailAddress: authCred.emailAddress,
      password: authCred.password
    };

    /* This allows the account holder to update their course. Only if the course id and their user id is the same.
    *  However, an account holder will be able to see an update course of another user but will not be able to update it.
    * If they make an attempt they will get a 403-Forbidden page.
    */
    try {
      const response = await api(`/courses/${id}`, "PUT", course, credentials);
      if (response.status === 201 || response.status === 204) {
        console.log(`${course.title} has now been updated`);
        await actions.signIn(credentials);
        navigate("/");
      } else if (response.status === 400) {
        const data = await response.json();
        setErrors(data.errors);
      } else if (response.status === 403) {
        navigate("/forbidden");
      } else if (response.status === 404) {
        navigate("/notfound");
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(errors);
      navigate("/error");

    }


  }//end of handleUpdateCourse


  //Selecting cancel will return to the course description unchanged
  const handleCancel = (event) => {
    event.preventDefault();
    navigate(`/api/courses/${id}`);
  } // end of handleCancel

  return (
    <main>
      <div className="wrap">
        <h2>Update Course</h2>
        <ErrorsDisplay errors={errors} />
        <form onSubmit={handleUpdateCourse}>
          <div className="main--flex">
            <div>
              <label htmlFor="title">Course Title</label>
              <input id="title"
                name="title"
                type="text"
                ref={title}
                defaultValue={courses.title} />
              <p>By:{` `}  {/* Added the empty literal to create space btween the By and First Name  */}
                {courses.student ? courses.student.firstName : null} {` `} 
                {courses.student ? courses.student.lastName : null}
              </p>
              <label htmlFor="courseDescription">Course Description</label>
              <textarea
                id="description"
                name="description"
                ref={description}
                defaultValue={courses.description} >
              </textarea>
            </div>
            <div>
              <label htmlFor="estimatedTime">Estimated Time</label>
              <input
                id="estimatedTime"
                name="estimatedTime"
                type="text"
                ref={estimatedTime}
                defaultValue={courses.estimatedTime} />

              <label htmlFor="materialsNeeded"> Materials Needed</label>
              <textarea
                id="materialsNeeded"
                name="materialsNeeded"
                ref={materialsNeeded}
                defaultValue={courses.materialsNeeded} >
              </textarea>
            </div>
          </div>
          <button className="button" type="submit">Update Course</button><button className="button button-secondary" onClick={handleCancel} >Cancel</button>
        </form>
      </div>

    </main>
  );
}

export default UpdateCourse;
