'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');


const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Course } = require('./models');





//Send a GET authenticated request that returns all properties & values  for the authenticated users
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {

  
    const user = await User.findOne({where: {emailAddress: req.currentUser.emailAddress},
        attributes: {exclude: ['password','createdAt', 'updatedAt']}
    });
        

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}));


//Send a POST request that will create a new user
router.post('/users', async (req, res) => { 

    try {
        await User.create(req.body);
        // add the user profile and set location to '/'
        res.setHeader('location', '/');
        res.status(201).end();   // Set the status to 201 Created and end the response.

    } catch (error){
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
          } else {
            throw error;
          }

    }

});


// Courses Routes/


//Get all the courses
router.get('/courses', asyncHandler(async (req, res) => {
    const course = await Course.findAll({
        include: [{
            model: User,
            as: 'student',
            attributes: {exclude: ['createdAt', 'updatedAt','password']}
        }], 
        attributes: {exclude: ['createdAt', 'updatedAt']}
    });
    if (course) {
        res.json(course).status(200);
    } else {
        res.status(404).json({ message: 'Courses not found' });
    }
}));



router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [{
            model: User,
            as: 'student',
            attributes: {exclude: ['createdAt', 'updatedAt','password']}
        }],
        attributes: {exclude: ['createdAt', 'updatedAt','password']}

    });

    if (course) {
        res.json(course).status(200);
    } else {
        res.status(404).json({ message: 'Course not found' });
    }

}));




// Create route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {

    const course = req.body;
    const errors = [];

    if (!course.title) {
        errors.push('Please enter a title"');
    }

    if (!course.description) {
        errors.push('Please enter a description"');
    }

    if (errors.length > 0) {
        //Return the validation errors to the client
        res.status(400).json({ errors });
    } else {

        const courseRecord = await Course.create({
            title: course.title,
            description: course.description,
            estimatedTime: course.estimatedTime,
            materialsNeeded: course.materialsNeeded,
            userId: course.userId
        });
        res.setHeader('location', `/courses/${courseRecord.id}`);      
        res.status(201).end();
    } // end if & else statement

}));  //End of POST course route

//This route will update the corresponding course and return a 204 HTTP status code
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

    const course = await Course.findByPk(req.params.id); // finds the record that the user is searching for
    const courseListing = req.body; //takes the info from the form
    const errors = [];

    //Checks if the course belongs to the user signing in by checking the email address
    if(req.currentUser.id == course.userId){
        if (!courseListing.title) {
            errors.push('Please enter a title"');
        }
    
        if (!courseListing.description) {
            errors.push('Please enter a description"');
        }
            
        if (errors.length > 0) {
            //Return the validation errors to the client
            res.status(400).json({ errors });
        } else {
            await course.update(req.body);
            res.status(204).end();
        } // end if & else statement

    } else {
        res.status(403).json({message: "You are not authorized to change this course"});
    }

}));


//This route will delete the corresponding course and return a 204 HTTP status code
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);

    if(course){//checks if the course exists
        if (req.currentUser.id == course.userId){ //checks if the user is deleting their own course
                await course.destroy(req.body);
                res.status(204).end();
        } else {
                res.status(403).json({message: "You are not authorized to delete this course"});

        }
    } else {
        res.status(404).json({ message: 'Course not found' });
    }

}));


module.exports = router;