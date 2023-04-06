const express = require("express");
const { DoctorModel } = require("../models/doctor.model");
const DoctorRouter = express.Router();


//DATA GET

DoctorRouter.get("/:id", async (request, response) => {
    const ID = request.params.id;

    try {
        const data = await DoctorModel.find({ _id: ID });
        response.send(data);
    } catch (error) {
        response.send({ "Message": "Unable to fetch data", "Error": error.message });
    }
});

// sort, filter, search, pagination

DoctorRouter.get("/", async (request, response) => {

    try {
        const page = parseInt(request.query.page) - 1 || 0;
        const limit = parseInt(request.query.limit) || 4;
        const search = request.query.search || "";
        let specialization = request.query.specialization || "All";

        const specializationOptions = [ 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Psychiatrist' ];

        specialization === "All"
            ? (specialization = [...specializationOptions])
            : (specialization = request.query.specialization.split(","));

        const Doctor = await DoctorModel.find({ name: { $regex: search, $options: "i" } })
            .where("specialization")
            .in([...specialization])
            .skip(page * limit)
            .limit(limit)

        const total = await DoctorModel.countDocuments({
            specialization: { $in: [...specialization] },
            name: { $regex: search, $options: "i" }
        });

        const DoctorData = {
            error: false,
            total,
            page: page + 1,
            limit,
            specializations: specializationOptions,
            Doctor
        };

        response.status(200).send(DoctorData);

    } catch (error) {
        response.send({ "Message": "Failed", "Error": error });
    }
});

DoctorRouter.post("/book", async (request, response) => {
    const payload = request.body;

    try {
        const data = new DoctorModel(payload);
        await data.save();
        response.send({ "Message": "Doctor Appointment Book Successfully!" });
    } catch (error) {
        response.send({ "Error": error.message });
    }
});



module.exports = { DoctorRouter };