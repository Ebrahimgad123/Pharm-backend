import Joi from "joi";

export const patientRegistrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
  }),
  mobileNumber: Joi.string()
    .pattern(/^(\+\d{8,15}|\d{8,15})$/)
    .min(8)
    .max(16)
    .required()
    .messages({
      "string.pattern.base": "Invalid mobile number format",
    }),
  nationalId: Joi.string().required(),
  dateOfBirth: Joi.date().required(),

  gender: Joi.string().valid("male", "female").lowercase().required(),

  emergencyContact: Joi.object({
    name: Joi.string().required().trim(),
    mobileNumber: Joi.string()
      .pattern(/^(\+\d{8,15}|\d{8,15})$/)
      .min(8)
      .max(16)
      .required()
      .messages({
        "string.pattern.base": "Invalid emergency mobile number",
      }),
    relation: Joi.string()
      .valid("wife", "husband", "parent", "child", "sibling")
      .lowercase()
      .required()
      .trim(),
  }).required(),

  files: Joi.array().items(
    Joi.object({
      filename: Joi.string().allow(null).trim(),
      path: Joi.string().required().trim(),
    })
  ).required(),

  familyMembers: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim(),
      nationalId: Joi.string().required(),
      patientId: Joi.string().length(24).hex().required(), // ObjectId as hex
      gender: Joi.string().valid("male", "female").lowercase().required(),
      relation: Joi.string()
        .valid("wife", "husband", "parent", "child", "sibling")
        .lowercase()
        .required(),
    })
  ),

  revFamilyMembers: Joi.array().items(
    Joi.string().length(24).hex() // ObjectId
  ),

  prescriptions: Joi.array().items(
    Joi.string().length(24).hex()
  ),

  package: Joi.string().length(24).hex(),

  subscribedToPackage: Joi.boolean(),

  packageRenewalDate: Joi.date(),

  healthRecords: Joi.array().items(
    Joi.string().length(24).hex()
  ),

  address: Joi.array().items(Joi.string().trim()),

  wallet: Joi.number().min(0),
});
