import { TGenericErrorResponse } from "../interfaces/error.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handlerDuplicateError = (err: any): TGenericErrorResponse => {
  // MongoDB duplicate key error usually has "keyValue"
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : "Field";
  const value = err.keyValue ? Object.values(err.keyValue)[0] : "Value";

  return {
    statusCode: 400,
    message: `${field}: "${value}" already exists! Please use another ${field}.`,
  };
};
