const mysql = require("mysql2");

// Connect to the database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employeeTracker_db",
}, console.log("Successfully connected to database."));

// Prompt for inquirer
const prompt = async () => {
    const { default: inquirer } = await import("inquirer");
    return inquirer;
};

const saveEmployees = (answer) => {
    db.promise().query("INSERT INTO employee SET ?", answer)
        .then((result) => {
            console.log("Adding new employee")
            init();
        });
};

// Questions for employees and roles
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
            name: "role_id",
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

    prompt().then((inquirer) => {
        inquirer.prompt(questions).then(saveEmployees);
    });
}

// Function to start the program
const init = () => {
    prompt().then((inquirer) => {
        inquirer.prompt({
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
            // Add other conditions here...
        });
    });
}

init();
