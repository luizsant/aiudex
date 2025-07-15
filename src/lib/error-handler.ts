export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class CustomError extends Error {
  public code: string;
  public details?: any;
  public timestamp: Date;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = "CustomError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export const ErrorCodes = {
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const handleError = (error: unknown): AppError => {
  console.error("Error occurred:", error);

  if (error instanceof CustomError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: error.message,
      timestamp: new Date(),
    };
  }

  return {
    code: ErrorCodes.UNKNOWN_ERROR,
    message: "Erro desconhecido ocorreu",
    timestamp: new Date(),
  };
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes("Network") ||
      error.message.includes("fetch") ||
      error.message.includes("timeout")
    );
  }
  return false;
};

export const showErrorToast = (error: AppError) => {
  // Integração com sistema de toast
  console.error(`[${error.code}] ${error.message}`, error.details);
};
