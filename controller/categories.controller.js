const CATEGORY = require('../model/categories.model');
const { addCategorySchema, updateCategorySchema, validateBodyData } = require('../helper/validator');
const { getProfileImage } = require('../helper/image');

exports.addCategory = async (req, res) => {
    try {
        const logo = await getProfileImage(req, 'categoryLogo', 'categories');
        const { error, value } = validateBodyData(addCategorySchema, {
            ...req.body,
            categoryLogo: logo || ""
        });

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const category = await CATEGORY.create(value);

        res.status(201).json({ message: `Category created successfully....`, category });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await CATEGORY.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "productDetail.category",
                    as: "products"
                }
            },
            {
                $addFields: {
                    productCount: { $size: "$products" }
                }
            },
            {
                $project: {
                    products: 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.status(200).json({ message: `Categories fetched successfully....`, categories });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CATEGORY.findById(id);

        if (!category) {
            return res.status(404).json({ message: `Category not found` });
        }

        res.status(200).json({ message: `Category fetched successfully....`, category });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const body = { ...req.body };
        const uploadedImage = await getProfileImage(req, 'categoryLogo', 'categories');
        if (uploadedImage) {
            body.categoryLogo = uploadedImage;
        }

        const { error, value } = validateBodyData(updateCategorySchema, body);

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const category = await CATEGORY.findById(id);

        if (!category) {
            return res.status(404).json({ message: `Category not found` });
        }

        const updatedCategory = await CATEGORY.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ message: `Category updated successfully....`, category: updatedCategory });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CATEGORY.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: `Category not found` });
        }

        res.status(200).json({ message: `Category deleted successfully....` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};
