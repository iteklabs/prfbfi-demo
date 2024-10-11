const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, suppliers_payment, s_payment_data, email_settings, supervisor_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
const nodemailer = require('nodemailer');
var ejs = require('ejs');
const path = require("path");
const users = require("../public/language/languages.json");

router.post("/view", async (req, res) => {
    try {
        const { warehouse_category } = req.body;
        if( warehouse_category == "RM"){

          const warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled',
                        "warehouse_category": "Raw Materials",
                        "name": { $ne: "Return Goods" }
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ]);
            res.json(warehouse_data)
        }else{
            const warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled',
                        "warehouse_category": "Finished Goods",
                        "name": { $ne: "Return Goods" }
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ]);
            res.json(warehouse_data)
        }
        
    } catch (error) {
        console.log("table page", error);
        res.status(200).json({ message: error.message })
    }
})


router.post("/supplier", async (req, res) => {
    try {
        
        const suppliers_data = await suppliers.find({});
        res.status(200).json(suppliers_data)
    } catch (error) {
        console.log("table page", error);
        res.status(200).json({ message: error.message })
    }
})


router.post("/room", async (req, res) => {
    try {

        const { wahouse_data } = req.body
         
        const include = [
            {
                $match: { 
                    "name": wahouse_data,
                    "status" : 'Enabled',
              
                }
            },
            {
                $group: {
                    _id: "$_id",
                    room_name: { $first: "$room"}
                }
            },
            {
              $sort: {
                  room_name: 1 // 1 for ascending order, -1 for descending order
              }
          }
        ]
        const warehouse_data = await warehouse.aggregate(include)
        res.status(200).json(warehouse_data)
    } catch (error) {
        console.log("table page", error);
        res.status(200).json({ message: error.message })
    }
})


router.post("/invoice", async (req, res) => {
    try {
        const min = 10000000;
        const max = 99999999; 
        
        const random = Math.floor(Math.random() * (max - min + 1)) + min;
        var IDInvoice;


        const new_purchase = await purchases.findOne({ invoice: "INC-"+random });
        if (new_purchase && new_purchase.length > 0) {
            IDInvoice = "INC-"+random;
        }else{
            IDInvoice = "INC-"+random; 
        }


        res.json({ incoming_invoice: IDInvoice})
        return IDInvoice ;
       
    } catch (error) {
        console.log("table page", error);
        res.status(200).json({ message: error.message })
    }
})



module.exports = router;