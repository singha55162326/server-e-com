import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../Models/ProductModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import ApiFeatures from "../utils/apifeatures.js";
const productRoute = express.Router();

// GET ALL PRODUCT
// productRoute.get(
//   "/",
//   asyncHandler(async (req, res) => {
//     const pageSize = 3;
//     const page = Number(req.query.pageNumber) || 1;
//     const keyword = req.query.keyword
//       ? {
//           name: {
//             $regex: req.query.keyword,
//             $options: "i",
//           },
//         }
//       : {};
//     const count = await Product.countDocuments({ ...keyword });
//     const products = await Product.find({ ...keyword })
//       .limit(pageSize)
//       .skip(pageSize * (page - 1))
//       .sort({ _id: -1 });
//     res.json({ products, page, pages: Math.ceil(count / pageSize) });
//   })
// );

// GET ALL PRODUCT
productRoute.get(
  "/",
  asyncHandler(async (req, res) => {
    const resultPerPage = 9;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();

    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  })
);

// ADMIN GET ALL PRODUCT WITHOUT SEARCH AND PEGINATION
productRoute.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products);
  })
);

// GET SINGLE PRODUCT
productRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
    }
  })
);

// PRODUCT REVIEW
productRoute.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("ສິນຄ້ານີ້ທ່ານໄດ້ສະແດງຄວາມຄິດເຫັນໄປແລ້ວ");
      }
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({
        message: "ຂໍຂອບໃຈສຳລັບຄວາມຄິດເຫັນຂອງທ່ານທີ່ມີຕໍ່ສິນຄ້າຂອງພວກເຮົາ",
      });
    } else {
      res.status(404);
      throw new Error("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
    }
  })
);

// GET PRODUCT REVIEWS
productRoute.get(
  "/:id/review",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product.reviews);
    } else {
      res.status(404);
      throw new Error("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
    }
  })
);

// DELETE PRODUCT --Admin
productRoute.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.json({ message: "ສິນຄ້ານີ້ຖືກລົບໄປເປັນທີ່ຮຽບຮ້ອບ" });
    } else {
      res.status(404);
      throw new Error("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
    }
  })
);

// CREATE PRODUCT --Admin
productRoute.post(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, price, description, image, countInStock, category } =
      req.body;
    const productExist = await Product.findOne({ name });
    if (productExist) {
      res.status(400);
      throw new Error("ຊື່ສິນຄ້ານີ້ມີຢູ່ແລ້ວ");
    } else {
      const product = new Product({
        name,
        price,
        description,
        image,
        countInStock,
        category,
        user: req.user._id,
      });
      if (product) {
        const createdproduct = await product.save();
        res.status(201).json(createdproduct);
      } else {
        res.status(400);
        throw new Error("ຂໍ້ມູນສິນຄ້າບໍ່ຖືກຕ້ອງ");
      }
    }
  })
);

// EDIT PRODUCT --Admin
productRoute.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, price, description, image, countInStock, category } =
      req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.countInStock = countInStock || product.countInStock;
      product.category = category || product.category;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
    }
  })
);

export default productRoute;
