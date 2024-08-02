import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/apiHelper'
import Markdown from 'react-markdown';
import UserContext from '../context/UserContext';

const CoursesDetail = () => {
  const { authUser, authCred, actions } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();


  // fetch Course Detail data

  useEffect(() => {
    const handleGetCourse = async () => {
      // const credentials = {
      //   emailAddress: authCred.emailAddress,
      //   password: authCred.password
      // };

      try {
        const response = await api(`/courses/${id}`, "GET", null, null);
        if (response.status === 200) {
          //console.log(`${courses.title} has now been deleted`);
          const data = await response.json();       
          setCourses(data);
         // await actions.signIn(credentials);
        } else if (response.status === 400) {
          const data = await response.json();
          setErrors(data.errors);
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

  


  }, [id, actions,  errors, navigate]);


  // This handle will allow the owner of the course to delete their own course.
  const handleDeleteCourse = async () => {
    const credentials = {
      emailAddress: authCred.emailAddress,
      password: authCred.password
    };

    try {
      const response = await api(`/courses/${id}`, "DELETE", null, credentials);
      if (response.status === 201 || response.status === 204) {
        console.log(`${courses.title} has now been deleted`);
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



  return (

    <main>
      <div className="actions--bar">
        <div className="wrap">
          {/*  The two links below will become visible if the creater of the course logs in */}
          {
            authUser && authUser.id === courses.userId
              ?
              <>
                <Link className="button" to={`/courses/${courses.id}/update`}>Update Course</Link>
                <Link className="button" onClick={handleDeleteCourse}>Delete Course</Link>
              </>
              :
              null
          }

          <Link className="button button-secondary" to="/">Return to List</Link>

        </div>
      </div>

      <div className="wrap">
        <h2>Course Detail</h2>

        <form>

          <div className="main--flex">
            <div>
              <h3 className="course--detail--title">Course</h3>
              <h4 className="course--name"> {courses.title}</h4>
              {/* not sure why this isn't working.  */}
              <p>By  { courses.student ? courses.student.firstName : null } {courses.student ? courses.student.lastName : null }

                 </p>
              <p><Markdown>{courses.description}</Markdown></p>
            </div>
            <div>
              <h3 className="course--detail--title">Estimated Time</h3>
              <p>{courses.estimatedTime}</p>
              <h3 className="course--detail--title">Materials Needed</h3>
              <ul className="course--detail--list">
                <Markdown>
                  {courses.materialsNeeded}
                </Markdown>
         
              </ul>
            </div>
          </div>
        </form>

      </div>
    </main>



  );
}

export default CoursesDetail;
