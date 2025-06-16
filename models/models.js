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
    address: {type: DataTypes.STRING},
    organiztion: {type: DataTypes.STRING},
    inn: {type: DataTypes.STRING},
    statistic: {type: DataTypes.INTEGER},
    
    graduation_date: {type: DataTypes.DATE},

    forgot_pass_code: {type: DataTypes.STRING},
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
    
})

const Theme = sequelize.define('theme', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    admin_id: {type: DataTypes.INTEGER},
    theme_id: {type: DataTypes.INTEGER},
    presentation_src: {type: DataTypes.STRING},
    presentation_title: {type: DataTypes.STRING},
    presentation_id: {type: DataTypes.INTEGER},
    lection_src: {type: DataTypes.STRING},
    lection_title: {type: DataTypes.STRING},
    lection_id: {type: DataTypes.STRING},
    lection_html: {type: DataTypes.TEXT},
    video_src: {type: DataTypes.STRING},
})

const Punct = sequelize.define('punct', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    punct_id: {type: DataTypes.INTEGER},
    title: {type: DataTypes.STRING},
    admin_id: {type: DataTypes.INTEGER},
    lection_src: {type: DataTypes.STRING},
    lection_title: {type: DataTypes.STRING},
    lection_id: {type: DataTypes.STRING},
    lection_html: {type: DataTypes.TEXT},
    practical_work: {type: DataTypes.STRING},
    video_src: {type: DataTypes.STRING},
    test_id: {type: DataTypes.STRING},
})

const Test = sequelize.define('test', {
    id: {type: DataTypes.DOUBLE, primaryKey: true},
    title: {type: DataTypes.STRING},
    admin_id: {type: DataTypes.INTEGER},
    time_limit: {type: DataTypes.INTEGER},
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

const Statistic = sequelize.define('statistic', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    users_id: {type: DataTypes.INTEGER},
    programs_id: {type: DataTypes.INTEGER},

    well_videos: {type: DataTypes.INTEGER, defaultValue: 0},
    well_tests: {type: DataTypes.INTEGER, defaultValue: 0},
    well_practical_works: {type: DataTypes.INTEGER, defaultValue: 0},

    max_videos: {type: DataTypes.INTEGER, defaultValue: 0},
    max_tests: {type: DataTypes.INTEGER, defaultValue: 0},
    max_practical_works: {type: DataTypes.INTEGER, defaultValue: 0},
})

const ThemeStatistic = sequelize.define('theme_statistic', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    theme_id: {type: DataTypes.INTEGER},
    admin_id: {type: DataTypes.INTEGER},
    well: {type: DataTypes.BOOLEAN},
})

const PunctStatistic = sequelize.define('punct_statistic', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    punct_id: {type: DataTypes.INTEGER},
    admin_id: {type: DataTypes.INTEGER},
    lection: {type: DataTypes.BOOLEAN},
    practical_work: {type: DataTypes.STRING},
    video: {type: DataTypes.BOOLEAN},
    test_bool: {type: DataTypes.BOOLEAN},
})

const PracticalWork = sequelize.define('practical_work', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    task: {type: DataTypes.STRING},
    practic_title: {type: DataTypes.STRING},
    test: {type: DataTypes.BOOLEAN},
    file_src: {type: DataTypes.STRING},
    answer: {type: DataTypes.STRING},
    users_id: {type: DataTypes.INTEGER},
    program_id: {type: DataTypes.INTEGER},
    theme_id: {type: DataTypes.INTEGER},
    punct_id: {type: DataTypes.INTEGER}
})



Admin.hasMany(Program)
Program.belongsTo(Admin)

Program.hasMany(Theme, { onDelete: 'cascade', hooks: true })
Theme.belongsTo(Program)

Theme.hasMany(Punct, { onDelete: 'cascade', hooks: true })
Punct.belongsTo(Theme)

Punct.hasOne(Test, { onDelete: 'cascade', hooks: true })
Test.belongsTo(Punct)

Test.hasMany(TestPunct, { onDelete: 'cascade', hooks: true })
TestPunct.belongsTo(Test);

Admin.hasMany(User)
User.belongsTo(Admin)

User.belongsToMany(Program, {through: UserProgram})
Program.belongsToMany(User, {through: UserProgram})

User.hasMany(Statistic)
Statistic.belongsTo(User)

Statistic.hasMany(ThemeStatistic, { onDelete: 'cascade', hooks: true })
ThemeStatistic.belongsTo(Statistic)

ThemeStatistic.hasMany(PunctStatistic, { onDelete: 'cascade', hooks: true })
PunctStatistic.belongsTo(ThemeStatistic)

Program.hasOne(Statistic)
Statistic.belongsTo(Program)


User.hasMany(PracticalWork)
PracticalWork.belongsTo(User)



module.exports = {
    User, Admin, Program, Theme, Punct, Application, Test, TestPunct, Statistic, ThemeStatistic, PunctStatistic, PracticalWork
}