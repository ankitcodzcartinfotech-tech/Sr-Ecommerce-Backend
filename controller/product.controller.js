const PRODUCT = require('../model/product.model');
const { addProductSchema, updateProductSchema, validateBodyData } = require('../helper/validator');
const { getMultipleImages } = require('../helper/image');

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, '-and-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const generateUniqueSlug = async (name, productId = null) => {
    let slug = slugify(name);
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
        const query = { slug: uniqueSlug };
        if (productId) {
            query._id = { $ne: productId };
        }
        const existingProduct = await PRODUCT.findOne(query);
        if (!existingProduct) {
            break;
        }
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }
    return uniqueSlug;
};

const parseProductBody = (body) => {
    const parsed = { ...body };
    const jsonFields = ['productDetail', 'saleDetails', 'purchaseDetails', 'stockDetails', 'variants'];
    jsonFields.forEach((field) => {
        if (typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {}
        }
    });

    if (parsed.productDetail) {
        if (parsed.productDetail.cut !== undefined && parsed.productDetail.cut !== '') {
            parsed.productDetail.cut = Number(parsed.productDetail.cut);
        } else if (parsed.productDetail.cut === '') {
            delete parsed.productDetail.cut;
        }

        if (parsed.productDetail.checkNegativeStock !== undefined && parsed.productDetail.checkNegativeStock !== '') {
            parsed.productDetail.checkNegativeStock = Number(parsed.productDetail.checkNegativeStock);
        }

        if (parsed.productDetail.category === '' || parsed.productDetail.category === 'null' || parsed.productDetail.category === null) {
            delete parsed.productDetail.category;
        }
    }

    if (parsed.saleDetails) {
        if (parsed.saleDetails.salePrice !== undefined && parsed.saleDetails.salePrice !== '') {
            parsed.saleDetails.salePrice = Number(parsed.saleDetails.salePrice);
        }
        if (parsed.saleDetails.discount !== undefined && parsed.saleDetails.discount !== '') {
            parsed.saleDetails.discount = Number(parsed.saleDetails.discount);
        }
    }

    if (parsed.purchaseDetails) {
        if (parsed.purchaseDetails.wholeshaleAllow !== undefined) {
            parsed.purchaseDetails.wholeshaleAllow = parsed.purchaseDetails.wholeshaleAllow === 'true' || parsed.purchaseDetails.wholeshaleAllow === true;
        }
        if (parsed.purchaseDetails.wholeshalePrice !== undefined && parsed.purchaseDetails.wholeshalePrice !== '') {
            parsed.purchaseDetails.wholeshalePrice = Number(parsed.purchaseDetails.wholeshalePrice);
        } else if (parsed.purchaseDetails.wholeshalePrice === '') {
            delete parsed.purchaseDetails.wholeshalePrice;
        }

        if (parsed.purchaseDetails.wholeshalePricePercentage !== undefined && parsed.purchaseDetails.wholeshalePricePercentage !== '') {
            parsed.purchaseDetails.wholeshalePricePercentage = Number(parsed.purchaseDetails.wholeshalePricePercentage);
        } else if (parsed.purchaseDetails.wholeshalePricePercentage === '') {
            delete parsed.purchaseDetails.wholeshalePricePercentage;
        }

        if (parsed.purchaseDetails.purchasePrice !== undefined && parsed.purchaseDetails.purchasePrice !== '') {
            parsed.purchaseDetails.purchasePrice = Number(parsed.purchaseDetails.purchasePrice);
        } else if (parsed.purchaseDetails.purchasePrice === '') {
            delete parsed.purchaseDetails.purchasePrice;
        }

        if (parsed.purchaseDetails.gstTax !== undefined && parsed.purchaseDetails.gstTax !== '') {
            parsed.purchaseDetails.gstTax = Number(parsed.purchaseDetails.gstTax);
        } else if (parsed.purchaseDetails.gstTax === '') {
            delete parsed.purchaseDetails.gstTax;
        }

        if (parsed.purchaseDetails.purchaseParty === '' || parsed.purchaseDetails.purchaseParty === 'null' || parsed.purchaseDetails.purchaseParty === null) {
            delete parsed.purchaseDetails.purchaseParty;
        }
    }

    if (parsed.stockDetails) {
        if (parsed.stockDetails.openingQuantity !== undefined && parsed.stockDetails.openingQuantity !== '') {
            parsed.stockDetails.openingQuantity = Number(parsed.stockDetails.openingQuantity);
        }
        if (parsed.stockDetails.atPrice !== undefined && parsed.stockDetails.atPrice !== '') {
            parsed.stockDetails.atPrice = Number(parsed.stockDetails.atPrice);
        }
        if (parsed.stockDetails.atOfDate !== undefined && parsed.stockDetails.atOfDate !== '') {
            parsed.stockDetails.atOfDate = Number(parsed.stockDetails.atOfDate);
        }
        if (parsed.stockDetails.minStockToMaintain !== undefined && parsed.stockDetails.minStockToMaintain !== '') {
            parsed.stockDetails.minStockToMaintain = Number(parsed.stockDetails.minStockToMaintain);
        }
    }

    if (parsed.variants && Array.isArray(parsed.variants)) {
        parsed.variants = parsed.variants.map(variant => ({
            ...variant,
            salePrice: variant.salePrice !== undefined ? Number(variant.salePrice) : variant.salePrice,
            purchasePrice: variant.purchasePrice !== undefined ? Number(variant.purchasePrice) : variant.purchasePrice,
            stock: variant.stock !== undefined ? Number(variant.stock) : 0,
            isActive: variant.isActive === 'true' || variant.isActive === true
        }));
    }

    return parsed;
};

exports.addProduct = async (req, res) => {
    try {
        const parsedBody = parseProductBody(req.body);
        const images = await getMultipleImages(req, 'images', 'products');
        
        if (images && images.length > 0) {
            if (parsedBody.productDetail) {
                const existing = Array.isArray(parsedBody.productDetail.images) ? parsedBody.productDetail.images : [];
                parsedBody.productDetail.images = [...existing, ...images];
            } else {
                parsedBody.images = images;
            }
        }

        const { error, value } = validateBodyData(addProductSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        if (value.variants && value.variants.length > 0) {
            const skus = value.variants.map(v => v.sku);
            const uniqueSkus = new Set(skus);
            if (skus.length !== uniqueSkus.size) {
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate SKUs found in variants'
                });
            }

            const existingProducts = await PRODUCT.find({ 'variants.sku': { $in: skus } });
            if (existingProducts.length > 0) {
                const existingSkus = existingProducts.flatMap(p => p.variants.map(v => v.sku));
                const duplicates = skus.filter(sku => existingSkus.includes(sku));
                return res.status(400).json({
                    success: false,
                    message: `SKUs already exist: ${duplicates.join(', ')}`
                });
            }
        }

        value.slug = await generateUniqueSlug(value.productDetail.name);
        const product = await PRODUCT.create(value);
        const populated = await PRODUCT.findById(product._id)
            .populate('productDetail.category')
            .populate('purchaseDetails.purchaseParty');

        res.status(201).json({ message: 'Product created successfully....', product: populated });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const color = req.query.color || '';
        const fabric = req.query.fabric || '';
        const design = req.query.design || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || 0;
        const inStock = req.query.inStock === 'true';
        const category = req.query.category || '';
        const sort = req.query.sort || 'newest';

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
        }

        const skip = (page - 1) * limit;
        const query = {};

        if (search) query['productDetail.name'] = { $regex: search, $options: 'i' };
        if (category) query['productDetail.category'] = category;

        // Build $elemMatch for variants - ensures a single variant matches all conditions
        const elemMatch = {};
        if (color) elemMatch['color'] = { $regex: color, $options: 'i' };
        
        // Handle multiple fabrics (comma-separated)
        if (fabric) {
            const fabrics = fabric.split(',').map(f => f.trim()).filter(Boolean);
            if (fabrics.length === 1) {
                elemMatch['fabric'] = { $regex: fabrics[0], $options: 'i' };
            } else if (fabrics.length > 1) {
                elemMatch['fabric'] = { $in: fabrics.map(f => new RegExp(f, 'i')) };
            }
        }
        
        // Handle multiple designs/occasions (comma-separated)
        if (design) {
            const designs = design.split(',').map(d => d.trim()).filter(Boolean);
            if (designs.length === 1) {
                elemMatch['design'] = { $regex: designs[0], $options: 'i' };
            } else if (designs.length > 1) {
                elemMatch['design'] = { $in: designs.map(d => new RegExp(d, 'i')) };
            }
        }
        
        // Only apply price filter if at least one of min or max is set and valid
        const hasMinPrice = minPrice > 0;
        const hasMaxPrice = maxPrice > 0 && maxPrice > minPrice;
        
        if (hasMinPrice || hasMaxPrice) {
            query['saleDetails.salePrice'] = {};
            if (hasMinPrice) query['saleDetails.salePrice'].$gte = minPrice;
            if (hasMaxPrice) query['saleDetails.salePrice'].$lte = maxPrice;
        }
        
        // Ensure inStock checks stockDetails.openingQuantity if no variants
        // But for simplicity, keep elemMatch only for color, fabric, design, and variant stock
        if (inStock) {
            query['$or'] = [
                { 'variants': { $elemMatch: { stock: { $gt: 0 } } } },
                { 'stockDetails.openingQuantity': { $gt: 0 } }
            ];
        }

        if (Object.keys(elemMatch).length > 0) {
            query['variants'] = { $elemMatch: elemMatch };
        }

        const total = await PRODUCT.countDocuments(query);

        // Sorting
        let sortOption = { createdAt: -1 }; // default newest
        if (sort === 'price_asc') sortOption = { 'saleDetails.salePrice': 1 };
        if (sort === 'price_desc') sortOption = { 'saleDetails.salePrice': -1 };
        // For 'popular' we could use number of orders, but default to newest for now

        const products = await PRODUCT.find(query)
            .populate('productDetail.category')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: 'Products fetched successfully....',
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            filters: { search, color, fabric, design, minPrice, maxPrice, inStock, category, sort }
        });
    } catch (error) {
        console.log("ERROR in getProducts:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const mongoose = require('mongoose');

exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        let product;
        
        // First try to find by ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await PRODUCT.findById(id)
                .populate({ path: 'productDetail.category', strictPopulate: false })
                .populate({ path: 'purchaseDetails.purchaseParty', strictPopulate: false });
        }
        
        // If not found by ObjectId, try to find by slug
        if (!product) {
            product = await PRODUCT.findOne({ slug: id })
                .populate({ path: 'productDetail.category', strictPopulate: false })
                .populate({ path: 'purchaseDetails.purchaseParty', strictPopulate: false });
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product fetched successfully....', product });
    } catch (error) {
        console.log("ERROR in getProduct:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedBody = parseProductBody(req.body);
        const images = await getMultipleImages(req, 'images', 'products');
        
        if (images && images.length > 0) {
            if (parsedBody.productDetail) {
                const existing = Array.isArray(parsedBody.productDetail.images) ? parsedBody.productDetail.images : [];
                parsedBody.productDetail.images = [...existing, ...images];
            } else {
                parsedBody.images = images;
            }
        }

        const { error, value } = validateBodyData(updateProductSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const product = await PRODUCT.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (value.variants && value.variants.length > 0) {
            const skus = value.variants.map(v => v.sku);
            const uniqueSkus = new Set(skus);
            if (skus.length !== uniqueSkus.size) {
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate SKUs found in variants'
                });
            }

            const existingProducts = await PRODUCT.find({
                _id: { $ne: id },
                'variants.sku': { $in: skus }
            });
            if (existingProducts.length > 0) {
                const existingSkus = existingProducts.flatMap(p => p.variants.map(v => v.sku));
                const duplicates = skus.filter(sku => existingSkus.includes(sku));
                return res.status(400).json({
                    success: false,
                    message: `SKUs already exist: ${duplicates.join(', ')}`
                });
            }
        }

        if (value.productDetail && value.productDetail.name) {
            value.slug = await generateUniqueSlug(value.productDetail.name, id);
        } else if (!product.slug) {
            value.slug = await generateUniqueSlug(product.productDetail.name, id);
        }

        const updatedProduct = await PRODUCT.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        )
            .populate('productDetail.category')
            .populate('purchaseDetails.purchaseParty');

        res.status(200).json({ message: 'Product updated successfully....', product: updatedProduct });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await PRODUCT.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getVariantFilters = async (req, res) => {
    try {
        const category = req.query.category || null;

        const matchQuery = {};
        if (category) {
            matchQuery['productDetail.category'] = new (require('mongoose').Types.ObjectId)(category);
        }

        const pipeline = [
            ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
            { $unwind: { path: '$variants', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: null,
                    colors: { $addToSet: '$variants.color' },
                    fabrics: { $addToSet: '$variants.fabric' },
                    designs: { $addToSet: '$variants.design' },
                    minPrice: { $min: '$saleDetails.salePrice' },
                    maxPrice: { $max: '$saleDetails.salePrice' }
                }
            }
        ];

        const result = await PRODUCT.aggregate(pipeline);

        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    colors: [],
                    fabrics: [],
                    designs: [],
                    priceRange: { min: 0, max: 0 }
                }
            });
        }

        const filters = result[0];

        const cleanArray = (arr) => arr.filter(item => item && item.trim() !== '').sort();

        res.status(200).json({
            success: true,
            data: {
                colors: cleanArray(filters.colors || []),
                fabrics: cleanArray(filters.fabrics || []),
                designs: cleanArray(filters.designs || []),
                priceRange: {
                    min: filters.minPrice || 0,
                    max: filters.maxPrice || 0
                }
            }
        });
    } catch (error) {
        console.error('Error in getVariantFilters:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.compareProducts = async (req, res) => {
    try {
        const { ids } = req.query;

        if (!ids) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs are required'
            });
        }

        const productIdentifiers = ids.split(',').map(id => id.trim()).filter(id => id);

        if (productIdentifiers.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Minimum 2 products required for comparison'
            });
        }

        if (productIdentifiers.length > 4) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 4 products allowed for comparison'
            });
        }

        // Create query that matches either _id or slug for each identifier
        const queryConditions = productIdentifiers.map(identifier => {
            if (mongoose.Types.ObjectId.isValid(identifier)) {
                return { $or: [{ _id: identifier }, { slug: identifier }] };
            }
            return { slug: identifier };
        });

        const products = await PRODUCT.find({ $or: queryConditions })
            .populate('productDetail.category')
            .select('productDetail.name productDetail.category productDetail.image productDetail.images productDetail.description saleDetails.salePrice saleDetails.discount stockDetails.openingQuantity variants createdAt')
            .lean();

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found'
            });
        }

        const foundIdentifiers = new Set([
            ...products.map(p => p._id.toString()),
            ...products.filter(p => p.slug).map(p => p.slug)
        ]);
        
        const notFoundIdentifiers = productIdentifiers.filter(id => !foundIdentifiers.has(id));

        if (notFoundIdentifiers.length > 0) {
            return res.status(404).json({
                success: false,
                message: `Products not found: ${notFoundIdentifiers.join(', ')}`
            });
        }

        const comparisonData = products.map(product => ({
            _id: product._id,
            name: product.productDetail?.name || 'N/A',
            category: product.productDetail?.category?.name || 'N/A',
            categoryId: product.productDetail?.category?._id || null,
            image: product.productDetail?.images && product.productDetail.images.length > 0 ? product.productDetail.images[0] : (product.productDetail?.image || ''),
            images: product.productDetail?.images || [],
            description: product.productDetail?.description || '',
            salePrice: product.saleDetails?.salePrice || 0,
            discount: product.saleDetails?.discount || 0,
            stock: product.stockDetails?.openingQuantity || 0,
            variants: product.variants || [],
            variantCount: product.variants?.length || 0,
            totalVariantStock: product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0,
            createdAt: product.createdAt
        }));

        res.status(200).json({
            success: true,
            data: {
                products: comparisonData,
                comparedCount: comparisonData.length
            }
        });
    } catch (error) {
        console.error('Error in compareProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
