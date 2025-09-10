import mongoose from "mongoose";
import {
  TErrorSources,
  TGenericErrorResponse,
} from "../interfaces/error.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handlerValidationError = (
  err: mongoose.Error.ValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = Object.values(err.errors).map(
    (errorObject: any) => ({
      path: errorObject.path,
      message: errorObject.message,
    })
  );

  return {
    statusCode: 400,
    message: "Validation Error",
    errorSources,
  };
};
