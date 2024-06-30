import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import mongoose from "mongoose"



const appointmentRegister = asyncHandler( async (req, res) => {
    const { name , phone , address , service , appointmentDate , appointmentTime , message , status} = req.body;
    // console.log("The appointment request is:",req);
    console.log("The appointment request body is:",req.body);
    const createdById = req.user._id;

    // Here i check if any field are empty 
    if(
        [name, phone, appointmentDate].some((field)=> field.trim() === "")
    ){
        throw new ApiError(400, "All field are requered")
    }

    const existAppointment = await Appointment.findOne({
        $and: [{ name },{appointmentDate}]
    })

    if(existAppointment){
        throw new ApiError(409, "There is already an appointment with this name and date.")
    }

    const appointment = await Appointment.create({
        name , phone , address , service , appointmentDate , appointmentTime , status , message , createdBy: createdById,
    })

    if (!appointment) {
        throw new ApiError(500, "Something went worng when doing Appointment")
    }

    return res.status(201).json(
        new ApiResponse(200, appointment , "Appointment created")
    )
})

const getAllAppointment = asyncHandler( async (req, res) => {
    // console.log("The appointment request is:",req);
    // console.log("The appointment request body is:",req.body);
    const requestById = req.user._id;
    // console.log("Requext by",requestById);
    const appointmentList = await Appointment.find().sort({ createdAt: -1 })

    // console.log("Request data by",appointmentList);

    return res.status(201).json(
        new ApiResponse(200, appointmentList , "Appointment List Get success")
    )
})

const getAppointmentsByUserId = asyncHandler( async (req, res) => {
    //console.log("The appointment request is:",req);
    // console.log("The appointment request body is:",req.body);
    const requestById = req.user._id;
    // console.log("Requested user id is",requestById);

    if(!requestById){
        throw new ApiError(400, "Missing User IDs")
    }

    const appointmentList = await Appointment.find({ createdBy: requestById }).sort({ createdAt: -1 })

    // console.log("Requested Appointment list",appointmentList);

    return res.status(201).json(
        new ApiResponse(200 , appointmentList , "Appointment List Get success")
    )
})

const getSingleAppointment = asyncHandler( async (req, res) => {
    // console.log("The appointment request is:",req);
    // console.log("The appointment request body is:",req.body);
    const { id } = req.params;
    const requestAppointmentId = id;
    console.log("requestAppointmentId is",requestAppointmentId);

    const appointment = await Appointment.findById(requestAppointmentId)


    console.log("Request data by",appointment);

    return res.status(201).json(
        new ApiResponse(200 ,appointment, "Single appointment Get success")
    )
})

const updateSingleAppointment = asyncHandler( async (req, res) => {
    const { id } = req.params;
    const requestAppointmentId = id;
    // console.log("requestAppointmentId is",requestAppointmentId);

    const updateData = {}; // Initialize an empty object for updates

    // Check for each field in the request body and add it to updateData
    const fieldsToUpdate = [
      "name",
      "phone",
      "address",
      "service",
      "appointmentDate",
      "appointmentTime",
      "message",
      "status",
    ]; // Replace with your actual field names
  
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
  
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      requestAppointmentId,
      { $set: updateData },
      { new: true }
    );

    // console.log("updatedAppointment is",updatedAppointment);

    return res.status(201).json(
        new ApiResponse(200 ,updatedAppointment, "Single appointment update Get success")
    )
})

const deleteAppointment = asyncHandler( async (req, res) => {
    const { id } = req.params;
    const requestAppointmentId = id;
    console.log("requestAppointmentId for delete is",requestAppointmentId);

    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(requestAppointmentId);
        if (!deletedAppointment) {
            return res.status(404).json(new ApiResponse(404, "Appointment not found"));
        }
    
        // Optionally log deleted appointment details
        console.log("Deleted appointment:", deletedAppointment);
    
        return res.status(201).json(
            new ApiResponse(200, "Appointment deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
})

const deleteMultipleAppointments = asyncHandler(async (req, res) => {
    const appointmentIds = req.body; // Access IDs from request body
    console.log("The body is:", req.body);
    console.log("The appointmentIds is:", appointmentIds);

    if (!appointmentIds || !appointmentIds.length) {
        throw new ApiError(400, "Missing appointment IDs")
    }
  
    try {
      const deletedCount = await Appointment.deleteMany({ _id: { $in: appointmentIds } });
      return res.status(200).json(
        new ApiResponse(200, `Deleted ${deletedCount.deletedCount} appointments`)
      );
    } catch (error) {
      console.error("Error deleting appointments:", error);
      return res.status(500).json(new ApiError(500, "Internal server error"));
    }

});




export { appointmentRegister , getAllAppointment , getAppointmentsByUserId , getSingleAppointment , updateSingleAppointment , deleteAppointment , deleteMultipleAppointments}