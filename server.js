const inquirer = require("inquirer");
const mysql = require("mysql2");

//connect to the database
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "",
        database: "staff_db",
    },
    console.log("Successfully connected to database.")
);

//prompt for inquirer
const prompt = inquirer.createPromptModule();

const saveEmployees = (answer) => {
    db.promise().query("INSERT INTO employee SET ?", answer)
    .then((result) => {
        console.log("Adding new employee")
        init();
    });
};

// questions for employees and roles
const addEmployee = (roles, managers) => {
    const questions = [
        {
            type: "input",
            name: "first_name",
            message: "What is the employee's first name",
        },
        {
            type: "input",
            name: "last_name",
            message: "What is the employee's last name?"
        },
        {
            type: "input",
            list: "role_id",
            message: "What is the employee's role?",
            choices: roles,
        },
        {
            type: "list",
            name: "manager_id",
            message: "Who is the employee's manager?",
            choices: managers,
        }
    ];

    inquirer.prompt(questions).then(saveEmployees);
}

// funciton to start the program
const init = () => {
    prompt({
      type: "rawlist",
      message: "What would you like to do?",
      name: "view",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Exit"
      ],
    }).then((answer) => {
      if (answer.view === "View all departments") {
        db.query("SELECT * FROM department", (error, departments) => {
          if (error) console.error(error);
          console.table(departments);
          init();
        });
      }
      if (answer.view === "View all roles") {
        db.query("SELECT * FROM role", (error, roles) => {
          if (error) console.error(error);
          console.table(roles);
          init();
        });
      }
      if (answer.view === "View all employees") {
        db.query("SELECT * FROM employee", (error, employees) => {
          if (error) console.error(error);
          console.table(employees);
          init();
        });
      }

      if (answer.view === "Exit") {
        process.exit();
        init();
      }


      if (answer.view === "Add a department") {
        inquirer.prompt({
          type: "input",
          name: "department",
          message: "What is the name of the department?",
        })
          .then((answer) => {
            const { department } = answer;

            db.promise().query("INSERT INTO department (name) VALUE(?) ", department)
              .then((answer) => console.log("Adding new department"));
            init();
          });
      }


      if (answer.view === "Add a role") {
        db.promise()
          .query("SELECT id, name FROM department")
          .then(([answer]) => {
            const deptArr = answer.map((dept) => ({
              name: dept.name,
              value: dept.id,
            }));
            inquirer
              .prompt([
                {
                  type: "input",
                  name: "title",
                  message: "What is the name of the role?",
                },
                {
                  type: "input",
                  name: "salary",
                  message: "What is the salary?",
                },

                {
                  type: "list",
                  name: "department_id",
                  message: "What is the department?",
                  choices: deptArr,
                },
              ])
              .then((answer) => {
                db.promise()
                  .query("INSERT INTO role SET ?", answer)
                  .then(() => {
                    console.log("Adding new role");
                    init();
                  })
                  .catch((err) => console.error(err));
              });
          });
      }

      if (answer.view === "Add an employee") {
        db.promise().query("SELECT id, title FROM role")
          .then(([roles]) => {
            db.promise().query("SELECT id, first_name, last_name FROM employee")
              .then(([employees]) => {
                const roleChoices = roles.map((role) => ({
                  name: role.title,
                  value: role.id,
                }));
                const managerChoices = employees.map((mgr) => ({
                  name: mgr.first_name + ' ' + mgr.last_name,
                  value: mgr.id,
                }));
                addAnEmployee(roleChoices, managerChoices);
              });
          });

      };
    });
  }

  init();