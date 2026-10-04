import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const nameSchema = Joi.string()
  .trim()
  .min(4)
  .pattern(/^[^0-9]+$/)
  .messages({
    "string.base": "Name must be a text string",
    "string.empty": "Name field cannot be empty",
    "string.min": "Name must be more than 3 characters long",
    "string.pattern.base": "Name must not contain any numbers",
    "any.required": "Name is required",
  });

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email()
  .messages({
    "string.base": "Email must be a text string",
    "string.empty": "Email field cannot be empty",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/[^a-zA-Z0-9]/, "symbol")
  .messages({
    "string.base": "Password must be a text string",
    "string.empty": "Password field cannot be empty",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be atmost 16 characters long",
    "string.pattern.name": "Password must contain at least 1 {#name}",
    "any.required": "Password is required",
  });

export const signupSchema = Joi.object({
  name: nameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
});


export const validateInput = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({
        success: false,
        mssg:"Request body is missing or invalid JSON format",
        
      });
      return;
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message)[0];
      res.status(400).json({
        success: false,
        mssg: errorMessages,
    
      });
      return;
    }

    req.body = value;
    next();
  };
};

export const validateSignup = validateInput(signupSchema);

