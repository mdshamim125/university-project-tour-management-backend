import { Request, Response } from "express";
// import catchAsync from "../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;
  const booking = await BookingService.createBooking(
    req.body,
    decodeToken.userId,
  );
  // console.log(booking);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;
  const bookings = await BookingService.getUserBookings(decodeToken.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings,
  });
});
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await BookingService.getBookingById(req.params.bookingId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: booking,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await BookingService.getAllBookings(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const updated = await BookingService.updateBookingStatus(
    req.params.bookingId,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking Status Updated Successfully",
    data: updated,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getUserBookings,
  updateBookingStatus,
};
