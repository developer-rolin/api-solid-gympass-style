export class LateCheckInValidationError extends Error {
  constructor() {
    super("Check in not allowed after 20 minutes of its creation");
  }
}
