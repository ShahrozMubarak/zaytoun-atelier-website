import Joi from 'joi';

/**
 * 1. Newsletter Subscriber Schema Validation
 */
const subscriberSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required to subscribe.'
  }),
  source: Joi.string().trim().max(60).default('website_footer')
});

export const validateSubscriber = (req, res, next) => {
  const { error, value } = subscriberSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
  }
  req.body = value;
  next();
};

/**
 * 2. Concierge Inquiry Schema Validation
 */
const inquirySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters.',
    'any.required': 'Name is required.'
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Valid email is required.'
  }),
  orderNumber: Joi.string().trim().max(50).allow('', null).optional(),
  message: Joi.string().trim().min(5).max(3000).required().messages({
    'string.min': 'Message must be at least 5 characters.',
    'any.required': 'Message is required.'
  })
});

export const validateInquiry = (req, res, next) => {
  const { error, value } = inquirySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
  }
  req.body = value;
  next();
};

/**
 * 3. Order Checkout Schema Validation
 */
const nameRegex = /^[a-zA-Z\s]{1,70}$/;
const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
const cityRegex = /^[a-zA-Z\s]{2,50}$/;

const orderSchema = Joi.object({
  orderNumber: Joi.string().trim().max(60).optional(),
  customer: Joi.object({
    firstName: Joi.string().trim().pattern(nameRegex).min(1).max(70).required().messages({
      'string.pattern.base': 'First name can only contain letters and spaces. No numbers, symbols, or special characters allowed.'
    }),
    lastName: Joi.string().trim().pattern(nameRegex).max(70).allow('', null).messages({
      'string.pattern.base': 'Last name can only contain letters and spaces. No numbers, symbols, or special characters allowed.'
    }),
    name: Joi.string().trim().max(140).allow('', null),
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
    phone: Joi.string().trim().pattern(phoneRegex).required().messages({
      'string.pattern.base': 'Phone number must contain only digits (strictly 11 digits, e.g., 03001234567) without letters, symbols, or spaces.'
    }),
    address: Joi.string().trim().min(8).max(300).required().messages({
      'string.min': 'Complete delivery address must be at least 8 characters long (house, street, sector).'
    }),
    city: Joi.string().trim().pattern(cityRegex).min(2).max(100).required().messages({
      'string.pattern.base': 'City name can only contain letters and spaces. No numbers or special characters.'
    }),
    province: Joi.string().trim().allow('', null),
    postalCode: Joi.string().trim().pattern(/^[0-9]{0,8}$/).allow('', null).messages({
      'string.pattern.base': 'Postal code can only contain digits. No letters or symbols.'
    }),
    orderNotes: Joi.string().trim().max(1000).allow('', null)
  }).unknown(true).required(),
  items: Joi.array().min(1).required(),
  total: Joi.number().min(0).required(),
  pricing: Joi.object().optional(),
  paymentMethod: Joi.string().valid('cod', 'card', 'jazzcash', 'easypaisa', 'bank').default('cod'),
  paymentReceipt: Joi.string().allow('', null).optional(),
  receiptFileName: Joi.string().allow('', null).optional()
}).unknown(true);

export const validateOrder = (req, res, next) => {
  const { error, value } = orderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
  }

  // Strict check: If payment method is JazzCash, EasyPaisa, or Bank, proof receipt is mandatory
  if (['jazzcash', 'easypaisa', 'bank'].includes(value.paymentMethod)) {
    if (!value.paymentReceipt || value.paymentReceipt.trim() === '') {
      return res.status(400).json({
        error: `Payment proof attachment is required for ${value.paymentMethod.toUpperCase()} transactions. Please upload your payment screenshot/receipt.`
      });
    }
  }

  req.body = value;
  next();
};

/**
 * 4. Product Catalog Item Validation
 */
const productSchema = Joi.object({
  id: Joi.string().max(100).optional(),
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).max(2000000).required(),
  category: Joi.string().max(50).default('Apparel'),
  person: Joi.string().valid('women', 'men', 'kids').default('women'),
  slot: Joi.string().valid('top', 'bottom', 'outer', 'dress').default('top')
}).unknown(true);

export const validateProduct = (req, res, next) => {
  const { error, value } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
  }
  req.body = value;
  next();
};
