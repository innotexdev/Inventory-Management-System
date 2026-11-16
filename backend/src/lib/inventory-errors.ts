import { HttpError } from "./errors";

export class DuplicateSerialNumberError extends HttpError {
  constructor() {
    super(409, "Serial number is already in use", "CONFLICT", {
      serialNumber: "Serial number is already in use",
    });
  }
}

export class ItemConflictError extends HttpError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}
