import Joi from 'joi';

const initiatePaymentSchema = Joi.object({
    orderId: Joi.string().required(),
    amount: Joi.number()
        .positive()
        .required()
        .custom((value, helpers) => {
           
            const decimalPlaces = (value.toString().split('.')[1] || '').length;
            if (decimalPlaces > 2) {
                return helpers.error('amount.precision');
            }
            return value;
        })
        .messages({
            'amount.precision': 'Amount must have at most 2 decimal places',
            'number.positive': 'Amount must be a positive number'
        }),
    email: Joi.string().email().required()
});

export { initiatePaymentSchema };