import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


/**
 * This component lists all of the courses listed within the database. And allows the user
 * user to click on the course and view  the Course Details.
 */
const Courses = () => {
   // data will be sent into setCourses(), and courses variable will be used as reference
  const [courses, setCourses] = useState([]);


  //retrives the courses
  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then(response => response.json()) //takes the response object and return it in JSONs format
      .then(responseData => setCourses(responseData)) //takes the json data and send it to setCourses
      .catch(error => console.log("Error fetching and parsing data", error));
  }, []);

  // Creates and builds the course list to be displayed
  const courseName = courses.map((course, index) =>
    <Link className="course--module course--link" to={`/api/courses/${course.id}`} key={index}>
      <h2 className="course--label">Course</h2>
      <h3 className="course--title">{course.title}</h3>
    </Link>
  );

  return (
    <div className="wrap header--flex">
      <main>
        <div className="wrap main--grid">
          {courseName}

          <Link className="course--module course--add--module" to="/courses/create">
            <span className="course--add--title">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                viewBox="0 0 13 13" className="add"><polygon points="7,6 7,0 6,0 6,6 0,6 0,7 6,7 6,13 7,13 7,7 13,7 13,6 "></polygon></svg>
              New Course
            </span>
          </Link>
        </div>
      </main>
    </div>
  );






}

export default Courses;
