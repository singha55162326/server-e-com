import express from "express";
import asyncHandler from "express-async-handler";
import Categories from "../Models/CategoriesModel.js";
import { protect,admin } from "../Middleware/AuthMiddleware.js";

const categoriesRoute = express.Router();

// GET ALL CATEGORY
categoriesRoute.get(
    "/",
    asyncHandler(async (req, res) => {
      const categories = await Categories.find({});
      res.json(categories);
    })
);

// GET SINGLE PRODUCT
categoriesRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await Categories.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404);
      throw new Error("ບໍ່ພົບຂໍ້ມູນປະເພດສິນຄ້າ");
    }
  })
);

// CREATE CATEGORY --Admin
categoriesRoute.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
      const {name} = req.body
      const categoryExist = await Categories.findOne({name})
      if (categoryExist) {
        res.status(400);
        throw new Error("ຊື່ປະເພດສິນຄ້ານີ້ມີຢູ່ແລ້ວ");
      } else {
        const category = new Categories({
          name,
          user: req.user._id,
        });
        if(category) {
          const createdcategory = await category.save()
          res.status(201).json(createdcategory)
        }
        else{
          res.status(400);
          throw new Error("ຂໍ້ມູນປະເພດສິນຄ້າບໍ່ຖືກຕ້ອງ");
        }
      }
    })
);

// EDIT CATEGORY --Admin
categoriesRoute.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
      const {name} = req.body
      const category = await Categories.findById(req.params.id);
      if (category) {
        category.name = name || category.name;
  
        const updatedCategory = await category.save()
        res.json(updatedCategory)
      } else {
        res.status(404);
        throw new Error("ບໍ່ພົບຂໍ້ມູນປະເພດສິນຄ້າສິນຄ້າ")
      }
    })
  );

// DELETE PRODUCT --Admin
categoriesRoute.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const category = await Categories.findById(req.params.id);
    if (category) {
      await category.remove();
      res.json({ message: "ປະເພດສິນຄ້ານີ້ຖືກລົບໄປເປັນທີ່ຮຽບຮ້ອຍ" })
    } else {
      res.status(404);
      throw new Error("ບໍ່ພົບຂໍ້ມູນສິນຄ້າ");
    }
  })
);
  
export default categoriesRoute;