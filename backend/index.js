require('dotenv').config();
const express = require("express");
const { connection } = require("./configs/db.connect");
const cors = require("cors");
const { UserRouter } = require('./routes/user.route');
const { DoctorRouter } = require('./routes/doctor.route');

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
    response.send("Welcome to Masai Hospital App");
});

app.use("/users", UserRouter);
app.use("/doctors", DoctorRouter);

app.listen(process.env.port, async() => {
    try {
        await connection;
        console.log(`Server is running at port ${process.env.port}`);
    } catch (error) {
        console.log("Unable start the server\n", "Error: ", error);
    }
});