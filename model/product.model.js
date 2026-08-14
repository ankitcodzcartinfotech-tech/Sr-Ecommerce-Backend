const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    sku: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    fabric: {
        type: String,
        trim: true
    },
    design: {
        type: String,
        trim: true
    },
    images: [{
        type: String
    }],
    salePrice: {
        type: Number,
        min: 0,
        default: 0
    },
    purchasePrice: {
        type: Number,
        min: 0,
        default: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    _id: true,
    timestamps: true
});

const productSchema = new mongoose.Schema({

    slug: {
        type: String,
        unique: true,
        sparse: true
    },

    productDetail: {
        name: {
            type: String,
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categories'
        },
        hsnCode: {
            type: String,
            trim: true
        },
        itemCode: {
            type: String,
            trim: true
        },
        cut: {
            type: Number
        },
        description: {
            type: String
        },
        images: [{
            type: String
        }],
        checkNegativeStock: {
            type: Number,
            enum: [1, 2],
            default: 1
        },
    },

    saleDetails: {
        salePrice: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        measuringUnit: {
            type: String,
            enum: ['piece', 'meter']
        }
    },

    purchaseDetails: {
        wholeshaleAllow: {
            type: Boolean,
            default: false
        },
        wholeshalePrice: {
            type: Number
        },
        wholeshalePricePercentage: {
            type: Number
        },

        purchasePrice: {
            type: Number
        },
        gstTax: {
            type: Number
        },
        purchaseDesignNo: {
            type: String
        },
        purchaseParty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },

    stockDetails: {
        openingQuantity: {
            type: Number,
            default: 0
        },
        atPrice: {
            type: Number,
            default: 0
        },
        atOfDate: {
            type: Number,
            default: 0
        },
        minStockToMaintain: {
            type: Number,
            default: 0
        },
        location: {
            type: String,
            default: ""
        }
    },

    variants: [variantSchema]

}, {
    versionKey: false,
    timestamps: true
});

productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });
productSchema.index({ 'productDetail.name': 1 });
productSchema.index({ 'productDetail.category': 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;