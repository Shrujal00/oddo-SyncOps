import type { ErrorRequestHandler } from "express";
import { HttpError } from "../exceptions/http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message, code: error.code });
    return;
  }

  response.status(500).json({ message: "Unexpected server error" });
};
