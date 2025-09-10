/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TErrorSources,
  TGenericErrorResponse,
} from "../interfaces/error.types";

export const handlerZodError = (err: any): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = err.issues.map((issue: any) => ({
    // Create a full path like "name -> lastName -> nickname"
    path: issue.path.join(" -> ") || "unknown",
    message: issue.message,
  }));

  return {
    statusCode: 400,
    message: "Validation failed (Zod Error)",
    errorSources,
  };
};
