const { fail } = require("../utils/response");

function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return fail(
        res,
        400,
        "Validation failed",
        error.details.map((detail) => detail.message)
      );
    }

    req[source] = value;
    return next();
  };
}

module.exports = { validate };
