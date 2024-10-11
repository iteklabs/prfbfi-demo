const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_finished, sales, sales_finished, sales_return, suppliers_payment, customer_payment, transfers , transfers_finished, email_settings, supervisor_settings, adjustment_finished, adjustment } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");
const nodemailer = require('nodemailer');


router.get("/view", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const warehouse_data = await warehouse.aggregate([
            {
                $match: { 
                    "status" : 'Enabled', 
                    "warehouse_category" : "Finished Goods"
                }
            },
            {
                $group: {
                    _id: "$name",
                    name: { $first: "$name"}
                }
            },
        ])

        // res.json(warehouse_data)
        // return

        if (master[0].language == "English (US)") {
            var lan_data = users.English
        } else if(master[0].language == "Hindi") {
            var lan_data = users.Hindi

        }else if(master[0].language == "German") {
            var lan_data = users.German
        
        }else if(master[0].language == "Spanish") {
            var lan_data = users.Spanish
        
        }else if(master[0].language == "French") {
            var lan_data = users.French
        
        }else if(master[0].language == "Portuguese (BR)") {
            var lan_data = users.Portuguese
        
        }else if(master[0].language == "Chinese") {
            var lan_data = users.Chinese
        
        }else if(master[0].language == "Arabic (ae)") {
            var lan_data = users.Arabic
        }

        res.render("transaction_finished", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            dataProcess: warehouse_data,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})


// router.post("/reports", auth, async(req, res) => {
//     const { product_category, transaction_category, transaction_date_from, transaction_date_to, warehouse_category, item_code} = req.body

//     var dataProcess
//     if(product_category == "rm"){
//         switch (transaction_category) {
//             case "IC":

//             if(item_code.length > 0){
//                 dataProcess = await purchases.aggregate([
//                     {
//                         $match: {
//                             warehouse_name: warehouse_category,
//                             date: {
//                                 $gte: transaction_date_from,
//                                 $lte: transaction_date_to
//                             }
//                         }
//                     },
//                     {
//                         $unwind: "$product"
//                     },
//                     {
//                         $match: {
//                             $or: [
//                                 { "product.product_code": item_code }
//                             ]
//                         }
//                     },
//                     {
//                         $group: {
//                             _id: "$invoice", // Group by invoice number
//                             date: { $first: "$date" }, // Get the first date in the group
//                             warehouse_name: { $first: "$warehouse_name" },
//                             products: { $push: "$product" } // Collect all products associated with each invoice
//                         }
//                     }
//                 ]);
//             }else{
//                 dataProcess = await purchases.aggregate([
//                     {
//                         $match: {
//                             warehouse_name: warehouse_category,
//                             date: {
//                                 $gte: transaction_date_from,
//                                 $lte: transaction_date_to
//                             }
//                         }
//                     },
//                     {
//                         $unwind: "$product"
//                     },
//                     {
//                         $group: {
//                             _id: "$invoice", // Group by invoice number
//                             date: { $first: "$date" }, // Get the first date in the group
//                             warehouse_name: { $first: "$warehouse_name" },
//                             products: { $push: "$product" } // Collect all products associated with each invoice
//                         }
//                     }
//                 ]);
//             }
                
                
//             break;
//             case "OG":


//                 if(item_code.length > 0){
//                     dataProcess = await sales.aggregate([
//                         {
//                             $match: {
//                                 warehouse_name: warehouse_category,
//                                 date: {
//                                     $gte: transaction_date_from,
//                                     $lte: transaction_date_to
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$sale_product"
//                         },
//                         {
//                             $match: {
//                                 $or: [
//                                     { "sale_product.product_code": item_code }
//                                 ]
//                             }
//                         },
//                         {
//                             $group: {
//                                 _id: "$invoice", // Group by invoice number
//                                 date: { $first: "$date" }, // Get the first date in the group
//                                 warehouse_name: { $first: "$warehouse_name" },
//                                 products: { $push: "$sale_product" } // Collect all products associated with each invoice
//                             }
//                         }
//                     ]);
//                 }else{
//                     dataProcess = await sales.aggregate([
//                         {
//                             $match: {
//                                 warehouse_name: warehouse_category,
//                                 date: {
//                                     $gte: transaction_date_from,
//                                     $lte: transaction_date_to
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$sale_product"
//                         },
//                         {
//                             $group: {
//                                 _id: "$invoice", // Group by invoice number
//                                 date: { $first: "$date" }, // Get the first date in the group
//                                 warehouse_name: { $first: "$warehouse_name" },
//                                 products: { $push: "$sale_product" } // Collect all products associated with each invoice
//                             }
//                         }
//                     ]);
//                 }
//             break;

//             case "AJ":

            
            

//             break;

//             case "TF":
//                 // dataProcess = await transfers_finished.find({
//                 //     warehouse : warehouse_category,
//                 //     date:{
//                 //         $gte: transaction_date_from,
//                 //         $lte: transaction_date_to
//                 //     }
//                 // })


//                 if(item_code.length > 0){
//                     dataProcess = await transfers.aggregate([
//                         {
//                             $match: {
//                                 from_warehouse: warehouse_category,
//                                 date: {
//                                     $gte: transaction_date_from,
//                                     $lte: transaction_date_to
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$product"
//                         },
//                         {
//                             $match: {
//                                 $or: [
//                                     { "product.product_code": item_code }
//                                 ]
//                             }
//                         },
//                         {
//                             $group: {
//                                 _id: "$invoice", // Group by invoice number
//                                 date: { $first: "$date" }, // Get the first date in the group
//                                 warehouse_name: { $first: "$from_warehouse" },
//                                 products: { $push: "$product" } // Collect all products associated with each invoice
//                             }
//                         }
//                     ]);
//                 }else{
//                     dataProcess = await transfers.aggregate([
//                         {
//                             $match: {
//                                 from_warehouse: warehouse_category,
//                                 date: {
//                                     $gte: transaction_date_from,
//                                     $lte: transaction_date_to
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$product"
//                         },
//                         {
//                             $group: {
//                                 _id: "$invoice", // Group by invoice number
//                                 date: { $first: "$date" }, // Get the first date in the group
//                                 warehouse_name: { $first: "$from_warehouse" },
//                                 products: { $push: "$product" } // Collect all products associated with each invoice
//                             }
//                         }
//                     ]);
//                 }
//             break;
//         }
        

//     }else if(product_category == "fg"){
  
//         switch (transaction_category) {
//             case "IC":
//                 // dataProcess = await purchases_finished.find({
//                 //     warehouse : warehouse_category,
//                 //     date:{
                       
//                 //         $gte: transaction_date_from,
//                 //         $lte: transaction_date_to
//                 //     }
//                 // })

           

//             if(item_code.length > 0){
//                 dataProcess = await purchases_finished.aggregate([
//                     {
//                         $match: {
//                             warehouse_name: warehouse_category,
//                             date: {
//                                 $gte: transaction_date_from,
//                                 $lte: transaction_date_to
//                             }
//                         }
//                     },
//                     {
//                         $unwind: "$product"
//                     },
//                     {
//                         $match: {
//                             $or: [
//                                 { "product.product_code": item_code }
//                             ]
//                         }
//                     },
//                     {
//                         $group: {
//                             _id: "$invoice", // Group by invoice number
//                             date: { $first: "$date" }, // Get the first date in the group
//                             warehouse_name: { $first: "$warehouse_name" },
//                             products: { $push: "$product" } // Collect all products associated with each invoice
//                         }
//                     }
//                 ]);
//             }else{
//                 dataProcess = await purchases_finished.aggregate([
//                     {
//                         $match: {
//                             warehouse_name: warehouse_category,
//                             date: {
//                                 $gte: transaction_date_from,
//                                 $lte: transaction_date_to
//                             }
//                         }
//                     },
//                     {
//                         $unwind: "$product"
//                     },
//                     {
//                         $group: {
//                             _id: "$invoice", // Group by invoice number
//                             date: { $first: "$date" }, // Get the first date in the group
//                             warehouse_name: { $first: "$warehouse_name" },
//                             products: { $push: "$product" } // Collect all products associated with each invoice
//                         }
//                     }
//                 ]);
//             }
                
                
//             break;
//             case "OG":
//                 // dataProcess = await sales_finished.find({
//                 //     warehouse : warehouse_category,
//                 //     date:{
//                 //         $gte: transaction_date_from,
//                 //         $lte: transaction_date_to
//                 //     }
//                 // })

//                 if(item_code.length > 0){
//                     dataProcess = await sales_finished.aggregate([
//                         {
//                             $match: {
//                                 warehouse_name: warehouse_category,
//                                 date: {
//                                     $gte: transaction_date_from,
//                                     $lte: transaction_date_to
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$sale_product"
//                         },
//                         {
//                             $match: {
//                                 $or: [
//                                     { "sale_product.product_code": item_code }
//                                 ]
//                             }
//                         },
//                         {
//                             $group: {
//                                 _id: "$invoice", // Group by invoice number
//                                 date: { $first: "$date" }, // Get the first date in the group
//                                 warehouse_name: { $first: "$warehouse_name" },
//                                 products: { $push: "$sale_product" } // Collect all products associated with each invoice
//                             }
//                         }
//                     ]);
//                 }else{
//                     dataProcess = await sales_finished.aggregate([
//                         {
//                             $match: {
//                                 warehouse_name: warehouse_category,
//                                 date: {
//                                     $gte: transaction_date_from,
//                                     $lte: transaction_date_to
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$sale_product"
//                         },
//                         {
//                             $group: {
//                                 _id: "$invoice", // Group by invoice number
//                                 date: { $first: "$date" }, // Get the first date in the group
//                                 warehouse_name: { $first: "$warehouse_name" },
//                                 products: { $push: "$sale_product" } // Collect all products associated with each invoice
//                             }
//                         }
//                     ]);
//                 }
//             break;

//             case "AJ":

            
//             // dataProcess = await adjustment_finished.find({
//             //     warehouse : warehouse_category,
//             //     date:{
//             //         $gte: transaction_date_from,
//             //         $lte: transaction_date_to
//             //     }
//             // })


//             // if(item_code.length > 0){
//             //     dataProcess = await sales_finished.aggregate([
//             //         {
//             //             $match: {
//             //                 warehouse_name: warehouse_category,
//             //                 date: {
//             //                     $gte: transaction_date_from,
//             //                     $lte: transaction_date_to
//             //                 }
//             //             }
//             //         },
//             //         {
//             //             $unwind: "$sale_product"
//             //         },
//             //         {
//             //             $match: {
//             //                 $or: [
//             //                     { "sale_product.product_code": item_code }
//             //                 ]
//             //             }
//             //         },
//             //         {
//             //             $group: {
//             //                 _id: "$invoice", // Group by invoice number
//             //                 date: { $first: "$date" }, // Get the first date in the group
//             //                 warehouse_name: { $first: "$warehouse_name" },
//             //                 products: { $push: "$sale_product" } // Collect all products associated with each invoice
//             //             }
//             //         }
//             //     ]);
//             // }else{
//             //     dataProcess = await sales_finished.aggregate([
//             //         {
//             //             $match: {
//             //                 warehouse_name: warehouse_category,
//             //                 date: {
//             //                     $gte: transaction_date_from,
//             //                     $lte: transaction_date_to
//             //                 }
//             //             }
//             //         },
//             //         {
//             //             $unwind: "$sale_product"
//             //         },
//             //         {
//             //             $group: {
//             //                 _id: "$invoice", // Group by invoice number
//             //                 date: { $first: "$date" }, // Get the first date in the group
//             //                 warehouse_name: { $first: "$warehouse_name" },
//             //                 products: { $push: "$sale_product" } // Collect all products associated with each invoice
//             //             }
//             //         }
//             //     ]);
//             // }

//             break;

//             case "TF":
//                 dataProcess = await transfers_finished.find({
//                     warehouse : warehouse_category,
//                     date:{
//                         $gte: transaction_date_from,
//                         $lte: transaction_date_to
//                     }
//                 })


//                 // if(item_code.length > 0){
//                 //     dataProcess = await transfers_finished.aggregate([
//                 //         {
//                 //             $match: {
//                 //                 from_warehouse: warehouse_category,
//                 //                 date: {
//                 //                     $gte: transaction_date_from,
//                 //                     $lte: transaction_date_to
//                 //                 }
//                 //             }
//                 //         },
//                 //         {
//                 //             $unwind: "$product"
//                 //         },
//                 //         {
//                 //             $match: {
//                 //                 $or: [
//                 //                     { "product.product_code": item_code }
//                 //                 ]
//                 //             }
//                 //         },
//                 //         {
//                 //             $group: {
//                 //                 _id: "$invoice", // Group by invoice number
//                 //                 date: { $first: "$date" }, // Get the first date in the group
//                 //                 warehouse_name: { $first: "$from_warehouse" },
//                 //                 products: { $push: "$product" } // Collect all products associated with each invoice
//                 //             }
//                 //         }
//                 //     ]);
//                 // }else{
//                 //     dataProcess = await transfers_finished.aggregate([
//                 //         {
//                 //             $match: {
//                 //                 warehouse_name: warehouse_category,
//                 //                 date: {
//                 //                     $gte: transaction_date_from,
//                 //                     $lte: transaction_date_to
//                 //                 }
//                 //             }
//                 //         },
//                 //         {
//                 //             $unwind: "$sale_product"
//                 //         },
//                 //         {
//                 //             $group: {
//                 //                 _id: "$invoice", // Group by invoice number
//                 //                 date: { $first: "$date" }, // Get the first date in the group
//                 //                 warehouse_name: { $first: "$warehouse_name" },
//                 //                 products: { $push: "$sale_product" } // Collect all products associated with each invoice
//                 //             }
//                 //         }
//                 //     ]);
//                 // }
//             break;
//         }

//     }
    
//     res.json({ data: dataProcess} )

// })


router.post("/reports", auth, async(req, res) => {
    const { product_category, transaction_category, transaction_date_from, transaction_date_to, warehouse_category, item_code} = req.body
console.log(warehouse_category)

if(product_category == "rm"){

  if(warehouse_category == "all"){
          var result = await purchases.aggregate([
            {
              $match: {
                date: {
                    $gte: transaction_date_from,
                    $lte: transaction_date_to
                }
              }
            },
            {
              $lookup: {
                from: "warehouses",
                let: { invoice: "$invoice" },
                pipeline: [
                  {
                    $unwind: "$product_details"
                  },
                  {
                    $match: {
                      $expr: { 
                        $eq: ["$$invoice", "$product_details.invoice"],
                      }
                    }
                  },
                  {
                    $project: {
                      _id: "$product_details._id",
                      product_name: "$product_details.product_name",
                      product_code: "$product_details.product_code",
                      quantity_available: "$product_details.product_stock",
                      warehouse_name: "$name",
                      warehouse_room: "$room",
                      invoice: "$product_details.invoice",
                      production_date: "$product_details.production_date",
                      expiry_date: "$product_details.expiry_date",
                      UOM: "$product_details.unit",
                    }
                  }
                ],
                as: "warehouse_data"
              }
            },
          
          ])
        
        result["data_sales"] = {};
          await Promise.all(result.map( async element => {
            result["data_sales"][element.invoice] = []; 
            await  Promise.all(element.warehouse_data.map( async item => {
              // console.log(item._id.valueOf())
                      const dataSales = await sales.aggregate([
                        {
                          $unwind: "$sale_product"
                        },
                        {
                          $match : {
                            "sale_product.id_transaction_from" : item._id.valueOf(),
                            "sale_product.invoice" : item.invoice,
                          }
                        },
                        {
                          $project: {
                            _id: "$sale_product._id",
                            product_name: "$sale_product.product_name",
                            product_code: "$sale_product.product_code",
                            quantity_available: "$sale_product.quantity",
                            warehouse_name: "$warehouse_name",
                            warehouse_room: "$sale_product.room_name",
                            product_invoice: "$sale_product.invoice",
                            invoice: "$invoice",
                            id_transaction_from: "$sale_product.id_transaction_from",
                            date: "$date",
                            production_date: "$sale_product.production_date",
                            expiry_date: "$sale_product.expiry_date",
                            UOM: "$sale_product.unit",
                          },
                          
                        }
                      ]);
                    if(dataSales.length > 0){
                      result["data_sales"][element.invoice].push(...dataSales)
                    }
            }))
          }));
          result.data_sales = result["data_sales"];
        
        
        
          
        result["data_adjustment"] = {};
        await Promise.all(result.map( async element => {
          result["data_adjustment"][element.invoice] = []; 
          await  Promise.all(element.warehouse_data.map( async item => {
            // console.log(item._id.valueOf())
                    const dataAdjustment = await adjustment.aggregate([
                      {
                        $unwind: "$product"
                      },
                      {
                        $match : {
                          "product.id_transaction_from" : item._id.valueOf(),
                          "product.invoice" : item.invoice,
                        }
                      },
                      {
                        $project: {
                          _id: "$product._id",
                          product_name: "$product.product_name",
                          product_code: "$product.product_code",
                          quantity_available: "$product.new_adjust_qty",
                          warehouse_name: "$warehouse_name",
                          warehouse_room: "$product.room_names",
                          product_invoice: "$product.invoice",
                          invoice: "$invoice",
                          id_transaction_from: "$product.id_transaction_from",
                          date: "$date",
                          production_date: "$product.production_date",
                          expiry_date: "$product.expiry_date",
                          UOM: "$product.unit",
                        },
                        
                      }
                    ]);
                  if(dataAdjustment.length > 0){
                    result["data_adjustment"][element.invoice].push(...dataAdjustment)
                  }
          }))
        }));
        
        
        result["data_transfer"] = {};
        await Promise.all(result.map( async element => {
          result["data_transfer"][element.invoice] = []; 
          await  Promise.all(element.warehouse_data.map( async item => {
            // console.log(item._id.valueOf())
                    const dataTransfer = await transfers.aggregate([
                      {
                        $unwind: "$product"
                      },
                      {
                        $match : {
                          "product.id_transaction_id" : item._id.valueOf(),
                          "product.To_invoice" : item.invoice,
                        }
                      },
                      {
                        $project: {
                          _id: "$product._id",
                          product_name: "$product.product_name",
                          product_code: "$product.product_code",
                          quantity_available: "$product.to_quantity",
                          warehouse_name: "$to_warehouse",
                          warehouse_room: "$product.room_names",
                          product_invoice: "$product.to_room_name",
                          invoice: "$invoice",
                          id_transaction_from: "$product.id_transaction_id",
                          date: "$date",
                          production_date: "$product.production_date",
                          expiry_date: "$product.expiry_date",
                          UOM: "$product.unit",
                        },
                        
                      }
                    ]);
        
        
                    // console.log(dataTransfer)
                  if(dataTransfer.length > 0){
                    result["data_transfer"][element.invoice].push(...dataTransfer)
                  }
          }))
        }));
        
        res.json({purchases_warehouse:result,data_sales: result.data_sales, data_adjustment: result["data_adjustment"], data_transfer: result["data_transfer"] });  
  }else{
          var result = await purchases.aggregate([
            {
              $match: {
                warehouse_name: warehouse_category,
                date: {
                    $gte: transaction_date_from,
                    $lte: transaction_date_to
                }
              }
            },
            {
              $lookup: {
                from: "warehouses",
                let: { invoice: "$invoice" },
                pipeline: [
                  {
                    $unwind: "$product_details"
                  },
                  {
                    $match: {
                      $expr: { $eq: ["$$invoice", "$product_details.invoice"] }
                    }
                  },
                  {
                    $project: {
                      _id: "$product_details._id",
                      product_name: "$product_details.product_name",
                      product_code: "$product_details.product_code",
                      quantity_available: "$product_details.product_stock",
                      warehouse_name: "$name",
                      warehouse_room: "$room",
                      invoice: "$product_details.invoice",
                      production_date: "$product_details.production_date",
                      expiry_date: "$product_details.expiry_date",
                      UOM: "$product_details.unit",
                    }
                  }
                ],
                as: "warehouse_data"
              }
            },
          
          ])
        
        result["data_sales"] = {};
          await Promise.all(result.map( async element => {
            result["data_sales"][element.invoice] = []; 
            await  Promise.all(element.warehouse_data.map( async item => {
              // console.log(item._id.valueOf())
                      const dataSales = await sales.aggregate([
                        {
                          $unwind: "$sale_product"
                        },
                        {
                          $match : {
                            "sale_product.id_transaction_from" : item._id.valueOf(),
                            "sale_product.invoice" : item.invoice,
                          }
                        },
                        {
                          $project: {
                            _id: "$sale_product._id",
                            product_name: "$sale_product.product_name",
                            product_code: "$sale_product.product_code",
                            quantity_available: "$sale_product.quantity",
                            warehouse_name: "$warehouse_name",
                            warehouse_room: "$sale_product.room_name",
                            product_invoice: "$sale_product.invoice",
                            invoice: "$invoice",
                            id_transaction_from: "$sale_product.id_transaction_from",
                            date: "$date",
                            production_date: "$sale_product.production_date",
                            expiry_date: "$sale_product.expiry_date",
                            UOM: "$sale_product.unit",
                          },
                          
                        }
                      ]);
                    if(dataSales.length > 0){
                      result["data_sales"][element.invoice].push(...dataSales)
                    }
            }))
          }));
          result.data_sales = result["data_sales"];
        
        
        
          
        result["data_adjustment"] = {};
        await Promise.all(result.map( async element => {
          result["data_adjustment"][element.invoice] = []; 
          await  Promise.all(element.warehouse_data.map( async item => {
            // console.log(item._id.valueOf())
                    const dataAdjustment = await adjustment.aggregate([
                      {
                        $unwind: "$product"
                      },
                      {
                        $match : {
                          "product.id_transaction_from" : item._id.valueOf(),
                          "product.invoice" : item.invoice,
                        }
                      },
                      {
                        $project: {
                          _id: "$product._id",
                          product_name: "$product.product_name",
                          product_code: "$product.product_code",
                          quantity_available: "$product.new_adjust_qty",
                          warehouse_name: "$warehouse_name",
                          warehouse_room: "$product.room_names",
                          product_invoice: "$product.invoice",
                          invoice: "$invoice",
                          id_transaction_from: "$product.id_transaction_from",
                          date: "$date",
                          production_date: "$product.production_date",
                          expiry_date: "$product.expiry_date",
                          UOM: "$product.unit",
                        },
                        
                      }
                    ]);
                  if(dataAdjustment.length > 0){
                    result["data_adjustment"][element.invoice].push(...dataAdjustment)
                  }
          }))
        }));
        
        
        result["data_transfer"] = {};
        await Promise.all(result.map( async element => {
          result["data_transfer"][element.invoice] = []; 
          await  Promise.all(element.warehouse_data.map( async item => {
            // console.log(item._id.valueOf())
                    const dataTransfer = await transfers.aggregate([
                      {
                        $unwind: "$product"
                      },
                      {
                        $match : {
                          "product.id_transaction_id" : item._id.valueOf(),
                          "product.To_invoice" : item.invoice,
                        }
                      },
                      {
                        $project: {
                          _id: "$product._id",
                          product_name: "$product.product_name",
                          product_code: "$product.product_code",
                          quantity_available: "$product.to_quantity",
                          warehouse_name: "$to_warehouse",
                          warehouse_room: "$product.room_names",
                          product_invoice: "$product.to_room_name",
                          invoice: "$invoice",
                          id_transaction_from: "$product.id_transaction_id",
                          date: "$date",
                          production_date: "$product.production_date",
                          expiry_date: "$product.expiry_date",
                          UOM: "$product.unit",
                        },
                        
                      }
                    ]);
        
        
                    // console.log(dataTransfer)
                  if(dataTransfer.length > 0){
                    result["data_transfer"][element.invoice].push(...dataTransfer)
                  }
          }))
        }));
        
        res.json({purchases_warehouse:result,data_sales: result.data_sales, data_adjustment: result["data_adjustment"], data_transfer: result["data_transfer"] });
  }
    
}else{



  if(warehouse_category == "all"){
    var result = await purchases_finished.aggregate([
      {
        $match: {
          date: {
              $gte: transaction_date_from,
              $lte: transaction_date_to
          }
        }
      },
      {
        $lookup: {
          from: "warehouses",
          let: { invoice: "$invoice" },
          pipeline: [
            {
              $unwind: "$product_details"
            },
            {
              $match: {
                $expr: { $eq: ["$$invoice", "$product_details.invoice"] }
              }
            },
            {
              $project: {
                _id: "$product_details._id",
                product_name: "$product_details.product_name",
                product_code: "$product_details.product_code",
                quantity_available: "$product_details.product_stock",
                warehouse_name: "$name",
                warehouse_room: "$room",
                invoice: "$product_details.invoice",
                production_date: "$product_details.production_date",
                expiry_date: "$product_details.expiry_date",
                UOM: "$product_details.unit",
              }
            }
          ],
          as: "warehouse_data"
        }
      },
    
    ])
  
  result["data_sales"] = {};
    await Promise.all(result.map( async element => {
      result["data_sales"][element.invoice] = []; 
      await  Promise.all(element.warehouse_data.map( async item => {
        // console.log(item._id.valueOf())
                const dataSales = await sales_finished.aggregate([
                  {
                    $unwind: "$sale_product"
                  },
                  {
                    $match : {
                      "sale_product.id_transaction_from" : item._id.valueOf(),
                      "sale_product.invoice" : item.invoice,
                    }
                  },
                  {
                    $project: {
                      _id: "$sale_product._id",
                      product_name: "$sale_product.product_name",
                      product_code: "$sale_product.product_code",
                      quantity_available: "$sale_product.quantity",
                      warehouse_name: "$warehouse_name",
                      warehouse_room: "$sale_product.room_name",
                      product_invoice: "$sale_product.invoice",
                      invoice: "$invoice",
                      id_transaction_from: "$sale_product.id_transaction_from",
                      date: "$date",
                      production_date: "$sale_product.production_date",
                      expiry_date: "$sale_product.expiry_date",
                      UOM: "$sale_product.unit",
                    },
                    
                  }
                ]);
              if(dataSales.length > 0){
                result["data_sales"][element.invoice].push(...dataSales)
              }
      }))
    }));
    result.data_sales = result["data_sales"];
  
  
  
    
  result["data_adjustment"] = {};
  await Promise.all(result.map( async element => {
    result["data_adjustment"][element.invoice] = []; 
    await  Promise.all(element.warehouse_data.map( async item => {
      // console.log(item._id.valueOf())
              const dataAdjustment = await adjustment_finished.aggregate([
                {
                  $unwind: "$product"
                },
                {
                  $match : {
                    "product.id_transaction_from" : item._id.valueOf(),
                    "product.invoice" : item.invoice,
                  }
                },
                {
                  $project: {
                    _id: "$product._id",
                    product_name: "$product.product_name",
                    product_code: "$product.product_code",
                    quantity_available: "$product.new_adjust_qty",
                    warehouse_name: "$warehouse_name",
                    warehouse_room: "$product.room_names",
                    product_invoice: "$product.invoice",
                    invoice: "$invoice",
                    id_transaction_from: "$product.id_transaction_from",
                    date: "$date",
                    production_date: "$product.production_date",
                    expiry_date: "$product.expiry_date",
                    UOM: "$product.unit",
                  },
                  
                }
              ]);
            if(dataAdjustment.length > 0){
              result["data_adjustment"][element.invoice].push(...dataAdjustment)
            }
    }))
  }));
  
  
  result["data_transfer"] = {};
  await Promise.all(result.map( async element => {
    result["data_transfer"][element.invoice] = []; 
    await  Promise.all(element.warehouse_data.map( async item => {
      // console.log(item._id.valueOf())
              const dataTransfer = await transfers_finished.aggregate([
                {
                  $unwind: "$product"
                },
                {
                  $match : {
                    "product.id_transaction" : item._id.valueOf(),
                    "product.from_invoice" : item.invoice,
                  }
                },
                {
                  $project: {
                    _id: "$product._id",
                    product_name: "$product.product_name",
                    product_code: "$product.product_code",
                    quantity_available: "$product.to_quantity",
                    warehouse_name: "$to_warehouse",
                    warehouse_room: "$product.room_names",
                    product_invoice: "$product.to_room_name",
                    invoice: "$invoice",
                    id_transaction_from: "$product.id_transaction",
                    date: "$date",
                    production_date: "$product.production_date",
                    expiry_date: "$product.expiry_date",
                    UOM: "$product.unit",
                  },
                  
                }
              ]);
  
  
              // console.log(dataTransfer)
            if(dataTransfer.length > 0){
              result["data_transfer"][element.invoice].push(...dataTransfer)
            }
    }))
  }));
  res.json({purchases_warehouse:result,data_sales: result.data_sales, data_adjustment: result["data_adjustment"], data_transfer: result["data_transfer"] });

  }else{
    var result = await purchases_finished.aggregate([
      {
        $match: {
          warehouse_name: warehouse_category,
          date: {
              $gte: transaction_date_from,
              $lte: transaction_date_to
          }
        }
      },
      {
        $lookup: {
          from: "warehouses",
          let: { invoice: "$invoice" },
          pipeline: [
            {
              $unwind: "$product_details"
            },
            {
              $match: {
                $expr: { $eq: ["$$invoice", "$product_details.invoice"] }
              }
            },
            {
              $project: {
                _id: "$product_details._id",
                product_name: "$product_details.product_name",
                product_code: "$product_details.product_code",
                quantity_available: "$product_details.product_stock",
                warehouse_name: "$name",
                warehouse_room: "$room",
                invoice: "$product_details.invoice",
                production_date: "$product_details.production_date",
                expiry_date: "$product_details.expiry_date",
                UOM: "$product_details.unit",
              }
            }
          ],
          as: "warehouse_data"
        }
      },
    
    ])
  
  result["data_sales"] = {};
    await Promise.all(result.map( async element => {
      result["data_sales"][element.invoice] = []; 
      await  Promise.all(element.warehouse_data.map( async item => {
        // console.log(item._id.valueOf())
                const dataSales = await sales_finished.aggregate([
                  {
                    $unwind: "$sale_product"
                  },
                  {
                    $match : {
                      "sale_product.id_transaction_from" : item._id.valueOf(),
                      "sale_product.invoice" : item.invoice,
                    }
                  },
                  {
                    $project: {
                      _id: "$sale_product._id",
                      product_name: "$sale_product.product_name",
                      product_code: "$sale_product.product_code",
                      quantity_available: "$sale_product.quantity",
                      warehouse_name: "$warehouse_name",
                      warehouse_room: "$sale_product.room_name",
                      product_invoice: "$sale_product.invoice",
                      invoice: "$invoice",
                      id_transaction_from: "$sale_product.id_transaction_from",
                      date: "$date",
                      production_date: "$sale_product.production_date",
                      expiry_date: "$sale_product.expiry_date",
                      UOM: "$sale_product.unit",
                    },
                    
                  }
                ]);
              if(dataSales.length > 0){
                result["data_sales"][element.invoice].push(...dataSales)
              }
      }))
    }));
    result.data_sales = result["data_sales"];
  
  
  
    
  result["data_adjustment"] = {};
  await Promise.all(result.map( async element => {
    result["data_adjustment"][element.invoice] = []; 
    await  Promise.all(element.warehouse_data.map( async item => {
      // console.log(item._id.valueOf())
              const dataAdjustment = await adjustment_finished.aggregate([
                {
                  $unwind: "$product"
                },
                {
                  $match : {
                    "product.id_transaction_from" : item._id.valueOf(),
                    "product.invoice" : item.invoice,
                  }
                },
                {
                  $project: {
                    _id: "$product._id",
                    product_name: "$product.product_name",
                    product_code: "$product.product_code",
                    quantity_available: "$product.new_adjust_qty",
                    warehouse_name: "$warehouse_name",
                    warehouse_room: "$product.room_names",
                    product_invoice: "$product.invoice",
                    invoice: "$invoice",
                    id_transaction_from: "$product.id_transaction_from",
                    date: "$date",
                    production_date: "$product.production_date",
                    expiry_date: "$product.expiry_date",
                    UOM: "$product.unit",
                  },
                  
                }
              ]);
            if(dataAdjustment.length > 0){
              result["data_adjustment"][element.invoice].push(...dataAdjustment)
            }
    }))
  }));
  
  
  result["data_transfer"] = {};
  await Promise.all(result.map( async element => {
    result["data_transfer"][element.invoice] = []; 
    await  Promise.all(element.warehouse_data.map( async item => {
      // console.log(item._id.valueOf())
              const dataTransfer = await transfers_finished.aggregate([
                {
                  $unwind: "$product"
                },
                {
                  $match : {
                    "product.id_transaction" : item._id.valueOf(),
                    "product.from_invoice" : item.invoice,
                  }
                },
                {
                  $project: {
                    _id: "$product._id",
                    product_name: "$product.product_name",
                    product_code: "$product.product_code",
                    quantity_available: "$product.to_quantity",
                    warehouse_name: "$to_warehouse",
                    warehouse_room: "$product.room_names",
                    product_invoice: "$product.to_room_name",
                    invoice: "$invoice",
                    id_transaction_from: "$product.id_transaction",
                    date: "$date",
                    production_date: "$product.production_date",
                    expiry_date: "$product.expiry_date",
                    UOM: "$product.unit",
                  },
                  
                }
              ]);
  
  
              // console.log(dataTransfer)
            if(dataTransfer.length > 0){
              result["data_transfer"][element.invoice].push(...dataTransfer)
            }
    }))
  }));
  res.json({purchases_warehouse:result,data_sales: result.data_sales, data_adjustment: result["data_adjustment"], data_transfer: result["data_transfer"] });
  }

    
}


})


router.get("/viewdata_inc_fg/:id", auth, async(req, res) => {
    
    try {
        const _id = req.params.id
        var data = await purchases_finished.findById(_id);
        const master = await master_shop.find();


        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})

        if (master[0].language == "English (US)") {
            var lan_data = users.English
        } else if(master[0].language == "Hindi") {
            var lan_data = users.Hindi

        }else if(master[0].language == "German") {
            var lan_data = users.German
        
        }else if(master[0].language == "Spanish") {
            var lan_data = users.Spanish
        
        }else if(master[0].language == "French") {
            var lan_data = users.French
        
        }else if(master[0].language == "Portuguese (BR)") {
            var lan_data = users.Portuguese
        
        }else if(master[0].language == "Chinese") {
            var lan_data = users.Chinese
        
        }else if(master[0].language == "Arabic (ae)") {
            var lan_data = users.Arabic
        }

        res.render("view_table", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            master_shop : master,
            profile : profile_data,
            role : role_data,
            language : lan_data,
            data: data,
        })
     
    } catch (error) {
        res.json(error)
    }
   


     
})

router.get("/viewdata_og_fg/:id", auth, async(req, res) => {
    
    try {
        const _id = req.params.id
        var data = await sales_finished.findById(_id);
        const master = await master_shop.find();


        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})

        if (master[0].language == "English (US)") {
            var lan_data = users.English
        } else if(master[0].language == "Hindi") {
            var lan_data = users.Hindi

        }else if(master[0].language == "German") {
            var lan_data = users.German
        
        }else if(master[0].language == "Spanish") {
            var lan_data = users.Spanish
        
        }else if(master[0].language == "French") {
            var lan_data = users.French
        
        }else if(master[0].language == "Portuguese (BR)") {
            var lan_data = users.Portuguese
        
        }else if(master[0].language == "Chinese") {
            var lan_data = users.Chinese
        
        }else if(master[0].language == "Arabic (ae)") {
            var lan_data = users.Arabic
        }

        res.render("view_og_table", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            master_shop : master,
            profile : profile_data,
            role : role_data,
            language : lan_data,
            data: data,
        })
     
    } catch (error) {
        res.json(error)
    }
   


     
})


router.get("/viewdata_tf_fg/:id", auth, async(req, res) => {
    
    try {
        const _id = req.params.id
        var data = await transfers_finished.findById(_id);
        const master = await master_shop.find();


        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})

        if (master[0].language == "English (US)") {
            var lan_data = users.English
        } else if(master[0].language == "Hindi") {
            var lan_data = users.Hindi

        }else if(master[0].language == "German") {
            var lan_data = users.German
        
        }else if(master[0].language == "Spanish") {
            var lan_data = users.Spanish
        
        }else if(master[0].language == "French") {
            var lan_data = users.French
        
        }else if(master[0].language == "Portuguese (BR)") {
            var lan_data = users.Portuguese
        
        }else if(master[0].language == "Chinese") {
            var lan_data = users.Chinese
        
        }else if(master[0].language == "Arabic (ae)") {
            var lan_data = users.Arabic
        }

        res.render("view_tf_table", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            master_shop : master,
            profile : profile_data,
            role : role_data,
            language : lan_data,
            data: data,
        })
     
    } catch (error) {
        res.json(error)
    }
   


     
})


router.get("/viewFG", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const warehouse_data = await warehouse.aggregate([
            {
                $match: { 
                    "status" : 'Enabled', 
                    "warehouse_category" : "Raw Materials"
                }
            },
            {
                $group: {
                    _id: "$name",
                    name: { $first: "$name"}
                }
            },
        ])

        // res.json(warehouse_data)

        if (master[0].language == "English (US)") {
            var lan_data = users.English
        } else if(master[0].language == "Hindi") {
            var lan_data = users.Hindi

        }else if(master[0].language == "German") {
            var lan_data = users.German
        
        }else if(master[0].language == "Spanish") {
            var lan_data = users.Spanish
        
        }else if(master[0].language == "French") {
            var lan_data = users.French
        
        }else if(master[0].language == "Portuguese (BR)") {
            var lan_data = users.Portuguese
        
        }else if(master[0].language == "Chinese") {
            var lan_data = users.Chinese
        
        }else if(master[0].language == "Arabic (ae)") {
            var lan_data = users.Arabic
        }

        res.render("transaction_finished_raw", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            dataProcess: warehouse_data,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})




module.exports = router;