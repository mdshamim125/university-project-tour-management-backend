import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: `Invalid value '${err.value}' for field '${err.path}'. Please provide a valid MongoDB ObjectId.`,
  };
};
