export type ErrorType = {
  response: ErrorResponse;
};

export type ErrorResponse = {
  data: ErrorData;
}

export type ErrorData = {
  message?: string;
  status?: number;
}