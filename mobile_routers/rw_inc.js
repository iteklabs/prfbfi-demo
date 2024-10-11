const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, suppliers_payment, s_payment_data, email_settings, supervisor_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
const nodemailer = require('nodemailer');
var ejs = require('ejs');
const path = require("path");
const users = require("../public/language/languages.json");

router.get("/view", async (req, res) => {
    try {

        const start = parseInt(req.query.start) || 0; // Default start index is 0
        const end = parseInt(req.query.end) || 10; // Default end index is the length of data
        let purchases_data
   
        purchases_data = await purchases.aggregate([
            {
              $lookup: {
                from: "suppliers",
                localField: "suppliers",
                foreignField: "name",
                as: "suppliers_docs"
              }
            },
            {
              $unwind: "$suppliers_docs"
            },
            {
              $unwind: "$product"
            },
            {
              $group: {
                _id: "$_id",
                invoice: { $first: "$invoice" },
                suppliers: { $first: "$suppliers" },
                date: { $first: "$date" },
                warehouse_name: { $first: "$warehouse_name" },
                room: { $addToSet: "$product.room_name" },
                product: { $push: "$product" },
                note: { $first: "$note" },
                paid_amount: { $first: "$paid_amount" },
                due_amount: { $first: "$due_amount" },
                return_data: { $first: "$return_data" },
                batch_code: { $first: "$batch_code" },
                expiry_date: { $first: "$expiry_date" },
                suppliers_docs: { $first: "$suppliers_docs" },
                total_product_quantity: { $sum: "$product.quantity" },
                level: { $addToSet: "$product.bay" },
                isle: { $addToSet: "$product.bin" },
                type: { $addToSet: "$product.type" },
                floorlevel: { $addToSet: "$product.floorlevel" },
                finalize: { $first: "$finalize" }
              }
              
            },
            {
                $sort: { _id: 1 } // Sort documents by _id in ascending order
            },
            {
              $project: {
                _id: 1,
                invoice: 1,
                suppliers: 1,
                date: 1,
                warehouse_name: 1,
                room: 1,
                product: 1,
                note: 1,
                paid_amount: 1,
                due_amount: 1,
                return_data: 1,
                batch_code: 1,
                expiry_date: 1,
                suppliers_docs: 1,
                total_product_quantity: 1,
                level: 1,
                isle: 1,
                type: 1,
                floorlevel:1,
                finalize: 1
                
              }
           },
           { $skip: start }, // Skip documents based on start parameter
           { $limit: end - start }
        ]);

        
        // const paginatedData = purchases_data.slice(startIdx, endIdx);
        // console.group(req.query)
        res.json(purchases_data);
        
        // res.render("all_purchases", {
        //     success: req.flash('success'),
        //     errors: req.flash('errors'),
        //     purchases: purchases_data,
        //     role : role_data,
        //     profile : profile_data,
        //     master_shop : master,
        //     language : lan_data
        // })
    } catch (error) {
        console.log("table page", error);
        res.status(200).json({ message: error.message })
    }
})



router.post("/barcode_scanner", async (req, res) => {
  const { product_code } = req.body

  var checkData ;
  const product_data1 = await product.aggregate([
      {
          $match:{
              "primary_code": product_code,
              "product_category": "Raw Materials"
          }
      },
      {
          $group:{
              _id: "$_id",
              name: { $first: "$name" },
              category:  { $first:  "$category" },
              brand:  { $first: "$brand" },
              unit:  { $first: "$unit" },
              alertquantity:  { $first: "$alertquantity" },
              product_code:  { $first: "$product_code" },
              primary_code:  { $first: "$primary_code" },
              secondary_code:  { $first: "$secondary_code" },
              maxStocks:  { $first: "$maxStocks" },
              maxProdPerUnit:  { $first: "$maxProdPerUnit" },
              product_cat: { $first : "P" },
              secondary_unit: { $first: "$secondary_unit" }
          }
      },
      {
          $project: {
              _id: 1,
              name: 1,
              category: 1,
              brand: 1,
              unit: 1,
              alertquantity: 1,
              product_code: 1,
              primary_code: 1,
              secondary_code: 1,
              maxStocks: 1,
              maxProdPerUnit: 1,
              product_cat: 1,
              secondary_unit: 1
          }
      }
  ])


  const product_data2 = await product.aggregate([
      {
          $match:{
              "secondary_code": product_code,
              "product_category": "Raw Materials"
          }
      },
      {
          $group:{
              _id: "$_id",
              name: { $first: "$name" },
              category:  { $first:  "$category" },
              brand:  { $first: "$brand" },
              unit:  { $first: "$unit" },
              alertquantity:  { $first: "$alertquantity" },
              product_code:  { $first: "$product_code" },
              primary_code:  { $first: "$primary_code" },
              secondary_code:  { $first: "$secondary_code" },
              maxStocks:  { $first: "$maxStocks" },
              maxProdPerUnit:  { $first: "$maxProdPerUnit" },
              product_cat: { $first : "S" },
              secondary_unit: { $first: "$secondary_unit" }
          }
      },
      {
          $project: {
              _id: 1,
              name: 1,
              category: 1,
              brand: 1,
              unit: 1,
              alertquantity: 1,
              product_code: 1,
              primary_code: 1,
              secondary_code: 1,
              maxStocks: 1,
              maxProdPerUnit: 1,
              product_cat: 1,
              secondary_unit: 1
          }
      }
  ])


  


  if(product_data1.length > 0){
      checkData = product_data1;
  }else if(product_data2.length > 0){
      checkData = product_data2;
   
  }
  
  res.json( checkData )
  
})



module.exports = router;