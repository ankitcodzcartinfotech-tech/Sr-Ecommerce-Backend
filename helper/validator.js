const Joi = require('joi');

// Helper pattern to validate MongoDB ObjectId hex strings
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

/**
 * Higher-order middleware to validate the request body against a Joi schema.
 * Automatically handles validation errors and sends a formatted 400 Bad Request response.
 */
const validateBodyData = (schema, body) => {
    const { error, value } = schema.validate(body, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
    });

    if (error) {
        const errors = error.details.map((detail) => detail.message.replace(/["']/g, ''));
        return { error: { message: 'Validation failed', errors } };
    }

    return { value };
};

const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = validateBodyData(schema, req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                ...error
            });
        }

        // Replace request body with validated/stripped values
        req.body = value;
        next();
    };
};

// ==========================================
// ROLE VALIDATION SCHEMAS
// ==========================================
const addRoleSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'Role name is required',
        'string.min': 'Role name must be at least 2 characters long',
        'string.max': 'Role name must be at most 50 characters long',
        'any.required': 'Role name is required'
    })
});

const updateRoleSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional().messages({
        'string.empty': 'Role name cannot be empty',
        'string.min': 'Role name must be at least 2 characters long',
        'string.max': 'Role name must be at most 50 characters long'
    })
}).min(1); // Ensure at least one field is provided for update

// ==========================================
// USER VALIDATION SCHEMAS
// ==========================================
const addUserSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
    }),
    email: Joi.string().trim().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    }),
    profileImage: Joi.string().trim().optional().allow('', null),
    role: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Role ID is required',
        'string.pattern.base': 'Role ID must be a valid MongoDB ObjectId',
        'any.required': 'Role ID is required'
    })
});

const updateUserSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional().messages({
        'string.empty': 'Name cannot be empty'
    }),
    email: Joi.string().trim().email().optional().messages({
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(6).optional().messages({
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 6 characters long'
    }),
    profileImage: Joi.string().trim().optional().messages({
        'string.empty': 'Profile image path or URL cannot be empty'
    }),
    role: Joi.string().pattern(objectIdPattern).optional().messages({
        'string.empty': 'Role ID cannot be empty',
        'string.pattern.base': 'Role ID must be a valid MongoDB ObjectId'
    })
}).min(1);

// ==========================================
// EMPLOYEE VALIDATION SCHEMAS
// ==========================================
const addEmployeeSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
    }),
    mobileNumber1: Joi.number().integer().min(1000000000).max(9999999999).required().messages({
        'number.base': 'Mobile Number 1 must be a number',
        'number.min': 'Mobile Number 1 must be a valid 10-digit number',
        'number.max': 'Mobile Number 1 must be a valid 10-digit number',
        'any.required': 'Mobile Number 1 is required'
    }),
    mobileNumber2: Joi.number().integer().min(1000000000).max(9999999999).optional().messages({
        'number.base': 'Mobile Number 2 must be a number',
        'number.min': 'Mobile Number 2 must be a valid 10-digit number',
        'number.max': 'Mobile Number 2 must be a valid 10-digit number'
    }),
    mobileNumber3: Joi.number().integer().min(1000000000).max(9999999999).optional().messages({
        'number.base': 'Mobile Number 3 must be a number',
        'number.min': 'Mobile Number 3 must be a valid 10-digit number',
        'number.max': 'Mobile Number 3 must be a valid 10-digit number'
    }),
    address: Joi.string().trim().required().messages({
        'string.empty': 'Address is required',
        'any.required': 'Address is required'
    }),
    aadharCardNumber: Joi.string().trim().pattern(/^\d{12}$/).required().messages({
        'string.empty': 'Aadhar Card Number is required',
        'string.pattern.base': 'Aadhar Card Number must be a valid 12-digit number',
        'any.required': 'Aadhar Card Number is required'
    }),
    panCardNumber: Joi.string().trim().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required().messages({
        'string.empty': 'PAN Card Number is required',
        'string.pattern.base': 'PAN Card Number must be a valid Indian PAN format (e.g. ABCDE1234F)',
        'any.required': 'PAN Card Number is required'
    }),
    salary: Joi.number().min(0).required().messages({
        'number.base': 'Salary must be a number',
        'number.min': 'Salary must be a positive number',
        'any.required': 'Salary is required'
    }),
    photo: Joi.string().trim().optional().allow(null, '')
});

const updateEmployeeSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional().messages({
        'string.empty': 'Name cannot be empty'
    }),
    mobileNumber1: Joi.number().integer().min(1000000000).max(9999999999).optional().messages({
        'number.base': 'Mobile Number 1 must be a number',
        'number.min': 'Mobile Number 1 must be a valid 10-digit number',
        'number.max': 'Mobile Number 1 must be a valid 10-digit number'
    }),
    mobileNumber2: Joi.number().integer().min(1000000000).max(9999999999).optional().messages({
        'number.base': 'Mobile Number 2 must be a number',
        'number.min': 'Mobile Number 2 must be a valid 10-digit number',
        'number.max': 'Mobile Number 2 must be a valid 10-digit number'
    }),
    mobileNumber3: Joi.number().integer().min(1000000000).max(9999999999).optional().messages({
        'number.base': 'Mobile Number 3 must be a number',
        'number.min': 'Mobile Number 3 must be a valid 10-digit number',
        'number.max': 'Mobile Number 3 must be a valid 10-digit number'
    }),
    address: Joi.string().trim().optional().messages({
        'string.empty': 'Address cannot be empty'
    }),
    aadharCardNumber: Joi.string().trim().pattern(/^\d{12}$/).optional().messages({
        'string.empty': 'Aadhar Card Number cannot be empty',
        'string.pattern.base': 'Aadhar Card Number must be a valid 12-digit number'
    }),
    panCardNumber: Joi.string().trim().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().messages({
        'string.empty': 'PAN Card Number cannot be empty',
        'string.pattern.base': 'PAN Card Number must be a valid Indian PAN format (e.g. ABCDE1234F)'
    }),
    salary: Joi.number().min(0).optional().messages({
        'number.base': 'Salary must be a number',
        'number.min': 'Salary must be a positive number'
    }),
    photo: Joi.string().trim().optional().allow(null, '')
}).min(1);

// ==========================================
// AGENT VALIDATION SCHEMAS
// ==========================================
const addAgentSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
    }),
    panNumber: Joi.string().trim().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required().messages({
        'string.empty': 'PAN Number is required',
        'string.pattern.base': 'PAN Number must be a valid Indian PAN format (e.g. ABCDE1234F)',
        'any.required': 'PAN Number is required'
    }),
    mobileNumber: Joi.number().integer().min(1000000000).max(9999999999).required().messages({
        'number.base': 'Mobile Number must be a number',
        'number.min': 'Mobile Number must be a valid 10-digit number',
        'number.max': 'Mobile Number must be a valid 10-digit number',
        'any.required': 'Mobile Number is required'
    }),
    commission: Joi.number().min(0).max(100).required().messages({
        'number.base': 'Commission must be a number',
        'number.min': 'Commission must be at least 0',
        'number.max': 'Commission cannot exceed 100',
        'any.required': 'Commission is required'
    }),
    creditPeriod: Joi.number().integer().min(0).required().messages({
        'number.base': 'Credit Period must be a number',
        'number.min': 'Credit Period cannot be negative',
        'any.required': 'Credit Period is required'
    }),
    creditLimit: Joi.number().min(0).required().messages({
        'number.base': 'Credit Limit must be a number',
        'number.min': 'Credit Limit cannot be negative',
        'any.required': 'Credit Limit is required'
    }),
    address: Joi.string().trim().required().messages({
        'string.empty': 'Address is required',
        'any.required': 'Address is required'
    }),
    profileImage: Joi.string().trim().optional().allow(null, '')
});

const updateAgentSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional().messages({
        'string.empty': 'Name cannot be empty'
    }),
    panNumber: Joi.string().trim().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional().messages({
        'string.empty': 'PAN Number cannot be empty',
        'string.pattern.base': 'PAN Number must be a valid Indian PAN format (e.g. ABCDE1234F)'
    }),
    mobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().messages({
        'number.base': 'Mobile Number must be a number',
        'number.min': 'Mobile Number must be a valid 10-digit number',
        'number.max': 'Mobile Number must be a valid 10-digit number'
    }),
    commission: Joi.number().min(0).max(100).optional().messages({
        'number.base': 'Commission must be a number',
        'number.min': 'Commission must be at least 0',
        'number.max': 'Commission cannot exceed 100'
    }),
    creditPeriod: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Credit Period must be a number',
        'number.min': 'Credit Period cannot be negative'
    }),
    creditLimit: Joi.number().min(0).optional().messages({
        'number.base': 'Credit Limit must be a number',
        'number.min': 'Credit Limit cannot be negative'
    }),
    address: Joi.string().trim().optional().messages({
        'string.empty': 'Address cannot be empty'
    }),
    profileImage: Joi.string().trim().optional().allow(null, '')
}).min(1);

// ==========================================
// LEDGER HEAD VALIDATION SCHEMAS
// ==========================================
const addLedgerHeadSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
    }),
    accountHeadName: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Account Head Name is required',
        'any.required': 'Account Head Name is required'
    }),
    accountType: Joi.string().valid('Expence', 'Liability', 'Income', 'Asset').required().messages({
        'string.empty': 'Account Type is required',
        'any.only': 'Account Type must be one of: Expence, Liability, Income, Asset',
        'any.required': 'Account Type is required'
    })
});

const updateLedgerHeadSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional().messages({
        'string.empty': 'Name cannot be empty'
    }),
    accountHeadName: Joi.string().trim().min(2).max(100).optional().messages({
        'string.empty': 'Account Head Name cannot be empty'
    }),
    accountType: Joi.string().valid('Expence', 'Liability', 'Income', 'Asset').optional().messages({
        'string.empty': 'Account Type cannot be empty',
        'any.only': 'Account Type must be one of: Expence, Liability, Income, Asset'
    })
}).min(1);

// ==========================================
// PARTIES VALIDATION SCHEMAS
// ==========================================
const addPartiesSchema = Joi.object({
    generalDetails: Joi.object({
        profileImage: Joi.string().trim().optional().allow('', null),
        partyType: Joi.number().valid(1, 2, 3).required().messages({
            'number.base': 'Party type must be a number',
            'any.only': 'Party type must be either 1 (Customer), 2 (Supplier) or 3 (Job Work)',
            'any.required': 'Party type is required'
        }),
        partyName: Joi.string().trim().required().messages({
            'string.empty': 'Party name is required',
            'any.required': 'Party name is required'
        }),
        legalName: Joi.string().trim().optional().allow('', null),
        ledgerHead: Joi.string().pattern(objectIdPattern).optional().allow('', null).messages({
            'string.pattern.base': 'Ledger Head ID must be a valid MongoDB ObjectId'
        }),
        email: Joi.string().trim().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        agent: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Agent ID is required',
            'string.pattern.base': 'Agent ID must be a valid MongoDB ObjectId',
            'any.required': 'Agent ID is required'
        }),
        mobileNumber: Joi.number().integer().min(1000000000).max(9999999999).required().messages({
            'number.base': 'Mobile Number must be a number',
            'number.min': 'Mobile Number must be a valid 10-digit number',
            'number.max': 'Mobile Number must be a valid 10-digit number',
            'any.required': 'Mobile Number is required'
        })
    }).required(),
    bankDetail: Joi.object({
        gstNo: Joi.string().trim().required().messages({
            'string.empty': 'GST No is required',
            'any.required': 'GST No is required'
        }),
        panNumber: Joi.string().trim().uppercase().required().messages({
            'string.empty': 'PAN Number is required',
            'any.required': 'PAN Number is required'
        }),
        openingBalance: Joi.number().optional().allow(null, ''),
        balanceStatus: Joi.string().valid('1', '2').required().messages({
            'string.empty': 'Balance status is required',
            'any.only': 'Balance status must be either To Collect or To Pay',
            'any.required': 'Balance status is required'
        }),
        creditPeriod: Joi.number().min(0).optional().allow(null, ''),
        creditLimit: Joi.number().min(0).optional().allow(null, ''),
        bankName: Joi.string().trim().optional().allow('', null),
        bankAccountNumber: Joi.string().trim().optional().allow('', null),
        bankBranchName: Joi.string().trim().optional().allow('', null),
        bankIFSC: Joi.string().trim().uppercase().required().messages({
            'string.empty': 'Bank IFSC is required',
            'any.required': 'Bank IFSC is required'
        })
    }).required(),
    billingAddress: Joi.object({
        streetAddress: Joi.string().trim().required().messages({
            'string.empty': 'Billing street address is required',
            'any.required': 'Billing street address is required'
        }),
        state: Joi.string().trim().required().messages({
            'string.empty': 'Billing state is required',
            'any.required': 'Billing state is required'
        }),
        pincode: Joi.string().trim().optional().allow('', null),
        city: Joi.string().trim().required().messages({
            'string.empty': 'Billing city is required',
            'any.required': 'Billing city is required'
        })
    }).required(),
    shippingAddress: Joi.object({
        streetAddress: Joi.string().trim().optional().allow('', null),
        state: Joi.string().trim().optional().allow('', null),
        pincode: Joi.string().trim().optional().allow('', null),
        city: Joi.string().trim().optional().allow('', null)
    }).optional()
});

const updatePartiesSchema = Joi.object({
    generalDetails: Joi.object({
        profileImage: Joi.string().trim().optional().allow('', null),
        partyType: Joi.number().valid(1, 2, 3).optional().messages({
            'number.base': 'Party type must be a number',
            'any.only': 'Party type must be either 1 (Customer), 2 (Supplier) or 3 (Job Work)'
        }),
        partyName: Joi.string().trim().optional().messages({
            'string.empty': 'Party name cannot be empty'
        }),
        legalName: Joi.string().trim().optional().allow('', null),
        ledgerHead: Joi.string().pattern(objectIdPattern).optional().allow('', null).messages({
            'string.pattern.base': 'Ledger Head ID must be a valid MongoDB ObjectId'
        }),
        email: Joi.string().trim().email().optional().messages({
            'string.empty': 'Email cannot be empty',
            'string.email': 'Please provide a valid email address'
        }),
        agent: Joi.string().pattern(objectIdPattern).optional().messages({
            'string.empty': 'Agent ID cannot be empty',
            'string.pattern.base': 'Agent ID must be a valid MongoDB ObjectId'
        }),
        mobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().messages({
            'number.base': 'Mobile Number must be a number',
            'number.min': 'Mobile Number must be a valid 10-digit number',
            'number.max': 'Mobile Number must be a valid 10-digit number'
        })
    }).optional(),
    bankDetail: Joi.object({
        gstNo: Joi.string().trim().optional().messages({
            'string.empty': 'GST No cannot be empty'
        }),
        panNumber: Joi.string().trim().uppercase().optional().messages({
            'string.empty': 'PAN Number cannot be empty'
        }),
        openingBalance: Joi.number().optional().allow(null, ''),
        balanceStatus: Joi.string().valid('1', '2').optional().messages({
            'string.empty': 'Balance status cannot be empty',
            'any.only': 'Balance status must be either To Collect or To Pay'
        }),
        creditPeriod: Joi.number().min(0).optional().allow(null, ''),
        creditLimit: Joi.number().min(0).optional().allow(null, ''),
        bankName: Joi.string().trim().optional().allow('', null),
        bankAccountNumber: Joi.string().trim().optional().allow('', null),
        bankBranchName: Joi.string().trim().optional().allow('', null),
        bankIFSC: Joi.string().trim().uppercase().optional().messages({
            'string.empty': 'Bank IFSC cannot be empty'
        })
    }).optional(),
    billingAddress: Joi.object({
        streetAddress: Joi.string().trim().optional().messages({
            'string.empty': 'Billing street address cannot be empty'
        }),
        state: Joi.string().trim().optional().messages({
            'string.empty': 'Billing state cannot be empty'
        }),
        pincode: Joi.string().trim().optional().allow('', null),
        city: Joi.string().trim().optional().messages({
            'string.empty': 'Billing city cannot be empty'
        })
    }).optional(),
    shippingAddress: Joi.object({
        streetAddress: Joi.string().trim().optional().allow('', null),
        state: Joi.string().trim().optional().allow('', null),
        pincode: Joi.string().trim().optional().allow('', null),
        city: Joi.string().trim().optional().allow('', null)
    }).optional()
}).min(1);

// ==========================================
// CATEGORY VALIDATION SCHEMAS
// ==========================================
const addCategorySchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Category name is required',
        'any.required': 'Category name is required'
    }),
    hsnCode: Joi.string().trim().required().messages({
        'string.empty': 'HSN Code is required',
        'any.required': 'HSN Code is required'
    }),
    categoryLogo: Joi.string().trim().optional().allow(null, '')
});

const updateCategorySchema = Joi.object({
    name: Joi.string().trim().optional().messages({
        'string.empty': 'Category name cannot be empty'
    }),
    hsnCode: Joi.string().trim().optional().messages({
        'string.empty': 'HSN Code cannot be empty'
    }),
    categoryLogo: Joi.string().trim().optional().allow(null, '')
}).min(1);

// ==========================================
// PRODUCT VALIDATION SCHEMAS
// ==========================================
const addProductSchema = Joi.object({
    productDetail: Joi.object({
        name: Joi.string().trim().required().messages({
            'string.empty': 'Product name is required',
            'any.required': 'Product name is required'
        }),
        category: Joi.string().pattern(objectIdPattern).optional().allow('', null).messages({
            'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId'
        }),
        hsnCode: Joi.string().trim().required().messages({
            'string.empty': 'HSN Code is required',
            'any.required': 'HSN Code is required'
        }),
        itemCode: Joi.string().trim().required().messages({
            'string.empty': 'Item Code is required',
            'any.required': 'Item Code is required'
        }),
        cut: Joi.number().optional().allow('', null),
        description: Joi.string().trim().optional().allow('', null),
        images: Joi.array().items(Joi.string().allow('', null)).max(10).optional(),
        checkNegativeStock: Joi.number().valid(1, 2).optional().default(1)
    }).required(),
    saleDetails: Joi.object({
        salePrice: Joi.number().min(0).optional().default(0),
        discount: Joi.number().min(0).optional().default(0),
        measuringUnit: Joi.string().valid('piece', 'meter').optional().allow('', null)
    }).optional(),
    purchaseDetails: Joi.object({
        wholeshaleAllow: Joi.boolean().optional().default(false),
        wholeshalePrice: Joi.number().min(0).optional().allow('', null),
        wholeshalePricePercentage: Joi.number().min(0).optional().allow('', null),

        purchasePrice: Joi.number().min(0).optional().allow('', null),
        gstTax: Joi.number().min(0).optional().allow('', null),
        purchaseDesignNo: Joi.string().trim().required().messages({
            'string.empty': 'Purchase Design No is required',
            'any.required': 'Purchase Design No is required'
        }),
        purchaseParty: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Purchase Party is required',
            'string.pattern.base': 'Purchase Party must be a valid MongoDB ObjectId',
            'any.required': 'Purchase Party is required'
        })
    }).required(),
    stockDetails: Joi.object({
        openingQuantity: Joi.number().min(0).optional().default(0),
        atPrice: Joi.number().min(0).optional().default(0),
        atOfDate: Joi.number().optional().default(0),
        minStockToMaintain: Joi.number().min(0).optional().default(0),
        location: Joi.string().trim().optional().allow('', null).default("")
    }).optional(),
    variants: Joi.array().items(
        Joi.object({
            sku: Joi.string().trim().required().messages({
                'string.empty': 'Variant SKU is required',
                'any.required': 'Variant SKU is required'
            }),
            color: Joi.string().trim().optional().allow('', null),
            fabric: Joi.string().trim().optional().allow('', null),
            design: Joi.string().trim().optional().allow('', null),
            images: Joi.array().items(Joi.string()).optional(),
            salePrice: Joi.number().min(0).required().messages({
                'number.base': 'Variant sale price must be a number',
                'number.min': 'Variant sale price must be positive',
                'any.required': 'Variant sale price is required'
            }),
            purchasePrice: Joi.number().min(0).required().messages({
                'number.base': 'Variant purchase price must be a number',
                'number.min': 'Variant purchase price must be positive',
                'any.required': 'Variant purchase price is required'
            }),
            stock: Joi.number().integer().min(0).optional().default(0),
            isActive: Joi.boolean().optional().default(true)
        })
    ).optional()
});

const updateProductSchema = Joi.object({
    productDetail: Joi.object({
        name: Joi.string().trim().optional().messages({
            'string.empty': 'Product name cannot be empty'
        }),
        category: Joi.string().pattern(objectIdPattern).optional().allow('', null).messages({
            'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId'
        }),
        hsnCode: Joi.string().trim().optional().messages({
            'string.empty': 'HSN Code cannot be empty'
        }),
        itemCode: Joi.string().trim().optional().messages({
            'string.empty': 'Item Code cannot be empty'
        }),
        cut: Joi.number().optional().allow('', null),
        description: Joi.string().trim().optional().allow('', null),
        images: Joi.array().items(Joi.string().allow('', null)).max(10).optional(),
        checkNegativeStock: Joi.number().valid(1, 2).optional()
    }).optional(),
    saleDetails: Joi.object({
        salePrice: Joi.number().min(0).optional(),
        discount: Joi.number().min(0).optional(),
        measuringUnit: Joi.string().valid('piece', 'meter').optional().allow('', null)
    }).optional(),
    purchaseDetails: Joi.object({
        wholeshaleAllow: Joi.boolean().optional(),
        wholeshalePrice: Joi.number().min(0).optional().allow('', null),
        wholeshalePricePercentage: Joi.number().min(0).optional().allow('', null),

        purchasePrice: Joi.number().min(0).optional().allow('', null),
        gstTax: Joi.number().min(0).optional().allow('', null),
        purchaseDesignNo: Joi.string().trim().optional().messages({
            'string.empty': 'Purchase Design No cannot be empty'
        }),
        purchaseParty: Joi.string().pattern(objectIdPattern).optional().messages({
            'string.pattern.base': 'Purchase Party must be a valid MongoDB ObjectId'
        })
    }).optional(),
    stockDetails: Joi.object({
        openingQuantity: Joi.number().min(0).optional(),
        atPrice: Joi.number().min(0).optional(),
        atOfDate: Joi.number().optional(),
        minStockToMaintain: Joi.number().min(0).optional(),
        location: Joi.string().trim().optional().allow('', null)
    }).optional(),
    variants: Joi.array().items(
        Joi.object({
            sku: Joi.string().trim().required().messages({
                'string.empty': 'Variant SKU is required',
                'any.required': 'Variant SKU is required'
            }),
            color: Joi.string().trim().optional().allow('', null),
            fabric: Joi.string().trim().optional().allow('', null),
            design: Joi.string().trim().optional().allow('', null),
            images: Joi.array().items(Joi.string()).optional(),
            salePrice: Joi.number().min(0).required().messages({
                'number.base': 'Variant sale price must be a number',
                'number.min': 'Variant sale price must be positive',
                'any.required': 'Variant sale price is required'
            }),
            purchasePrice: Joi.number().min(0).required().messages({
                'number.base': 'Variant purchase price must be a number',
                'number.min': 'Variant purchase price must be positive',
                'any.required': 'Variant purchase price is required'
            }),
            stock: Joi.number().integer().min(0).optional().default(0),
            isActive: Joi.boolean().optional().default(true)
        })
    ).optional()
}).min(1);

module.exports = {
    validateBody,
    validateBodyData,
    addRoleSchema,
    updateRoleSchema,
    addUserSchema,
    updateUserSchema,
    addEmployeeSchema,
    updateEmployeeSchema,
    addAgentSchema,
    updateAgentSchema,
    addLedgerHeadSchema,
    updateLedgerHeadSchema,
    addPartiesSchema,
    updatePartiesSchema,
    addCategorySchema,
    updateCategorySchema,
    addProductSchema,
    updateProductSchema
};

// ==========================================
// STATES VALIDATION SCHEMAS
// ==========================================
const addStateSchema = Joi.object({
    stateName: Joi.string().trim().required().messages({
        'string.empty': 'State name is required',
        'any.required': 'State name is required'
    }),
    stateCode: Joi.string().trim().required().messages({
        'string.empty': 'State Code is required',
        'any.required': 'State Code is required'
    }),
    alphaCode: Joi.string().trim().required().messages({
        'string.empty': 'Alpha Code is required',
        'any.required': 'Alpha Code is required'
    })
});

const updateStateSchema = Joi.object({
    stateName: Joi.string().trim().optional(),
    stateCode: Joi.string().trim().optional(),
    alphaCode: Joi.string().trim().optional()
}).min(1);

// ==========================================
// TRANSPORTS VALIDATION SCHEMAS
// ==========================================
const addTransportSchema = Joi.object({
    transportName: Joi.string().trim().required().messages({
        'string.empty': 'Transport name is required',
        'any.required': 'Transport name is required'
    }),
    mobileNumber: Joi.number().integer().min(1000000000).max(9999999999).required().messages({
        'number.base': 'Mobile Number must be a number',
        'number.min': 'Mobile Number must be a valid 10-digit number',
        'number.max': 'Mobile Number must be a valid 10-digit number',
        'any.required': 'Mobile Number is required'
    }),
    mobileNumber2: Joi.number().integer().min(1000000000).max(9999999999).optional().allow('', null).messages({
        'number.base': 'Second Mobile Number must be a number',
        'number.min': 'Second Mobile Number must be a valid 10-digit number',
        'number.max': 'Second Mobile Number must be a valid 10-digit number'
    }),
    gst: Joi.string().trim().required().messages({
        'string.empty': 'GST is required',
        'any.required': 'GST is required'
    }),
    address: Joi.string().trim().required().messages({
        'string.empty': 'Address is required',
        'any.required': 'Address is required'
    }),
    transportCity: Joi.string().trim().required().messages({
        'string.empty': 'Transport City is required',
        'any.required': 'Transport City is required'
    })
});

const updateTransportSchema = Joi.object({
    transportName: Joi.string().trim().optional(),
    mobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional(),
    mobileNumber2: Joi.number().integer().min(1000000000).max(9999999999).optional().allow('', null),
    gst: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
    transportCity: Joi.string().trim().optional()
}).min(1);

// ==========================================
// ORDERS VALIDATION SCHEMAS
// ==========================================
const addOrderSchema = Joi.object({
    orderType: Joi.string().valid('Sales', 'Purchase', 'Job Work').required().messages({
        'string.empty': 'Order Type is required',
        'any.only': 'Order Type must be Sales, Purchase or Job Work',
        'any.required': 'Order Type is required'
    }),
    spoNo: Joi.number().integer().optional(),
    spoDate: Joi.date().optional(),
    party: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Party is required',
        'string.pattern.base': 'Party ID must be a valid MongoDB ObjectId',
        'any.required': 'Party is required'
    }),
    validDate: Joi.date().required().messages({
        'any.required': 'Valid Date is required'
    }),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    agent: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Product is required',
            'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId'
        }),
        description: Joi.string().trim().required().messages({
            'string.empty': 'Product description is required'
        }),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).required().messages({
            'number.base': 'Pcs must be a number',
            'number.min': 'Pcs must be at least 1'
        }),
        rate: Joi.number().min(0).required().messages({
            'number.base': 'Rate must be a number',
            'number.min': 'Rate must be positive'
        }),
        total: Joi.number().min(0).required(),
        discPercent: Joi.number().min(0).max(100).optional().default(0),
        discAmount: Joi.number().min(0).optional().default(0),
        taxableAmount: Joi.number().min(0).required(),
        cgstPercent: Joi.number().min(0).max(100).optional().default(0),
        cgstAmount: Joi.number().min(0).optional().default(0),
        sgstPercent: Joi.number().min(0).max(100).optional().default(0),
        sgstAmount: Joi.number().min(0).optional().default(0),
        igstPercent: Joi.number().min(0).max(100).optional().default(0),
        igstAmount: Joi.number().min(0).optional().default(0),
        netAmount: Joi.number().min(0).required()
    })).min(1).required().messages({
        'array.min': 'At least one item is required in the order'
    }),
    taxableAmountTotal: Joi.number().min(0).required(),
    cgstTotal: Joi.number().min(0).required(),
    sgstTotal: Joi.number().min(0).required(),
    igstTotal: Joi.number().min(0).required(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional().default(0),
    extraDiscountAmount: Joi.number().min(0).optional().default(0),
    shippingCost: Joi.number().min(0).optional().default(0),
    invoiceTotal: Joi.number().min(0).required(),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
});

const updateOrderSchema = Joi.object({
    orderType: Joi.string().valid('Sales', 'Purchase', 'Job Work').optional(),
    spoNo: Joi.number().integer().optional(),
    spoDate: Joi.date().optional(),
    party: Joi.string().pattern(objectIdPattern).optional(),
    validDate: Joi.date().optional(),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    agent: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).optional(),
        description: Joi.string().trim().optional(),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).optional(),
        rate: Joi.number().min(0).optional(),
        total: Joi.number().min(0).optional(),
        discPercent: Joi.number().min(0).max(100).optional(),
        discAmount: Joi.number().min(0).optional(),
        taxableAmount: Joi.number().min(0).optional(),
        cgstPercent: Joi.number().min(0).max(100).optional(),
        cgstAmount: Joi.number().min(0).optional(),
        sgstPercent: Joi.number().min(0).max(100).optional(),
        sgstAmount: Joi.number().min(0).optional(),
        igstPercent: Joi.number().min(0).max(100).optional(),
        igstAmount: Joi.number().min(0).optional(),
        netAmount: Joi.number().min(0).optional()
    })).min(1).optional(),
    taxableAmountTotal: Joi.number().min(0).optional(),
    cgstTotal: Joi.number().min(0).optional(),
    sgstTotal: Joi.number().min(0).optional(),
    igstTotal: Joi.number().min(0).optional(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional(),
    extraDiscountAmount: Joi.number().min(0).optional(),
    shippingCost: Joi.number().min(0).optional(),
    invoiceTotal: Joi.number().min(0).optional(),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
}).min(1);


// ==========================================
// TAXES VALIDATION SCHEMAS
// ==========================================
const addTaxSchema = Joi.object({
    taxName: Joi.string().trim().required().messages({
        'string.empty': 'Tax Name is required',
        'any.required': 'Tax Name is required'
    }),
    taxValue: Joi.string().trim().required().messages({
        'string.empty': 'Tax Value is required',
        'any.required': 'Tax Value is required'
    })
});

const updateTaxSchema = Joi.object({
    taxName: Joi.string().trim().optional(),
    taxValue: Joi.string().trim().optional()
}).min(1);

// ==========================================
// TDS RATE VALIDATION SCHEMAS
// ==========================================
const addTdsRateSchema = Joi.object({
    taxName: Joi.string().trim().required().messages({
        'string.empty': 'Tax Name is required',
        'any.required': 'Tax Name is required'
    }),
    sectionName: Joi.string().trim().required().messages({
        'string.empty': 'Section Name is required',
        'any.required': 'Section Name is required'
    }),
    rate: Joi.number().required().messages({
        'number.base': 'Rate must be a number',
        'any.required': 'Rate is required'
    })
});

const updateTdsRateSchema = Joi.object({
    taxName: Joi.string().trim().optional(),
    sectionName: Joi.string().trim().optional(),
    rate: Joi.number().optional()
}).min(1);

// ==========================================
// EXPENSE VALIDATION SCHEMAS
// ==========================================
const addExpenseSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Expense Category Name is required',
        'any.required': 'Expense Category Name is required'
    })
});

const updateExpenseSchema = Joi.object({
    name: Joi.string().trim().optional()
}).min(1);

// ==========================================
// TERM VALIDATION SCHEMAS
// ==========================================
const addTermSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Term is required',
        'any.required': 'Term is required'
    })
});

const updateTermSchema = Joi.object({
    name: Joi.string().trim().optional()
}).min(1);

// ==========================================
// ACTUAL EXPENSE VALIDATION SCHEMAS
// ==========================================
const addActualExpenseSchema = Joi.object({
    categoryType: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Expense category is required',
        'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId',
        'any.required': 'Expense category is required'
    }),
    expenseName: Joi.string().trim().required().messages({
        'string.empty': 'Expense name is required',
        'any.required': 'Expense name is required'
    }),
    expenseAmount: Joi.number().min(0).required().messages({
        'number.base': 'Expense amount must be a number',
        'number.min': 'Expense amount cannot be negative',
        'any.required': 'Expense amount is required'
    }),
    date: Joi.string().trim().optional().allow('', null),
    image: Joi.string().trim().optional().allow('', null),
    remarks: Joi.string().trim().optional().allow('', null)
});

const updateActualExpenseSchema = Joi.object({
    categoryType: Joi.string().pattern(objectIdPattern).optional().allow('', null).messages({
        'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId'
    }),
    expenseName: Joi.string().trim().optional(),
    expenseAmount: Joi.number().min(0).optional(),
    date: Joi.string().trim().optional().allow('', null),
    image: Joi.string().trim().optional().allow('', null),
    remarks: Joi.string().trim().optional().allow('', null)
}).min(1);

// ==========================================
// BANK VALIDATION SCHEMAS
// ==========================================
const addBankSchema = Joi.object({
    bankName: Joi.string().trim().required().messages({
        'string.empty': 'Bank name is required',
        'any.required': 'Bank name is required'
    }),
    accountName: Joi.string().trim().required().messages({
        'string.empty': 'Account name is required',
        'any.required': 'Account name is required'
    }),
    openingBalance: Joi.number().optional().allow(null, ''),
    asOfDate: Joi.date().optional().allow(null, ''),
    addBankDetails: Joi.object({
        bankAccountNumber: Joi.string().trim().optional().allow('', null),
        ifscCode: Joi.string().trim().uppercase().optional().allow('', null),
        branchName: Joi.string().trim().optional().allow('', null),
        accountHoldersName: Joi.string().trim().optional().allow('', null),
        upiId: Joi.string().trim().optional().allow('', null)
    }).optional()
});

const updateBankSchema = Joi.object({
    bankName: Joi.string().trim().optional(),
    accountName: Joi.string().trim().optional(),
    openingBalance: Joi.number().optional().allow(null, ''),
    asOfDate: Joi.date().optional().allow(null, ''),
    addBankDetails: Joi.object({
        bankAccountNumber: Joi.string().trim().optional().allow('', null),
        ifscCode: Joi.string().trim().uppercase().optional().allow('', null),
        branchName: Joi.string().trim().optional().allow('', null),
        accountHoldersName: Joi.string().trim().optional().allow('', null),
        upiId: Joi.string().trim().optional().allow('', null)
    }).optional()
}).min(1);

// ==========================================
// CASH & BANK VALIDATION SCHEMAS
// ==========================================
const addCashAndBankSchema = Joi.object({
    moneyIn: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Money-in Bank ID is required',
        'string.pattern.base': 'Money-in Bank ID must be a valid MongoDB ObjectId',
        'any.required': 'Money-in Bank ID is required'
    }),
    date: Joi.string().trim().optional().allow('', null),
    amount: Joi.number().optional().allow(null, ''),
    remarks: Joi.string().trim().optional().allow('', null)
});

const updateCashAndBankSchema = Joi.object({
    moneyIn: Joi.string().pattern(objectIdPattern).optional().allow('', null).messages({
        'string.pattern.base': 'Money-in Bank ID must be a valid MongoDB ObjectId'
    }),
    date: Joi.string().trim().optional().allow('', null),
    amount: Joi.number().optional().allow(null, ''),
    remarks: Joi.string().trim().optional().allow('', null)
}).min(1);

// ==========================================
// SALES VALIDATION SCHEMAS
// ==========================================
const addSalesSchema = Joi.object({
    invoiceNumber: Joi.string().trim().optional().allow('', null),
    salesDate: Joi.date().optional(),
    customer: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Customer is required',
        'string.pattern.base': 'Customer ID must be a valid MongoDB ObjectId',
        'any.required': 'Customer is required'
    }),
    firstMobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().allow(null).messages({
        'number.min': 'First Mobile Number must be a valid 10-digit number',
        'number.max': 'First Mobile Number must be a valid 10-digit number'
    }),
    secondMobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().allow(null).messages({
        'number.min': 'Second Mobile Number must be a valid 10-digit number',
        'number.max': 'Second Mobile Number must be a valid 10-digit number'
    }),
    thirdMobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().allow(null).messages({
        'number.min': 'Third Mobile Number must be a valid 10-digit number',
        'number.max': 'Third Mobile Number must be a valid 10-digit number'
    }),
    dueDate: Joi.date().optional().allow(null),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    agent: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Product is required',
            'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId'
        }),
        description: Joi.string().trim().required().messages({
            'string.empty': 'Product description is required'
        }),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).required().messages({
            'number.base': 'Pcs must be a number',
            'number.min': 'Pcs must be at least 1'
        }),
        rate: Joi.number().min(0).required().messages({
            'number.base': 'Rate must be a number',
            'number.min': 'Rate must be positive'
        }),
        total: Joi.number().min(0).required(),
        discPercent: Joi.number().min(0).max(100).optional().default(0),
        discAmount: Joi.number().min(0).optional().default(0),
        taxableAmount: Joi.number().min(0).required(),
        cgstPercent: Joi.number().min(0).max(100).optional().default(0),
        cgstAmount: Joi.number().min(0).optional().default(0),
        sgstPercent: Joi.number().min(0).max(100).optional().default(0),
        sgstAmount: Joi.number().min(0).optional().default(0),
        igstPercent: Joi.number().min(0).max(100).optional().default(0),
        igstAmount: Joi.number().min(0).optional().default(0),
        netAmount: Joi.number().min(0).required()
    })).min(1).required().messages({
        'array.min': 'At least one item is required in the sale'
    }),
    taxableAmountTotal: Joi.number().min(0).required(),
    cgstTotal: Joi.number().min(0).required(),
    sgstTotal: Joi.number().min(0).required(),
    igstTotal: Joi.number().min(0).required(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional().default(0),
    extraDiscountAmount: Joi.number().min(0).optional().default(0),
    shippingCost: Joi.number().min(0).optional().default(0),
    invoiceTotal: Joi.number().min(0).required(),
    transportBilty: Joi.boolean().optional().default(false),
    lrNo: Joi.string().trim().optional().allow('', null),
    biltyImage: Joi.string().trim().optional().allow('', null),
    biltyDescription: Joi.string().trim().optional().allow('', null),
    amountReceived: Joi.number().min(0).optional().default(0),
    paymentType: Joi.string().valid('Cash', 'Bank').optional().default('Cash'),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional().default(false),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
});

const updateSalesSchema = Joi.object({
    invoiceNumber: Joi.string().trim().optional().allow('', null),
    salesDate: Joi.date().optional(),
    customer: Joi.string().pattern(objectIdPattern).optional(),
    firstMobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().allow(null),
    secondMobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().allow(null),
    thirdMobileNumber: Joi.number().integer().min(1000000000).max(9999999999).optional().allow(null),
    dueDate: Joi.date().optional().allow(null),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    agent: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).optional(),
        description: Joi.string().trim().optional(),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).optional(),
        rate: Joi.number().min(0).optional(),
        total: Joi.number().min(0).optional(),
        discPercent: Joi.number().min(0).max(100).optional(),
        discAmount: Joi.number().min(0).optional(),
        taxableAmount: Joi.number().min(0).optional(),
        cgstPercent: Joi.number().min(0).max(100).optional(),
        cgstAmount: Joi.number().min(0).optional(),
        sgstPercent: Joi.number().min(0).max(100).optional(),
        sgstAmount: Joi.number().min(0).optional(),
        igstPercent: Joi.number().min(0).max(100).optional(),
        igstAmount: Joi.number().min(0).optional(),
        netAmount: Joi.number().min(0).optional()
    })).min(1).optional(),
    taxableAmountTotal: Joi.number().min(0).optional(),
    cgstTotal: Joi.number().min(0).optional(),
    sgstTotal: Joi.number().min(0).optional(),
    igstTotal: Joi.number().min(0).optional(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional(),
    extraDiscountAmount: Joi.number().min(0).optional(),
    shippingCost: Joi.number().min(0).optional(),
    invoiceTotal: Joi.number().min(0).optional(),
    transportBilty: Joi.boolean().optional(),
    lrNo: Joi.string().trim().optional().allow('', null),
    biltyImage: Joi.string().trim().optional().allow('', null),
    biltyDescription: Joi.string().trim().optional().allow('', null),
    amountReceived: Joi.number().min(0).optional(),
    paymentType: Joi.string().valid('Cash', 'Bank').optional(),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional(),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
}).min(1);

const addSalesReturnSchema = Joi.object({
    saleReturnNumber: Joi.string().trim().optional().allow('', null),
    returnDate: Joi.date().optional(),
    customer: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Customer is required',
        'string.pattern.base': 'Customer ID must be a valid MongoDB ObjectId',
        'any.required': 'Customer is required'
    }),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Product is required',
            'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId'
        }),
        description: Joi.string().trim().required().messages({
            'string.empty': 'Product description is required'
        }),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).required().messages({
            'number.base': 'Pcs must be a number',
            'number.min': 'Pcs must be at least 1'
        }),
        rate: Joi.number().min(0).required().messages({
            'number.base': 'Rate must be a number',
            'number.min': 'Rate must be positive'
        }),
        total: Joi.number().min(0).required(),
        discPercent: Joi.number().min(0).max(100).optional().default(0),
        discAmount: Joi.number().min(0).optional().default(0),
        taxableAmount: Joi.number().min(0).required(),
        cgstPercent: Joi.number().min(0).max(100).optional().default(0),
        cgstAmount: Joi.number().min(0).optional().default(0),
        sgstPercent: Joi.number().min(0).max(100).optional().default(0),
        sgstAmount: Joi.number().min(0).optional().default(0),
        igstPercent: Joi.number().min(0).max(100).optional().default(0),
        igstAmount: Joi.number().min(0).optional().default(0),
        netAmount: Joi.number().min(0).required()
    })).min(1).required().messages({
        'array.min': 'At least one item is required in the sales return'
    }),
    taxableAmountTotal: Joi.number().min(0).required(),
    cgstTotal: Joi.number().min(0).required(),
    sgstTotal: Joi.number().min(0).required(),
    igstTotal: Joi.number().min(0).required(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional().default(0),
    extraDiscountAmount: Joi.number().min(0).optional().default(0),
    shippingCost: Joi.number().min(0).optional().default(0),
    invoiceTotal: Joi.number().min(0).required(),
    amountReceived: Joi.number().min(0).optional().default(0),
    paymentType: Joi.string().valid('Cash', 'Bank').optional().default('Cash'),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional().default(false),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
});

const updateSalesReturnSchema = Joi.object({
    saleReturnNumber: Joi.string().trim().optional().allow('', null),
    returnDate: Joi.date().optional(),
    customer: Joi.string().pattern(objectIdPattern).optional(),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).optional(),
        description: Joi.string().trim().optional(),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).optional(),
        rate: Joi.number().min(0).optional(),
        total: Joi.number().min(0).optional(),
        discPercent: Joi.number().min(0).max(100).optional(),
        discAmount: Joi.number().min(0).optional(),
        taxableAmount: Joi.number().min(0).optional(),
        cgstPercent: Joi.number().min(0).max(100).optional(),
        cgstAmount: Joi.number().min(0).optional(),
        sgstPercent: Joi.number().min(0).max(100).optional(),
        sgstAmount: Joi.number().min(0).optional(),
        igstPercent: Joi.number().min(0).max(100).optional(),
        igstAmount: Joi.number().min(0).optional(),
        netAmount: Joi.number().min(0).optional()
    })).min(1).optional(),
    taxableAmountTotal: Joi.number().min(0).optional(),
    cgstTotal: Joi.number().min(0).optional(),
    sgstTotal: Joi.number().min(0).optional(),
    igstTotal: Joi.number().min(0).optional(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional(),
    extraDiscountAmount: Joi.number().min(0).optional(),
    shippingCost: Joi.number().min(0).optional(),
    invoiceTotal: Joi.number().min(0).optional(),
    amountReceived: Joi.number().min(0).optional(),
    paymentType: Joi.string().valid('Cash', 'Bank').optional(),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional(),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
}).min(1);

module.exports = {
    validateBody,
    validateBodyData,
    addRoleSchema,
    updateRoleSchema,
    addUserSchema,
    updateUserSchema,
    addEmployeeSchema,
    updateEmployeeSchema,
    addAgentSchema,
    updateAgentSchema,
    addLedgerHeadSchema,
    updateLedgerHeadSchema,
    addPartiesSchema,
    updatePartiesSchema,
    addCategorySchema,
    updateCategorySchema,
    addProductSchema,
    updateProductSchema,
    addStateSchema,
    updateStateSchema,
    addTransportSchema,
    updateTransportSchema,
    addOrderSchema,
    updateOrderSchema,
    addTaxSchema,
    updateTaxSchema,
    addTdsRateSchema,
    updateTdsRateSchema,
    addExpenseSchema,
    updateExpenseSchema,
    addTermSchema,
    updateTermSchema,
    addActualExpenseSchema,
    updateActualExpenseSchema,
    addBankSchema,
    updateBankSchema,
    addCashAndBankSchema,
    updateCashAndBankSchema,
    addSalesReturnSchema,
    updateSalesReturnSchema
};

const addReceiptSchema = Joi.object({
    receiptNumber: Joi.string().trim().optional().allow('', null),
    customer: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Customer is required',
        'string.pattern.base': 'Customer ID must be a valid MongoDB ObjectId',
        'any.required': 'Customer is required'
    }),
    paymentDate: Joi.date().optional(),
    paymentMode: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Payment Mode / Bank is required',
        'string.pattern.base': 'Bank ID must be a valid MongoDB ObjectId',
        'any.required': 'Payment Mode / Bank is required'
    }),
    notes: Joi.string().trim().optional().allow('', null),
    settledInvoices: Joi.array().items(Joi.object({
        salesInvoice: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Sales Invoice ID is required',
            'string.pattern.base': 'Sales Invoice ID must be a valid MongoDB ObjectId'
        }),
        invoiceNumber: Joi.string().trim().required(),
        invoiceDate: Joi.date().required(),
        invoiceAmount: Joi.number().required(),
        pendingAmount: Joi.number().required(),
        settledAmount: Joi.number().min(0).required()
    })).optional(),
    amount: Joi.number().min(0).required().messages({
        'number.base': 'Total Amount must be a number',
        'any.required': 'Total Amount is required'
    })
});

const updateReceiptSchema = Joi.object({
    receiptNumber: Joi.string().trim().optional().allow('', null),
    customer: Joi.string().pattern(objectIdPattern).optional(),
    paymentDate: Joi.date().optional(),
    paymentMode: Joi.string().pattern(objectIdPattern).optional(),
    notes: Joi.string().trim().optional().allow('', null),
    settledInvoices: Joi.array().items(Joi.object({
        salesInvoice: Joi.string().pattern(objectIdPattern).optional(),
        invoiceNumber: Joi.string().trim().optional(),
        invoiceDate: Joi.date().optional(),
        invoiceAmount: Joi.number().optional(),
        pendingAmount: Joi.number().optional(),
        settledAmount: Joi.number().min(0).optional()
    })).optional(),
    amount: Joi.number().min(0).optional()
}).min(1);

const addPurchaseSchema = Joi.object({
    purchaseInvoiceNumber: Joi.string().trim().optional().allow('', null),
    originalInvoiceNumber: Joi.string().trim().required().messages({
        'string.empty': 'Original Invoice Number is required',
        'any.required': 'Original Invoice Number is required'
    }),
    supplier: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Supplier is required',
        'string.pattern.base': 'Supplier ID must be a valid MongoDB ObjectId',
        'any.required': 'Supplier is required'
    }),
    purchaseDate: Joi.date().required().messages({
        'any.required': 'Purchase Date is required'
    }),
    dueDate: Joi.date().required().messages({
        'any.required': 'Due Date is required'
    }),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Product is required',
            'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId'
        }),
        description: Joi.string().trim().required().messages({
            'string.empty': 'Product description is required'
        }),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).required().messages({
            'number.base': 'Pcs must be a number',
            'number.min': 'Pcs must be at least 1'
        }),
        rate: Joi.number().min(0).required().messages({
            'number.base': 'Rate must be a number',
            'number.min': 'Rate must be positive'
        }),
        total: Joi.number().min(0).required(),
        discPercent: Joi.number().min(0).max(100).optional().default(0),
        discAmount: Joi.number().min(0).optional().default(0),
        taxableAmount: Joi.number().min(0).required(),
        cgstPercent: Joi.number().min(0).max(100).optional().default(0),
        cgstAmount: Joi.number().min(0).optional().default(0),
        sgstPercent: Joi.number().min(0).max(100).optional().default(0),
        sgstAmount: Joi.number().min(0).optional().default(0),
        igstPercent: Joi.number().min(0).max(100).optional().default(0),
        igstAmount: Joi.number().min(0).optional().default(0),
        netAmount: Joi.number().min(0).required()
    })).min(1).required().messages({
        'array.min': 'At least one item is required in the purchase invoice'
    }),
    taxableAmountTotal: Joi.number().min(0).required(),
    cgstTotal: Joi.number().min(0).required(),
    sgstTotal: Joi.number().min(0).required(),
    igstTotal: Joi.number().min(0).required(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional().default(0),
    extraDiscountAmount: Joi.number().min(0).optional().default(0),
    shippingCost: Joi.number().min(0).optional().default(0),
    invoiceTotal: Joi.number().min(0).required(),
    applyTds: Joi.boolean().optional().default(false),
    totalPayableAmount: Joi.number().min(0).required(),
    amountReceived: Joi.number().min(0).optional().default(0),
    paymentType: Joi.string().valid('Cash', 'Bank').optional().default('Cash'),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional().default(false),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
});

const updatePurchaseSchema = Joi.object({
    purchaseInvoiceNumber: Joi.string().trim().optional().allow('', null),
    originalInvoiceNumber: Joi.string().trim().optional(),
    supplier: Joi.string().pattern(objectIdPattern).optional(),
    purchaseDate: Joi.date().optional(),
    dueDate: Joi.date().optional(),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).optional(),
        description: Joi.string().trim().optional(),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).optional(),
        rate: Joi.number().min(0).optional(),
        total: Joi.number().min(0).optional(),
        discPercent: Joi.number().min(0).max(100).optional(),
        discAmount: Joi.number().min(0).optional(),
        taxableAmount: Joi.number().min(0).optional(),
        cgstPercent: Joi.number().min(0).max(100).optional(),
        cgstAmount: Joi.number().min(0).optional(),
        sgstPercent: Joi.number().min(0).max(100).optional(),
        sgstAmount: Joi.number().min(0).optional(),
        igstPercent: Joi.number().min(0).max(100).optional(),
        igstAmount: Joi.number().min(0).optional(),
        netAmount: Joi.number().min(0).optional()
    })).min(1).optional(),
    taxableAmountTotal: Joi.number().min(0).optional(),
    cgstTotal: Joi.number().min(0).optional(),
    sgstTotal: Joi.number().min(0).optional(),
    igstTotal: Joi.number().min(0).optional(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional(),
    extraDiscountAmount: Joi.number().min(0).optional(),
    shippingCost: Joi.number().min(0).optional(),
    invoiceTotal: Joi.number().min(0).optional(),
    applyTds: Joi.boolean().optional(),
    totalPayableAmount: Joi.number().min(0).optional(),
    amountReceived: Joi.number().min(0).optional(),
    paymentType: Joi.string().valid('Cash', 'Bank').optional(),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional(),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
}).min(1);

const addPurchaseReturnSchema = Joi.object({
    purchaseReturnNumber: Joi.string().trim().optional().allow('', null),
    purchaseBillNumber: Joi.string().trim().required().messages({
        'string.empty': 'Purchase Bill Number is required',
        'any.required': 'Purchase Bill Number is required'
    }),
    supplier: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Supplier is required',
        'string.pattern.base': 'Supplier ID must be a valid MongoDB ObjectId',
        'any.required': 'Supplier is required'
    }),
    purchaseReturnDate: Joi.date().required().messages({
        'any.required': 'Purchase Return Date is required'
    }),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Product is required',
            'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId'
        }),
        description: Joi.string().trim().required().messages({
            'string.empty': 'Product description is required'
        }),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).required().messages({
            'number.base': 'Pcs must be a number',
            'number.min': 'Pcs must be at least 1'
        }),
        rate: Joi.number().min(0).required().messages({
            'number.base': 'Rate must be a number',
            'number.min': 'Rate must be positive'
        }),
        total: Joi.number().min(0).required(),
        discPercent: Joi.number().min(0).max(100).optional().default(0),
        discAmount: Joi.number().min(0).optional().default(0),
        taxableAmount: Joi.number().min(0).required(),
        cgstPercent: Joi.number().min(0).max(100).optional().default(0),
        cgstAmount: Joi.number().min(0).optional().default(0),
        sgstPercent: Joi.number().min(0).max(100).optional().default(0),
        sgstAmount: Joi.number().min(0).optional().default(0),
        igstPercent: Joi.number().min(0).max(100).optional().default(0),
        igstAmount: Joi.number().min(0).optional().default(0),
        netAmount: Joi.number().min(0).required()
    })).min(1).required().messages({
        'array.min': 'At least one item is required in the purchase return invoice'
    }),
    taxableAmountTotal: Joi.number().min(0).required(),
    cgstTotal: Joi.number().min(0).required(),
    sgstTotal: Joi.number().min(0).required(),
    igstTotal: Joi.number().min(0).required(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional().default(0),
    extraDiscountAmount: Joi.number().min(0).optional().default(0),
    shippingCost: Joi.number().min(0).optional().default(0),
    invoiceTotal: Joi.number().min(0).required(),
    amountReceived: Joi.number().min(0).optional().default(0),
    paymentType: Joi.string().valid('Cash', 'Bank').optional().default('Cash'),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional().default(false),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
});

const updatePurchaseReturnSchema = Joi.object({
    purchaseReturnNumber: Joi.string().trim().optional().allow('', null),
    purchaseBillNumber: Joi.string().trim().optional(),
    supplier: Joi.string().pattern(objectIdPattern).optional(),
    purchaseReturnDate: Joi.date().optional(),
    transport: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    items: Joi.array().items(Joi.object({
        product: Joi.string().pattern(objectIdPattern).optional(),
        description: Joi.string().trim().optional(),
        designNo: Joi.string().trim().optional().allow('', null),
        hsnCode: Joi.string().trim().optional().allow('', null),
        pcs: Joi.number().min(1).optional(),
        rate: Joi.number().min(0).optional(),
        total: Joi.number().min(0).optional(),
        discPercent: Joi.number().min(0).max(100).optional(),
        discAmount: Joi.number().min(0).optional(),
        taxableAmount: Joi.number().min(0).optional(),
        cgstPercent: Joi.number().min(0).max(100).optional(),
        cgstAmount: Joi.number().min(0).optional(),
        sgstPercent: Joi.number().min(0).max(100).optional(),
        sgstAmount: Joi.number().min(0).optional(),
        igstPercent: Joi.number().min(0).max(100).optional(),
        igstAmount: Joi.number().min(0).optional(),
        netAmount: Joi.number().min(0).optional()
    })).min(1).optional(),
    taxableAmountTotal: Joi.number().min(0).optional(),
    cgstTotal: Joi.number().min(0).optional(),
    sgstTotal: Joi.number().min(0).optional(),
    igstTotal: Joi.number().min(0).optional(),
    extraDiscountPercent: Joi.number().min(0).max(100).optional(),
    extraDiscountAmount: Joi.number().min(0).optional(),
    shippingCost: Joi.number().min(0).optional(),
    invoiceTotal: Joi.number().min(0).optional(),
    amountReceived: Joi.number().min(0).optional(),
    paymentType: Joi.string().valid('Cash', 'Bank').optional(),
    bank: Joi.string().pattern(objectIdPattern).optional().allow('', null),
    markAsFullyPaid: Joi.boolean().optional(),
    notes: Joi.string().trim().optional().allow('', null),
    terms: Joi.array().items(Joi.string()).optional()
}).min(1);

const addPaymentSchema = Joi.object({
    paymentNumber: Joi.string().trim().optional().allow('', null),
    customer: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Customer is required',
        'string.pattern.base': 'Customer ID must be a valid MongoDB ObjectId',
        'any.required': 'Customer is required'
    }),
    paymentDate: Joi.date().optional(),
    paymentMode: Joi.string().pattern(objectIdPattern).required().messages({
        'string.empty': 'Payment Mode / Bank is required',
        'string.pattern.base': 'Bank ID must be a valid MongoDB ObjectId',
        'any.required': 'Payment Mode / Bank is required'
    }),
    chequeNo: Joi.string().trim().optional().allow('', null),
    notes: Joi.string().trim().optional().allow('', null),
    settledInvoices: Joi.array().items(Joi.object({
        purchaseInvoice: Joi.string().pattern(objectIdPattern).required().messages({
            'string.empty': 'Purchase Invoice ID is required',
            'string.pattern.base': 'Purchase Invoice ID must be a valid MongoDB ObjectId'
        }),
        invoiceNumber: Joi.string().trim().required(),
        invoiceDate: Joi.date().required(),
        invoiceAmount: Joi.number().required(),
        pendingAmount: Joi.number().required(),
        settledAmount: Joi.number().min(0).required()
    })).optional(),
    amount: Joi.number().min(0).required().messages({
        'number.base': 'Total Amount must be a number',
        'any.required': 'Total Amount is required'
    })
});

const updatePaymentSchema = Joi.object({
    paymentNumber: Joi.string().trim().optional().allow('', null),
    customer: Joi.string().pattern(objectIdPattern).optional(),
    paymentDate: Joi.date().optional(),
    paymentMode: Joi.string().pattern(objectIdPattern).optional(),
    chequeNo: Joi.string().trim().optional().allow('', null),
    notes: Joi.string().trim().optional().allow('', null),
    settledInvoices: Joi.array().items(Joi.object({
        purchaseInvoice: Joi.string().pattern(objectIdPattern).optional(),
        invoiceNumber: Joi.string().trim().optional(),
        invoiceDate: Joi.date().optional(),
        invoiceAmount: Joi.number().optional(),
        pendingAmount: Joi.number().optional(),
        settledAmount: Joi.number().min(0).optional()
    })).optional(),
    amount: Joi.number().min(0).optional()
}).min(1);

module.exports = {
    validateBody,
    validateBodyData,
    addRoleSchema,
    updateRoleSchema,
    addUserSchema,
    updateUserSchema,
    addEmployeeSchema,
    updateEmployeeSchema,
    addAgentSchema,
    updateAgentSchema,
    addLedgerHeadSchema,
    updateLedgerHeadSchema,
    addPartiesSchema,
    updatePartiesSchema,
    addCategorySchema,
    updateCategorySchema,
    addProductSchema,
    updateProductSchema,
    addStateSchema,
    updateStateSchema,
    addTransportSchema,
    updateTransportSchema,
    addOrderSchema,
    updateOrderSchema,
    addTaxSchema,
    updateTaxSchema,
    addTdsRateSchema,
    updateTdsRateSchema,
    addExpenseSchema,
    updateExpenseSchema,
    addTermSchema,
    updateTermSchema,
    addActualExpenseSchema,
    updateActualExpenseSchema,
    addBankSchema,
    updateBankSchema,
    addCashAndBankSchema,
    updateCashAndBankSchema,
    addSalesSchema,
    updateSalesSchema,
    addSalesReturnSchema,
    updateSalesReturnSchema,
    addReceiptSchema,
    updateReceiptSchema,
    addPurchaseSchema,
    updatePurchaseSchema,
    addPurchaseReturnSchema,
    updatePurchaseReturnSchema,
    addPaymentSchema,
    updatePaymentSchema
};



