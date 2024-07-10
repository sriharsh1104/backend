// validators.js

const Joi = require("joi");

const signUpSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
});
const createBlogSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
});

module.exports = {
  signUpSchema,loginSchema,createBlogSchema
};
