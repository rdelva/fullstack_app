import { Route, Routes } from "react-router-dom";


import Header from './components/Header';
import Courses from './components/Courses';
import CreateCourse from './components/CreateCourse';
import UpdateCourse from './components/UpdateCourse';
import CourseDetail from './components/CourseDetail';
import UserSignUp from './components/UserSignUp';
import UserSignIn from './components/UserSignIn';
import UserSignOut from './components/UserSignOut';
import UnhandledError from "./components/UnhandledError";
import NotFound from "./components/NotFound";
import Forbidden from "./components/Forbidden";
import PrivateRoute from "./components/PrivateRoute";


function App() {

  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Courses />} />
          <Route path="/api/courses" element={<Courses />} />
          <Route path="/api/courses/:id" element={<CourseDetail />} />
          <Route path="/signup" element={<UserSignUp />} />
          <Route path="/signin" element={<UserSignIn />} />
          <Route path="/signout" element={<UserSignOut />} />
          <Route path="/error" element={<UnhandledError />} />
          <Route path="*" element={<UnhandledError />} />
          <Route path="/notfound" element={<NotFound />} />          
          <Route path="/forbidden" element={<Forbidden />} />
          <Route element={<PrivateRoute />}>
            <Route path="/courses/create" element={<CreateCourse />} />
            <Route path="/courses/:id/update" element={<UpdateCourse />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
