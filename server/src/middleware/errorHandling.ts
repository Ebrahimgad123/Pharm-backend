import { Request, Response, NextFunction } from "express";
import ExceptionClass from "../utils/ExceptionClass";
export const NotFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errorCode: "ROUTE_NOT_FOUND"
  });
}
export const errorHandling = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500; 
  let message = err.message || "Internal Server Error";
  let errorCode = err.errorCode || "INTERNAL_ERROR";


  if (err instanceof ExceptionClass) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode
  });
};


