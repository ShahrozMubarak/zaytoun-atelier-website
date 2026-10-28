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
const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;

const orderSchema = Joi.object({
  orderNumber: Joi.string().trim().max(60).optional(),
  customer: Joi.object({
    firstName: Joi.string().trim().min(1).max(70).required(),
    lastName: Joi.string().trim().max(70).allow('', null),
    name: Joi.string().trim().max(140).allow('', null),
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
    phone: Joi.string().trim().pattern(phoneRegex).required().messages({
      'string.pattern.base': 'Please enter a valid 11-digit Pakistani mobile number (e.g., 03001234567 or +923001234567).'
    }),
    address: Joi.string().trim().min(8).max(300).required().messages({
      'string.min': 'Complete delivery address must be at least 8 characters long (house, street, sector).'
    }),
    city: Joi.string().trim().min(2).max(100).required(),
    province: Joi.string().trim().allow('', null),
    postalCode: Joi.string().trim().allow('', null),
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
