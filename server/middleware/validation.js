import Joi from 'joi';

/**
 * 1. Newsletter Subscriber Schema Validation
 */
const subscriberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required to subscribe.'
  }),
  source: Joi.string().max(60).default('website_footer')
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
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters.',
    'any.required': 'Name is required.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required.'
  }),
  orderNumber: Joi.string().max(50).allow('', null).optional(),
  message: Joi.string().min(5).max(3000).required().messages({
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
const orderSchema = Joi.object({
  orderNumber: Joi.string().max(60).optional(),
  customer: Joi.object({
    firstName: Joi.string().min(1).max(70).required(),
    lastName: Joi.string().max(70).allow('', null),
    name: Joi.string().max(140).allow('', null),
    email: Joi.string().email().required(),
    phone: Joi.string().min(8).max(20).required(),
    address: Joi.string().min(5).max(300).required(),
    city: Joi.string().min(2).max(100).required(),
    province: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    orderNotes: Joi.string().max(1000).allow('', null)
  }).unknown(true).required(),
  items: Joi.array().min(1).required(),
  total: Joi.number().min(0).required(),
  pricing: Joi.object().optional(),
  paymentMethod: Joi.string().valid('cod', 'card', 'jazzcash', 'easypaisa').default('cod')
}).unknown(true);

export const validateOrder = (req, res, next) => {
  const { error, value } = orderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
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
