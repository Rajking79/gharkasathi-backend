// Helper: Check valid 10-digit Indian Mobile Number
export const validatePhone = (req, res, next) => {
  const phone = req.body.phone || req.body.mobile;
  if (!phone) {
    return res.status(422).json({
      status: 'error',
      code: 422,
      message: 'Validation Error: Phone number is required.',
      errors: [{ field: 'phone', message: 'Field is required.' }]
    });
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.toString().trim())) {
    return res.status(422).json({
      status: 'error',
      code: 422,
      message: 'Validation Error: Invalid 10-digit Indian mobile number format.',
      errors: [{ field: 'phone', message: 'Must be a 10-digit number starting with 6, 7, 8, or 9.' }]
    });
  }

  next();
};

// Helper: Check valid Email format
export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({
        status: 'error',
        code: 422,
        message: 'Validation Error: Invalid email address format.',
        errors: [{ field: 'email', message: 'Invalid email address.' }]
      });
    }
  }
  next();
};

// Helper: Ensure mandatory request body fields exist
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    fields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(422).json({
        status: 'error',
        code: 422,
        message: `Validation Error: Missing mandatory fields: ${missingFields.join(', ')}`,
        errors: missingFields.map(field => ({ field, message: 'This field is required.' }))
      });
    }
    next();
  };
};

// Helper: Parse & normalize pagination query parameters
export const parsePagination = (req, res, next) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };

  next();
};
