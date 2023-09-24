import express from "express";
import User from "./Models/UserModel.js";
import users from "./data/users.js";
import Product from "./Models/ProductModel.js";
import Products from "./data/Products.js";
import asyncHandler from "express-async-handler"
import Categories from "./Models/CategoriesModel.js";
import categoriesData from "./data/Categories.js";

const ImportData = express.Router();

ImportData.post("/user", asyncHandler(async (req, res) => {
  await User.remove({});
  const importUser = await User.insertMany(users)
  res.send({ importUser })
})
);

ImportData.post("/products", asyncHandler(async (req, res) => {
  await Product.remove({});
  const importProducts = await Product.insertMany(Products);
  res.send({ importProducts });
})
);

ImportData.post("/categories", asyncHandler(async (req, res) => {
  await Categories.remove({});
  const importCategories = await Categories.insertMany(categoriesData);
  res.send({ importCategories });
})
);

export default ImportData;
