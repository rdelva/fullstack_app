import { useRef, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiHelper'


import ErrorsDisplay from './ErrorsDisplay';
import UserContext from '../context/UserContext';


const UpdateCourse = () => {

  const {authCred, actions } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  
  //Pulls in the requested course so it can be displayed within the form fields.
  useEffect(() => {
    fetch(`http://localhost:5000/api/courses/${id}`)
      .then(response => response.json()) //takes the response object and return it in JSONs format
      .then(responseData => setCourses(responseData)) //takes the json data and send it to setCourses
      .catch(error => console.log("Error fetching and parsing data", error));
  }, [id]);

  //State
  const title = useRef(null);
  const description = useRef(null);
  const estimatedTime = useRef(null);
  const materialsNeeded = useRef(null);
  const [errors, setErrors] = useState([]);


  //Update Course Handler

  const handleUpdateCourse = async (event) => {
    event.preventDefault();

    const course = {
      title: title.current.value,
      description: description.current.value,
      estimatedTime: estimatedTime.current.value,
      materialsNeeded: materialsNeeded.current.value,
      
    }
 
   

   
    // let items = course.materialsNeeded.split("\n");
     
    // let result = items.map( (item) => {
    //    return `* ${item} \n`;
    // });

    //     console.log(items);    

    // console.log(result.toString( ));

    const credentials = {
      emailAddress: authCred.emailAddress,
      password: authCred.password
    };

    try {
      const response = await api(`/courses/${id}`, "PUT", course, credentials);
      if (response.status === 201 || response.status === 204) {
        console.log(`${course.title} has now been updated`);
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


  }//end of handleUpdateCourse

  const handleCancel = (event) => {
    event.preventDefault();
    navigate("/");

  }
 


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
              <p>By  
                { courses.student ? courses.student.firstName : null } 
                {courses.student ? courses.student.lastName : null }
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

              <label htmlFor="materialsNeeded">Materials Needed</label>
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
