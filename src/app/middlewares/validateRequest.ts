import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateRequest =
  (zodSchema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // For multipart/form-data
      if (typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      // Validate ONLY body fields (not file)
      req.body = await zodSchema.parseAsync(req.body);

      next();
    } catch (error) {
      next(error);
    }
  };


// import { NextFunction, Request, Response } from "express";
// import { ZodSchema } from "zod";

// export const validateRequest =
//   (zodSchema: ZodSchema) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     // console.log(req.body);
//     try {
//       req.body = await zodSchema.parseAsync(req.body);
//         // console.log(req.body);
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };

// import { NextFunction, Request, Response } from "express";
// import { ZodObject } from "zod";

// export const validateRequest =
//   (zodSchema: ZodObject) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // req.body =JSON.parse(req.body.data || {}) || req.body
//       if (req.body.data) {
//         req.body = JSON.parse(req.body.data);
//       }
//       req.body = await zodSchema.parseAsync(req.body);
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
