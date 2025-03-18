const sequelize = require('../db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true,},
    number: {type: DataTypes.STRING, unique: true,},
    name: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
    programs_id: {type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: false},
    diplom: {type: DataTypes.BOOLEAN},
    organiztion: {type: DataTypes.STRING},
    inn: {type: DataTypes.STRING},

    // forgot_pass_code: {type: DataTypes.STRING},
    well_videos: {type: DataTypes.INTEGER, defaultValue: 0},
    well_tests: {type: DataTypes.INTEGER, defaultValue: 0},
    well_practical_works: {type: DataTypes.INTEGER, defaultValue: 0},
})

const Application = sequelize.define('application', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    number: {type: DataTypes.STRING, unique: true, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    
})

const Admin = sequelize.define('admin', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true,},
    number: {type: DataTypes.STRING, unique: true,},
    name: {type: DataTypes.STRING, allowNull: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "ADMIN"},
    programs_id: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
    users_id: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
})

const Program = sequelize.define('program', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    admin_id: {type: DataTypes.INTEGER},
    theme_id: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
    number_of_practical_work: {type: DataTypes.INTEGER, allowNull: false},
    number_of_test: {type: DataTypes.INTEGER, allowNull: false},
    number_of_videos: {type: DataTypes.INTEGER, allowNull: false},
    presentation_src: {type: DataTypes.STRING}
})

const Theme = sequelize.define('theme', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    admin_id: {type: DataTypes.INTEGER},
    
})

const Punct = sequelize.define('punct', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    admin_id: {type: DataTypes.INTEGER},
    lection_src: {type: DataTypes.STRING},
    video_src: {type: DataTypes.STRING},
    test_id: {type: DataTypes.STRING},
})

const Test = sequelize.define('test', {
    id: {type: DataTypes.DOUBLE, primaryKey: true},
    title: {type: DataTypes.STRING},
    admin_id: {type: DataTypes.INTEGER},
    
})

const TestPunct = sequelize.define('test_punct', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    question: {type: DataTypes.STRING},
    answers: {type: DataTypes.ARRAY(DataTypes.STRING)},
    correct_answer: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
    several_answers: {type: DataTypes.BOOLEAN},
})

const UserProgram = sequelize.define('user_program', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    
})




Admin.hasMany(Program)
Program.belongsTo(Admin)

Program.hasMany(Theme)
Theme.belongsTo(Program)

Theme.hasMany(Punct)
Punct.belongsTo(Theme)

Punct.hasOne(Test)
Test.belongsTo(Punct)

Test.hasMany(TestPunct)
TestPunct.belongsTo(Test);

Admin.hasMany(User)
User.belongsTo(Admin)

User.belongsToMany(Program, {through: UserProgram})
Program.belongsToMany(User, {through: UserProgram})




module.exports = {
    User, Admin, Program, Theme, Punct, Application, Test, TestPunct
}