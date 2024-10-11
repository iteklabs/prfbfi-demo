const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, suppliers_payment, s_payment_data, email_settings, supervisor_settings, purchases_finished, sales_finished, adjustment_finished, transfers, transfers_finished, sales, adjustment } = require("../../models/all_models");

router.get("/negative", async (req, res) => {
    try {

        // const warehouse_data = await warehouse.aggregate([
        //     { $unwind: '$product_details' },
        //     {
        //       $match: {
        //         'product_details.product_stock': { $lt: 0 }
        //       }
        //     }
        //   ]);

        // const warehouse_data = await warehouse.aggregate([
        //     {
        //       $unwind: '$product_details'
        //     },
        //     {
        //       $match: {
        //         'product_details.product_stock': { $lt: 0 }
        //       }
        //     },
        //     {
        //       $group: {
        //         _id: { name: '$name', room: '$room' },
        //         products: { $push: '$product_details' }
        //       }
        //     }
        //   ]);


          const result = await warehouse.updateMany(
            { "product_details.product_stock": { $lt: 0 } }, // Filter documents where product_stock is negative
            { $mul: { "product_details.$[elem].product_stock": -1 } }, // Multiply product_stock by -1
            { arrayFilters: [{ "elem.product_stock": { $lt: 0 } }] } // Array filters to update nested array elements
          );


          res.json({status : `${result.modifiedCount} documents updated`})
        
    } catch (error) {
        console.log("table page", error);
        res.status(200).json({ message: error.message })
    }
})


router.get("/checking", async (req, res) => {
  try {

      // const warehouse_data = await warehouse.aggregate([
      //     { $unwind: '$product_details' },
      //     {
      //       $match: {
      //         'product_details.product_stock': { $lt: 0 }
      //       }
      //     }
      //   ]);

      const warehouse_data = await warehouse.aggregate([
          {
            $unwind: '$product_details'
          },
          {
            $match: {
              'product_details.invoice': "INCF-52068316",
              'product_details.primary_code' : '14800005047429'
            }
          },
          {
            $group: {
              _id: { name: '$name', room: '$room' },
              products: { $push: '$product_details' }
            }
          }
        ]);


  


        res.json(warehouse_data)
      
  } catch (error) {
      console.log("table page", error);
      res.status(200).json({ message: error.message })
  }
})


router.get("/warehouse_monitor", async (req, res) => {


  res.render("monitor", {
      success: req.flash('success'),
      errors: req.flash('errors')
  })
})




router.get("/join", async (req, res) => {

  // const result = await purchases_finished.aggregate([
  //   {
  
  //       $match : {
  //         invoice : "INCF-35479652"
  //       }

  //   },
  //   {
  //     $unwind: "$product"
  //   },
  //   {
  //       $lookup:{
  //           from: "warehouses",       // other table name
  //           localField: "userId",   // name of users table field
  //           foreignField: "userId", // name of userinfo table field
  //           as: "user_info"         // alias for userinfo table
  //       }
  //   },
  //   {   $unwind:"$user_info" },     // $unwind used for getting data in object or for one record only

    
  // ])
//original
  // const result = await purchases_finished.aggregate([
  //   {
  //     $match: {
  //       invoice: "INCF-69565374" // Specify the invoice you want to filter by
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: "warehouses",
  //       let: { invoice: "$invoice" },
  //       pipeline: [
  //         {
  //           $unwind: "$product_details"
  //         },
  //         {
  //           $match: {
  //             $expr: { $eq: ["$$invoice", "$product_details.invoice"] }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: "$product_details._id",
  //             product_name: "$product_details.product_name",
  //             product_code: "$product_details.product_code",
  //             quantity_purchased: "$product.quantity",
  //             quantity_available: "$product_details.product_stock",
  //             warehouse_name: "$name",
  //             warehouse_address: "$address"
  //           }
  //         }
  //       ],
  //       as: "warehouse_data"
  //     }
  //   }
  // ])

  // res.json(result)

// result.forEach((element, a) => {
    
//       element.product.forEach( async (dataproduct, b) => {
//         const warehouseName = element.warehouse_name;
//         const warehouse_room = dataproduct.room_name;
//         const warehouse_Invoice = dataproduct.invoice;
//         const primary_code_purchases = dataproduct.primary_code;
//         if(b == 1){
//           warehouse_data = await warehouse.aggregate([
//             {
//               $match : {
//                 name : warehouseName,
//                 room: warehouse_room
//               }
//             },
//             {
//               $unwind: "$product_details"
//             },
//             {
//               $match : {
//                 "product_details.invoice" : warehouse_Invoice,
//                 "product_details.primary_code" : primary_code_purchases
//               }
//             }
//           ])

//           console.log(warehouse_data)
//         }
        
//       })
//   });



// const result = await purchases_finished.aggregate([

//     {
//         $match: {
//             invoice: "INCF-89085235" // Specify the invoice you want to filter by
//         }
//     },
//     {
//         $lookup: {
//             from: "warehouses",
//             let: { invoice: "$invoice" },
//             pipeline: [
//                 {
//                     $unwind: "$product_details"
//                 },
//                 {
//                     $match: {
//                         $expr: { $eq: ["$$invoice", "$product_details.invoice"] }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: "$product_details._id",
//                         product_name: "$product_details.product_name",
//                         product_code: "$product_details.product_code",
//                         quantity_purchased: "$product.quantity",
//                         quantity_available: "$product_details.product_stock",
//                         warehouse_name: "$name",
//                         warehouse_address: "$address",
//                         warehouseiinvoice: "$product_details.invoice"
//                     }
//                 }
//             ],
//             as: "warehouse_data"
//         }
//     },
//     {
//         $lookup: {
//             from: "sales_finisheds",
//             let: { idTransactionFrom: "$warehouse_data._id" },
//             pipeline: [
//                 {
//                     $unwind: "$sale_product"
//                 },
//                 {
//                     $match: {
//                         $expr: { $eq: ["$$idTransactionFrom", "$sale_product.id_transaction_from"] }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: "$sale_product._id",
//                         product_name: "$sale_product.product_name",
//                         quantity: "$sale_product.quantity",
//                         stock: "$sale_product.stock",
//                         primary_code: "$sale_product.primary_code",
//                         secondary_code: "$sale_product.secondary_code",
//                         product_code: "$sale_product.product_code",
//                         bay: "$sale_product.bay",
//                         unit: "$sale_product.unit",
//                         secondary_unit: "$sale_product.secondary_unit",
//                         batch_code: "$sale_product.batch_code",
//                         expiry_date: "$sale_product.expiry_date",
//                         production_date: "$sale_product.production_date",
//                         maxperunit: "$sale_product.maxperunit",
//                         prod_cat: "$sale_product.prod_cat",
//                         room_name: "$sale_product.room_name",
//                         invoice: "$sale_product.invoice",
//                     }
//                 }
//             ],
//             as: "sales_data"
//         }
//     }
  
// ]);


// const result = await purchases_finished.aggregate([
//   {
//       $match: {
//           invoice: "INCF-89085235" // Specify the invoice you want to filter by
//       }
//   },
//   {
//       $lookup: {
//           from: "warehouses",
//           let: { invoice: "$invoice" },
//           pipeline: [
//               {
//                   $unwind: "$product_details"
//               },
//               {
//                   $match: {
//                       $expr: { $eq: ["$$invoice", "$product_details.invoice"] }
//                   }
//               },
//               {
//                   $project: {
//                       _id: "$product_details._id",
//                       product_name: "$product_details.product_name",
//                       product_code: "$product_details.product_code",
//                       quantity_purchased: "$product.quantity",
//                       quantity_available: "$product_details.product_stock",
//                       warehouse_name: "$name",
//                       warehouse_address: "$address",
//                       warehouseiinvoice: "$product_details.invoice"
//                   }
//               }
//           ],
//           as: "warehouse_data"
//       }
//   },
//   {
//       $unwind: "$warehouse_data"
//   },
//   {
//       $lookup: {
//           from: "sales_finisheds",
//           let: { idTransactionFrom: "$warehouse_data._id" },
//           pipeline: [
//               {
//                   $unwind: "$sale_product"
//               },
//               {
//                   $match: {
//                       $expr: { $eq: ["$$idTransactionFrom", "$sale_product.id_transaction_from"] }
//                   }
//               },
//               {
//                   $project: {
//                       _id: "$sale_product._id",
//                       product_name: "$sale_product.product_name",
//                       quantity: "$sale_product.quantity",
//                       stock: "$sale_product.stock",
//                       primary_code: "$sale_product.primary_code",
//                       secondary_code: "$sale_product.secondary_code",
//                       product_code: "$sale_product.product_code",
//                       bay: "$sale_product.bay",
//                       unit: "$sale_product.unit",
//                       secondary_unit: "$sale_product.secondary_unit",
//                       batch_code: "$sale_product.batch_code",
//                       expiry_date: "$sale_product.expiry_date",
//                       production_date: "$sale_product.production_date",
//                       maxperunit: "$sale_product.maxperunit",
//                       prod_cat: "$sale_product.prod_cat",
//                       room_name: "$sale_product.room_name",
//                       invoice: "$sale_product.invoice",
//                       idTransactionFrom: "$sale_product.id_transaction_from", // Include idTransactionFrom field
//                       idTransactionFromValue: "$$idTransactionFrom" // Include the value of $$idTransactionFrom
//                   }
//               }
//           ],
//           as: "sales_data"
//       }
//   }
// ]);


// res.json(result)

//     const result = await purchases_finished.aggregate([
//           {
//               $match: {
//                   invoice: "" // Specify the invoice you want to filter by
//               }
//           },
//     ]);
//     // const result = await purchases_finished.find();
//     // console.log(result.length)
//     // res.json(result)
//     let warehouse_data = [];
//     await Promise.all(result.map(async element => {
//         await Promise.all(element.product.map(async item => {
//             const datawarehouse = await warehouse.aggregate([
//                 {
//                   $match : {
//                     "name" : element.warehouse_name,
//                     "room" : item.room_name
//                   }
//                 },
//                 {
//                   $unwind: "$product_details"
//                 },
//                 {
//                   $match : {
//                     "product_details.invoice" : item.invoice,
//                     "product_details.id_incoming": item._id.valueOf()
//                   }
//                 }
//             ]);
//             warehouse_data.push(datawarehouse);
//         }));
//     }));

//     let sales_data = [];
//     await Promise.all(warehouse_data.map(async element => {
//       await  Promise.all(element.map(async data => {
//         // console.log(data.product_details.invoice)


//         const dataSales = await sales_finished.aggregate([
//                 {
//                   $unwind: "$sale_product"
//                 },
//                 {
//                   $match : {
//                     "sale_product.id_transaction_from" : data.product_details._id.valueOf(),
//                     "sale_product.invoice" : data.product_details.invoice,
//                   }
//                 }
//             ]);

//             // console.log(dataSales.length)
//             if(dataSales.length > 0){
//               sales_data.push(dataSales);
//             }
            
//       }))
      
//   }));



//   // let adjustment_data = [];
//   //   await Promise.all(warehouse_data.map(async element => {
//   //     await  Promise.all(element.map(async data => {
//   //       console.log(data.product_details.invoice)


//   //       const dataAdjustment = await adjustment_finished.aggregate([
//   //               {
//   //                 $unwind: "$sale_product"
//   //               },
//   //               {
//   //                 $match : {
//   //                   "sale_product.id_transaction_from" : data.product_details._id.valueOf(),
//   //                   "sale_product.invoice" : data.product_details.invoice,
//   //                 }
//   //               }
//   //           ]);

//   //           // console.log(dataAdjustment.length)
//   //           if(dataAdjustment.length > 0){
//   //             adjustment_data.push(dataAdjustment);
//   //           }
            
//   //     }))
      
//   // }));


//   let transfer_data = [];
//   await Promise.all(warehouse_data.map(async element => {
//     await  Promise.all(element.map(async data => {
//       console.log(data.product_details.invoice + " <> " + data.product_details._id.valueOf() )


//       const dataTransfer = await transfers_finished.aggregate([
//               {
//                 $unwind: "$product"
//               },
//               {
//                 $match : {
//                   "product.from_invoice" : data.product_details.invoice,
//                   "product.id_transaction" : data.product_details._id.valueOf(),
//                 }
//               }
//           ]);

//           // console.log(dataTransfer.length)
//           if(dataTransfer.length > 0){
//             transfer_data.push(dataTransfer);
//           }
          
//     }))
    
// }));
// const result = await purchases_finished.find();
// INCF-98097873
// let warehouse_data = [];
//     await Promise.all(result.map(async element => {

//       await Promise.all(element.product.map(async item => {
//             const datawarehouse = await warehouse.aggregate([
//                 {
//                   $match : {
//                     "name" : element.warehouse_name,
//                     "room" : item.room_name
//                   }
//                 },
//                 {
//                   $unwind: "$product_details"
//                 },
//                 {
//                   $match : {
//                     "product_details.invoice" : item.invoice,
//                     "product_details.id_incoming": item._id.valueOf()
//                   }
//                 }
//             ]);
            
//             // console.log(datawarehouse.length)
//             if(datawarehouse.length > 0){
//               warehouse_data.push(datawarehouse);
//             }
            
//         }));
        
//     }));



    //     let sales_data = [];
    // await Promise.all(warehouse_data.map(async element => {
      
    //   await  Promise.all(element.map(async data => {
    //     // console.log(data.product_details.invoice)
    //     // console.log(data)

    //     const dataSales = await sales_finished.aggregate([
    //             {
    //               $unwind: "$sale_product"
    //             },
    //             {
    //               $match : {
    //                 "sale_product.id_transaction_from" : data.product_details._id.valueOf(),
    //                 "sale_product.invoice" : data.product_details.invoice,
    //               }
    //             }
    //         ]);

    //         // console.log(dataSales.length)
    //         if(dataSales.length > 0){
    //           sales_data.push(dataSales);
    //         }
            
    //   }))
      
    // }));
   
  // res.json(sales_data)

    // res.json({ purchases: result, warehouse: warehouse_data, sales_data: sales_data, transfers_data: transfer_data})
    // res.json({ purchases: result, warehouse: warehouse_data, sales_data: sales_data, transfers_data: transfer_data})



// 



  // const result = await purchases.aggregate([
  //   {
  //     $match: {
  //       invoice: "INC-70496426" // Specify the invoice you want to filter by
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: "warehouses",
  //       let: { invoice: "$invoice" },
  //       pipeline: [
  //         {
  //           $unwind: "$product_details"
  //         },
  //         {
  //           $match: {
  //             $expr: { $eq: ["$$invoice", "$product_details.invoice"] }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: "$product_details._id",
  //             product_name: "$product_details.product_name",
  //             product_code: "$product_details.product_code",
  //             quantity_purchased: "$product.quantity",
  //             quantity_available: "$product_details.product_stock",
  //             warehouse_name: "$name",
  //             warehouse_room: "$room"
  //           }
  //         }
  //       ],
  //       as: "warehouse_data"
  //     }
  //   },
  //   // {
  //   //   $unwind :"$warehouse_data"
  //   // },
  //   {
  //     $lookup: {
  //       from: "sales",
        
  //       pipeline: [
  //         {
  //           $unwind: "$sale_product"
  //         },
  //         {
  //           $unwind :"$warehouse_data"
  //         },
  //         {
  //           $addFields: {
  //             product_id: "$warehouse_data._id"
  //           }
  //         },
  //         // {
  //         //   $match: {
  //         //     $expr: { $eq: ["$$product_id", "$sale_product.id_transaction_from"] }
  //         //   }
  //         // },
  //         {
  //           $project: {
  //             _id: "$sale_product._id",
  //             product_name: "$sale_product.product_name",
  //             product_code: "$sale_product.product_code",
  //             quantity_purchased: "$sale_product.primary_code",
  //             quantity_available: "$sale_product.quantity",
  //             warehouse_name: "$name",
  //             warehouse_room: "$room",
  //             TEST_TEST: "$product_id",
  //             from_id: "$sale_product.id_transaction_from"

  //           }
  //         }
  //       ],
  //       as: "sales_data"
  //     }
  //   }
  // ])


  var result = await purchases.aggregate([
    // {
    //   $match: {
    //     invoice: "INC-12019245" // Specify the invoice you want to filter by
    //   }
    // },
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
              invoice: "$product_details.invoice"
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
                    id_transaction_from: "$sale_product.id_transaction_from"
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
                  id_transaction_from: "$product.id_transaction_from"
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
                  id_transaction_id: "$product.id_transaction_id"
                },
                
              }
            ]);


            console.log(dataTransfer)
          if(dataTransfer.length > 0){
            result["data_transfer"][element.invoice].push(...dataTransfer)
          }
  }))
}));
  // res.json(result["data_transfer"]);
  res.json({purchases_warehouse:result,data_sales: result.data_sales, data_adjustment: result["data_adjustment"], data_transfer: result["data_transfer"] });

})


module.exports = router;