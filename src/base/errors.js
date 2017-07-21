'use strict';

function ErrorFactory(name) {
   return class AppError extends Error {
    constructor(message) {
      super(message);
      this.name = name;
      this.message = message; 
      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
      } else { 
        this.stack = (new Error(message)).stack; 
      }
    }
  }     
}

let LogicError = ErrorFactory('LogicError');
let NetLostError = ErrorFactory('NetLostError');

export {
  LogicError,
  NetLostError
}
