'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');


module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type:DataTypes.STRING,
            allowNull:false,
            validate:{
                isAlpha:{
                    msg: "Please enter a first name with the valid characters [Aa-Za]",
                },
                notEmpty: {
                    msg: "Please enter a first name",
                },
                notNull: {
                    msg: "A first name is required"
                },               
            },
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                isAlpha:{
                    msg: "Please enter last name with the valid characters [Aa-Za]",
                },                
                notEmpty: {
                    msg: "Please enter a last name",
                },
                notNull: {
                    msg: "A last name is required"
                },                
            },
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail:{ 
                    msg:"Please enter a valid email address"                      
                },
                notNull: {
                    msg: "An email address is required"
                }, 
            },
            unique: {
                msg: "Email Address already exists. Please use a different email address",
            } 
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                  msg: "A password is required"
                },
                notEmpty: {
                  msg: "Please provide a password"
                },
                len: {
                  args: [8, 20],
                  msg: "The password should be between 8 and 20 characters in length"
                },
                set(val) {
                    if (val) {
                      const hashedPassword = bcrypt.hashSync(val, 10);
                      this.setDataValue('password', hashedPassword);
                    }
                },
            },

        },
    }, { sequelize });


    User.associate = (models) => {
        //DB Associations
        User.hasMany(models.Course, {
            as: 'student', // allias
            foreignKey: {
                fieldName: 'userId',
                field: 'userId',
                allowNull: false,
            }
        });
    }

    return User;
};