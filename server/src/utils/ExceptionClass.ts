class ExceptionClass extends Error {
    errorCode: number | string;
    statusCode: number;
    errors?: any;
  
    constructor(message: string, errorCode: number | string, statusCode: number, errors?: any) {
      super(message);
      this.errorCode = errorCode;
      this.statusCode = statusCode;
      this.errors = errors;
    }
  }
  
  export default ExceptionClass;
  