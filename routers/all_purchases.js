const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, suppliers_payment, s_payment_data, email_settings, supervisor_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
const nodemailer = require('nodemailer');
var ejs = require('ejs');
const path = require("path");
const users = require("../public/language/languages.json");

router.get("/view", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})
        const staff_data = await staff.findOne({ email: role_data.email })
        // res.status(200).json(role_data)
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
        }
        
        const master = await master_shop.find()
      
        let purchases_data
    if(role_data.role == "staff"){
        const staff_data = await staff.findOne({ email: role_data.email })

         purchases_data = await purchases.aggregate([
            {
              $match: {
                "warehouse_name": staff_data.warehouse
              }
            },
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
                room: { $first: "$room" },
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
              }
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
                floorlevel:1
              }
            }
          ]);

    }else{
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
           }
      ]);
// res.json(purchases_data)

    }

    // res.status(200).json(purchases_data)
        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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
        
        res.render("all_purchases", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            purchases: purchases_data,
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data
        })
    } catch (error) {
        console.log("table page", error);
        res.status(200).json({ message: error.message })
    }
})

function BayBinSelected(warehouse, room){

    var levels = [];
    var Isle = [];
    var type = [];
    var rack = [];
    var storage = [];
    var rak = [];
    let outputArray = [];
    if(warehouse == "DRY STORAGE"){
        switch(room){
            case "Rack A":
            levels = [1, 2, 3, 4, 5, 6, 7, 8];
            Isle = [1,2]; 
            rack = [1,2,3,4,5]
            type = ["Level", "Floor"];
            storage = ["D"];
            rak = ["A"];
            break;
            case "Rack B":
            levels = [6,5,4,3,2,1];
            Isle = [1,2]; 
            rack = [1,2,3,4,5]
            type = ["Level", "Floor"];
            storage = ["D"];
            rak = ["B"];
            break;
            case "Shelves":
            levels = [0];
            Isle = [0]; 
            rack = [1,2,3,4,5]
            type = ["Floor"];
            storage = ["D"];
            rak = ["S"];
            break;
            case "Receiving Area":
            levels = [0];
            Isle = [0]; 
            rack = [1,2,3,4,5,6, 7,8,9,10,11,12,13,14,15,16];
            type = ["Floor"];
            storage = ["D"];
            rak = ["R"];
            break;
        }
        
    }else if(warehouse == "COLD STORAGE"){
        switch(room){
            case "Rack A":
            levels = [1, 2, 3, 4, 5, 6, 7];
            Isle = ["B", "F"]; 
            rack = [1,2,3,4,5]
            type = ["Level", "Floor"];
            storage = ["C"];
            rak = ["A"];
            break;
            case "Rack B":
            levels = [5,4,3,2,1];
            Isle = ["F", "B", "S"]; 
            rack = [1,2,3,4,5]
            type = ["Level", "Floor"];
            storage = ["C"];
            rak = ["B"];
            break;
            case "Rack C":
            levels = [1,2,3,4,5];
            Isle = ["B", "F", "S"]; 
            rack = [5,4,3,2,1]
            type = ["Level", "Floor"];
            storage = ["C"];
            rak = ["C"];
            break;
            case "Rack D":
            levels = [5,4,3,2,1];
            Isle = ["F", "B", "S"]; 
            rack = [1,2,3,4,5];
            type = ["Level", "Floor"];
            storage = ["C"];
            rak = ["D"];
            break;
            case "Rack E":
            levels = [4,3,2,1];
            Isle = [1,2]; 
            rack = [1,2,3,4,5];
            type = ["Level", "Floor"];
            storage = ["C"];
            rak = ["E"];
            break;

            case "Rack F":
            levels = [1,2,3];
            Isle = [1,2]; 
            rack = [1,2,3,4,5];
            type = ["Level"];
            storage = ["C"];
            rak = ["F"];
            break;
        }
    }
    return { levels, Isle, rack, type, storage, rak };
}
// ========= Add Purchase ========== //
async function getRandom8DigitNumber() {
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
    return IDInvoice ;
}

router.get("/view/add_purchases", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        // console.log("master" , master);
        const staff_data = await staff.findOne({ email: role_data.email })
        const suppliers_data = await suppliers.find({});

        
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        "name": staff_data.warehouse,
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
            ])
        }else{
            // warehouse_data = await warehouse.find({status : 'Enabled'});
            warehouse_data = await warehouse.aggregate([
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
            ])
        }
        
        
        const product_data = await product.find({});
        const find_data = await warehouse.find({status : 'Enabled'});
        const purchases_data = await purchases.find({})
        const invoice_noint = purchases_data.length + 1
        const invoice_no = "INC-" + invoice_noint.toString().padStart(5, "0")
        var rooms_data = ["Ambient", "Enclosed"];
        if (master[0].language == "English (US)") {
            var lan_data = users.English
            // console.log(lan_data);
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
        const randominv = getRandom8DigitNumber();

        randominv.then(invoicedata => {
            res.render("add_purchases", {
                success: req.flash('success'),
                errors: req.flash('errors'),
                role : role_data,
                profile : profile_data,
                suppliers: suppliers_data,
                warehouse: warehouse_data,
                product: product_data,
                invoice: invoicedata,
                master_shop : master,
                language : lan_data,
                find_data,
                rooms_data
            })
        }).catch(error => {
            req.flash('errors', `There's a error in this transaction`)
            res.redirect("/all_purchases/view");
        })
    } catch (error) {
        console.log(error);
    }
})


router.get("/view/add_purchases/:id", auth, async (req, res) => {
    try {
        const product_name = req.params.id
        console.log(product_name);

        const master = await master_shop.find()
        console.log("master" , master);

        const product_data = await product.findOne({name : product_name})
        console.log("product", product_data);
    
        res.status(200).json({product_data, master})
    } catch (error) {
        console.log("add_purchases error", error);
    }
})

    
router.post("/view/add_purchases", auth, async (req, res) => {
    try {
        
        const { invoice, date, warehouse_name, prod_name, prod_code, prod_qty, prod_unit, prod_secondunit, prod_level, prod_isle, prod_pallet, note, expiry_date, batch_code,payable, due_amount, Room_name, primary_code, secondary_code, MaxStocks_data, PO_number, SCRN, JO_number } = req.body
               
        // res.status(200).json(req.body)
        // return

        
        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            var proudct_code_array = [req.body.prod_code]
            var quantity_array = [req.body.prod_Qty]
            var prod_unit_array =  [req.body.prod_primunit]
            var prod_secondunit_array = [req.body.prod_secondunit]
            var prod_level_array = [req.body.prod_level]
            // var prod_isle_array = [req.body.prod_isle]
            // var type_array = [req.body.type]
            // var prod_pallet_array = [req.body.prod_pallet]
            var prod_primaryCode_array = [req.body.primary_code]
            var prod_SecondaryyCode_array = [req.body.secondary_code]
            var MaxStocks_data_aray = [req.body.MaxStocks_data]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            // var storage_array = [req.body.storage]
            // var rak_array = [req.body.rak]
            var max_product_unit_array = [req.body.max_product_unit]
            var alertQTY_array = [req.body.alertQTY]


            var production_date_array = [req.body.production_date]

            var prod_cat_array = [req.body.prod_cat]

            var room_name_array = [req.body.RoomAssign]
            var deliverycode_array = [req.body.deliverycode]
            var prod_invoice_array = [req.body.prod_invoice]
            var actual_qty_array = [req.body.actual_qty]
            var actual_uom_array = [req.body.actual_uom]
            
            
            
        }else{
            var product_name_array = [...req.body.prod_name]
            var proudct_code_array = [...req.body.prod_code]
            var quantity_array = [...req.body.prod_Qty]
            var prod_unit_array =  [...req.body.prod_primunit]
            var prod_secondunit_array = [...req.body.prod_secondunit]
            var prod_level_array = [...req.body.prod_level]
            // var prod_isle_array = [...req.body.prod_isle]
            // var type_array = [...req.body.type]
            // var prod_pallet_array = [...req.body.prod_pallet]
            var prod_primaryCode_array = [...req.body.primary_code]
            var prod_SecondaryyCode_array = [...req.body.secondary_code]
            var MaxStocks_data_aray = [...req.body.MaxStocks_data]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
            // var storage_array = [...req.body.storage]
            // var rak_array = [...req.body.rak]
            var max_product_unit_array = [...req.body.max_product_unit]
            var alertQTY_array = [...req.body.alertQTY]

            var production_date_array = [...req.body.production_date]
            var prod_cat_array = [...req.body.prod_cat]
            var room_name_array = [...req.body.RoomAssign]
            var deliverycode_array = [...req.body.deliverycode]
            var prod_invoice_array = [...req.body.prod_invoice]
            var actual_qty_array = [...req.body.actual_qty]
            var actual_uom_array = [...req.body.actual_uom]

          
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
        
        actual_qty_array.forEach((value, i) => {
            newproduct[i].actual_qty =  Math.abs(value)
        })
        actual_uom_array.forEach((value, i) => {
            newproduct[i].actual_uom = value
        })


        

        proudct_code_array.forEach((value,i) => {
            newproduct[i].product_code = value
            newproduct[i].date_data = date
        });
        
        
        quantity_array.forEach((value,i) => {
            newproduct[i].quantity = Math.abs(value)
        });
        
        prod_unit_array.forEach((value, i) => {
            newproduct[i].standard_unit = value
        })
        
        prod_secondunit_array.forEach((value, i) => {
            newproduct[i].secondary_unit = value
        })


        

                prod_level_array.forEach((value, i) => {
                    room_name_array.forEach((valueRoom, a) => {

                        if(valueRoom == "Receiving Area" && i == a){
                            
                            console.log(valueRoom + " < wew > " + i + " <> " + a + " <> " + value)
                            var resultValueFloorLevel = value.slice(3);
                            newproduct[i].storage = value[0]
                            newproduct[i].rack = value[1]
                            newproduct[i].bay = 0
                            newproduct[i].bin = 0
                            newproduct[i].type = "Floor"
                            newproduct[i].floorlevel = resultValueFloorLevel
                        }else if(valueRoom == "Shelves" && i == a){
                            var resultValueFloorLevel = value.slice(3);
                            newproduct[i].storage = value[0]
                            newproduct[i].rack = value[1]
                            newproduct[i].bay = 0
                            newproduct[i].bin = 0
                            newproduct[i].type = "Floor"
                            newproduct[i].floorlevel = value[5]
                        }else if(i == a){

                            if(value[0] == "A" && value[1] == "L" && value[2] == "L"){
                                console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value + "here")

                                newproduct[i].storage = value[0]
                                newproduct[i].rack = value[1]
                                newproduct[i].bay = 0
                                newproduct[i].bin = 0
                                newproduct[i].type = "Floor"
                                newproduct[i].floorlevel = value[3]

                            }else{
                                var valData;
                                if(value[4] == "L"){
                                    valData = "Level";
                                }else if(value[4] == "F"){
                                    valData = "Floor";
                                }

                                
                                newproduct[i].storage = value[0]
                                newproduct[i].rack = value[1]
                                newproduct[i].bay = value[2]
                                newproduct[i].bin = value[3]
                                newproduct[i].type = valData
                                newproduct[i].floorlevel = value[5]
                            }
                            
                        }
            
                    })
                })
   
         prod_primaryCode_array.forEach((value, i) => {
            newproduct[i].primary_code = value
        })
        
         prod_SecondaryyCode_array.forEach((value, i) => {
            newproduct[i].secondary_code = value
        })


        MaxStocks_data_aray.forEach((value, i) => {
            newproduct[i].maxStocks = value
        })

        batch_code_array.forEach((value, i) => {
            newproduct[i].batch_code = value
        })


        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })


        max_product_unit_array.forEach((value, i) => {
            newproduct[i].maxperunit = value
        })


        alertQTY_array.forEach((value, i) => {
            newproduct[i].alertQTY = value
        })
        

        production_date_array.forEach((value, i) => {
            newproduct[i].production_date = value
        })


        prod_cat_array.forEach((value, i) => {
            newproduct[i].product_cat = value
        })

        room_name_array.forEach((value, i) => {
            newproduct[i].room_name = value
        })

        deliverycode_array.forEach((value, i) => {
            newproduct[i].delivery_code = value
        })

        prod_invoice_array.forEach((value, i) => {
            newproduct[i].invoice = value
        })

        

        const RoomListAll = room_name_array.map((value)=>{
            
            return  value  = {
                      room_name : value,
                    }   
        })

        
        



        // res.json(newproduct)
        // return


        const Newnewproduct = newproduct.filter(obj => obj.quantity !== "0" && obj.quantity !== "");

        
        const data = new purchases({ invoice, suppliers:req.body.suppliers, date, warehouse_name, product:Newnewproduct, note, due_amount, POnumber: PO_number, SCRN, JO_number, roomList: RoomListAll })
        const purchases_data = await data.save()
  
        //   res.json(purchases_data)
        // return
        
        const new_purchase = await purchases.findOne({ invoice: invoice });
       
            
            // var warehouse_data;
            // new_purchase.product.forEach( async product_details => {
                
            //     var warehouse_data = await warehouse.findOne({ name: warehouse_name, room: product_details.room_name });
            //     var x = 0;
            //     const match_data = warehouse_data.product_details.map((data) => {
            //         if (data.product_name == product_details.product_name && 
            //             data.floorlevel == product_details.floorlevel && 
            //             data.type == product_details.type && 
            //             data.bin == product_details.bin && 
            //             data.bay == product_details.bay && 
            //             data.rack == product_details.rack && 
            //             data.storage == product_details.storage && 
            //             data.expiry_date == product_details.expiry_date && 
            //             data.batch_code == product_details.batch_code && 
            //             data.production_date == product_details.production_date 
            //             ) {
            //             data.product_stock = data.product_stock + product_details.quantity
            //             x++
            //         }
    
            //     })
    
            //     if (x == "0") {
            //         warehouse_data.product_details = warehouse_data.product_details.concat({ 
            //             product_name: product_details.product_name, 
            //             product_stock: product_details.quantity, 
            //             primary_code: product_details.primary_code, 
            //             secondary_code: product_details.secondary_code, 
            //             product_code: product_details.product_code,
            //             storage: product_details.storage, 
            //             rack: product_details.rack, 
            //             bay: product_details.bay,  
            //             bin: product_details.bin, 
            //             type: product_details.type, 
            //             floorlevel: product_details.floorlevel, 
            //             maxProducts: product_details.maxStocks, 
            //             unit: product_details.standard_unit, 
            //             secondary_unit: product_details.secondary_unit, 
            //             expiry_date: product_details.expiry_date, 
            //             maxPerUnit: product_details.maxperunit,
            //             batch_code: product_details.batch_code,
            //             alertQTY: product_details.alertQTY,
            //             production_date: product_details.production_date,
            //             product_cat: product_details.product_cat
            //         })
            //     }
            //     // console.log("final", warehouse_data);
            // })
            

            const promises = new_purchase.product.map(async (product_details) => {
                var warehouse_data = await warehouse.findOne({ name: warehouse_name, room: product_details.room_name });
                var x = 0;
                warehouse_data.product_details.forEach((data) => {
                    if (data.product_name == product_details.product_name && 
                        data.floorlevel == product_details.floorlevel && 
                        data.type == product_details.type && 
                        data.bin == product_details.bin && 
                        data.bay == product_details.bay && 
                        data.rack == product_details.rack && 
                        data.storage == product_details.storage && 
                        data.expiry_date == product_details.expiry_date && 
                        data.batch_code == product_details.batch_code && 
                        data.production_date == product_details.production_date && 
                        data.invoice == new_purchase.invoice) {
                        data.product_stock +=  Math.abs(product_details.quantity);
                        x++;
                    }
                });
            
                if (x === 0) {
                    warehouse_data.product_details.push({
                        product_name: product_details.product_name, 
                        product_stock: Math.abs(product_details.quantity), 
                        primary_code: product_details.primary_code, 
                        secondary_code: product_details.secondary_code, 
                        product_code: product_details.product_code,
                        storage: product_details.storage, 
                        rack: product_details.rack, 
                        bay: product_details.bay,  
                        bin: product_details.bin, 
                        type: product_details.type, 
                        floorlevel: product_details.floorlevel, 
                        maxProducts: product_details.maxStocks, 
                        unit: product_details.standard_unit, 
                        secondary_unit: product_details.secondary_unit, 
                        expiry_date: product_details.expiry_date, 
                        maxPerUnit: product_details.maxperunit,
                        batch_code: product_details.batch_code,
                        alertQTY: product_details.alertQTY,
                        production_date: product_details.production_date,
                        product_cat: product_details.product_cat,
                        invoice: product_details.invoice,
                        actual_qty: Math.abs(product_details.actual_qty),
                        actual_uom: product_details.actual_uom
                    });
                }
            
                return warehouse_data;
            });
            
            Promise.all(promises)
                .then(async (updatedWarehouseDataArray) => {
                    // Now you have the updated warehouse data for each product in updatedWarehouseDataArray.
                    // You should save each warehouse_data separately in this block.
                    try {
                        for (const warehouseData of updatedWarehouseDataArray) {
                            await warehouseData.save();
                        }

                        const master = await master_shop.find()
                        const email_data = await email_settings.findOne()
                        const supervisor_data = await supervisor_settings.find();

                        var product_list = new_purchase.product

                        var arrayItems = "";
                        var n;

                        for (n in product_list) {
                            arrayItems +=  '<tr>'+
                                                '<td style="border: 1px solid black;">' + product_list[n].product_name + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].product_code + '</td>' +  
                                                '<td style="border: 1px solid black;">' + product_list[n].quantity + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].standard_unit + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].secondary_unit + '</td>' +
                                                '<td style="border: 1px solid black;">' + new_purchase.warehouse_name + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].room_name + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].storage+product_list[n].rack+product_list[n].bay+product_list[n].bin+product_list[n].type[0]+product_list[n].floorlevel+ '</td>' 
                                            '</tr>'
                        }


                        let mailTransporter = nodemailer.createTransport({
                            host: email_data.host,
                            port: Number(email_data.port),
                            secure: false,
                            auth: {
                                user: email_data.email,
                                pass: email_data.password
                            }
                        });

                        let mailDetails = {
                            from: email_data.email,
                            to: supervisor_data[0].RMSEmail,
                            subject:'Purchase Mail',
                            attachments: [{
                                filename: 'Logo.png',
                                path: __dirname + '/../public' +'/upload/'+master[0].image,
                                cid: 'logo'
                           }],
                            html:'<!DOCTYPE html>'+
                                '<html><head><title></title>'+
                                '</head><body>'+
                                    '<div>'+
                                        '<div style="display: flex; align-items: center; justify-content: center;">'+
                                            '<div>'+
                                                '<img src="cid:logo" class="rounded" width="66.5px" height="66.5px"></img>'+
                                            '</div>'+
                                        
                                            '<div>'+
                                                '<h2> '+ master[0].site_title +' </h2>'+
                                            '</div>'+
                                        '</div>'+
                                        '<hr class="my-3">'+
                                        '<div>'+
                                            '<h5 style="text-align: left;">'+
                                                ' Order Number : '+ new_purchase.invoice +' '+
                                                '<span style="float: right;">'+
                                                    ' Order Date : '+ new_purchase.date +' '+
                                                '</span>'+
                                                
                                            '</h5>'+
                                        '</div>'+
                                        '<table style="width: 100% !important;">'+
                                            '<thead style="width: 100% !important;">'+
                                                '<tr>'+
                                                    '<th style="border: 1px solid black;"> Product Name </th>'+
                                                    '<th style="border: 1px solid black;"> Product Code </th>'+
                                                    '<th style="border: 1px solid black;"> Product Quantity </th>'+
                                                    '<th style="border: 1px solid black;"> Unit </th>'+
                                                    '<th style="border: 1px solid black;"> Secondary Unit </th>'+
                                                    '<th style="border: 1px solid black;"> Warehouse</th>'+
                                                    '<th style="border: 1px solid black;"> Room</th>'+
                                                    '<th style="border: 1px solid black;"> Location </th>'+
                                                '</tr>'+
                                            '</thead>'+
                                            '<tbody style="text-align: center;">'+
                                                ' '+ arrayItems +' '+
                                            '</tbody>'+
                                        '</table>'+
                                    
                                        '<div>'+
                                            '<strong> Regards </strong>'+
                                            '<h5>'+ master[0].site_title +'</h5>'+
                                        '</div>'+
                                    '</div>'+
                                '</body></html>'
                        };
                        
                        mailTransporter.sendMail(mailDetails, function(err, data) {
                            if(err) {
                                console.log(err);
                                console.log('Error Occurs');
                            } else {
                                console.log('Email sent successfully');
                            }
                        });

                        
                        
                        req.flash('success', `Purchase data added successfully`);
                        res.redirect("/all_purchases/view/");
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ error: 'An error occurred while saving data.' });
                    }
                })
                .catch((error) => {
                    // Handle any errors that might have occurred during the process.
                    console.error(error);
                    res.status(500).json({ error: 'An error occurred.' });
                });
            
                


            // res.json(warehouse_data)
            // return
    
            

        
        


        // req.flash('success', `purchase data add successfully`)
        // res.redirect("/all_purchases/view/");
        // res.redirect("/all_purchases/preview/"+new_purchase._id);
    } catch (error) {
        console.log(error);
    }
})


//View Only for Pre finalize
router.get("/preview/:id", auth , async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        const _id = req.params.id

        const user_id = await purchases.findById(_id);
       
         const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": user_id.warehouse_name,
                    "room": user_id.room 
                }
            },
            {
                $unwind: "$product_details"
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name"},
                    product_stock: { $first: "$product_details.product_stock" },
                    bay: { $first: "$product_details.bay" },
                    bin: { $first: "$product_details.bin" },
                    type: { $first: "$product_details.type" },
                    floorlevel: { $first: "$product_details.floorlevel" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: { $first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                    storage: { $first: "$product_details.storage" },
                    rack: { $first: "$product_details.rack" },
                    expiry_date : { $first: "$product_details.expiry_date" }
                }
            },
        ])

        


        const customer_data = await customer.find({})
        // console.log("customer_data", customer_data);
        // const warehouse_data = await warehouse.find({status : 'Enabled'})
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        "name": staff_data.warehouse 
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ])
        }else{
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled'
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ])
        }

        const product_data = await product.find({})

        const suppliers_data = await suppliers.find({});
        const dataSelected = BayBinSelected(user_id.warehouse_name, user_id.room);

        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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

        res.render("edit_purchases_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            customer: customer_data,
            warehouse: warehouse_data,
            product: stock_data,
            user: user_id,
            master_shop : master,
            unit: product_data,
            language : lan_data,
            suppliers: suppliers_data,
            dataSelected
            
        })
    } catch (error) {
        console.log(error);
    }
})


router.post("/preview/:id", auth , async (req, res) => {
    try {
        const _id = req.params.id

        
        const { invoice, warehouse_name, Room_name } = req.body
      
        // --------- warehouse ------- //
        
        const warehouse_data = await warehouse.findOne({ name: warehouse_name, room: Room_name });
        const new_purchase = await purchases.findOne({ invoice: invoice });

        // res.json({ warehouse: warehouse_data, purchase: new_purchase })
        // return

        new_purchase.product.forEach(product_details => {

            var x = 0;
            const match_data = warehouse_data.product_details.map((data) => {
                if (data.product_name == product_details.product_name && 
                    data.floorlevel == product_details.floorlevel && 
                    data.type == product_details.type && 
                    data.bin == product_details.bin && 
                    data.bay == product_details.bay && 
                    data.rack == product_details.rack && 
                    data.storage == product_details.storage && 
                    data.expiry_date == product_details.expiry_date && 
                    data.batch_code == product_details.batch_code && 
                    data.production_date == product_details.production_date && 
                    data.delivery_date == product_details.delivery_date && 
                    data.delivery_code == product_details.delivery_code
                    ) {
                    data.product_stock = parseInt(data.product_stock) + parseInt(product_details.quantity)
                    x++
                }

            })

            if (x == "0") {
                warehouse_data.product_details = warehouse_data.product_details.concat({ 
                    product_name: product_details.product_name, 
                    product_stock: product_details.quantity, 
                    primary_code: product_details.primary_code, 
                    secondary_code: product_details.secondary_code, 
                    product_code: product_details.product_code,
                    storage: product_details.storage, 
                    rack: product_details.rack, 
                    bay: product_details.bay,  
                    bin: product_details.bin, 
                    type: product_details.type, 
                    floorlevel: product_details.floorlevel, 
                    maxProducts: product_details.maxStocks, 
                    unit: product_details.standard_unit, 
                    secondary_unit: product_details.secondary_unit, 
                    expiry_date: product_details.expiry_date, 
                    maxPerUnit: product_details.maxperunit,
                    batch_code: product_details.batch_code,
                    alertQTY: product_details.alertQTY,
                    production_date: product_details.production_date,
                    delivery_date: product_details.delivery_date,
                    delivery_code: product_details.delivery_code
                })
            }
            // console.log("final", warehouse_data);
        })

        await warehouse_data.save()

// --------- warehouse end ------- //



// ------------- email ------------- //
    
// const master = await master_shop.find()
// console.log("add post", master[0].image);

// const email_data = await email_settings.findOne()

// const suppliers_data = await suppliers.findOne({name : req.body.suppliers})
// console.log("suppliers_data", suppliers_data);

// if (master[0].currency_placement == 1) {
//     right_currency = master[0].currency
//     left_currency = ""
// } else {
//     right_currency = ""
//     left_currency = master[0].currency
// }

// var product_list = product_name_array
// var quantity_list = quantity_array
// var proudct_code_list = proudct_code_array
// var prod_unit_list = prod_unit_array
// var prod_secondunit_list = prod_secondunit_array
// var prod_level_list = prod_level_array
// var prod_isle_list = prod_isle_array
// var prod_pallet_list = prod_pallet_array



// var arrayItems = "";
// var n;

// for (n in product_list) {
//     arrayItems +=  '<tr>'+
//                         '<td style="border: 1px solid black;">' + product_list[n] + '</td>' + 
//                         '<td style="border: 1px solid black;">' + proudct_code_list[n] + '</td>' +
//                         '<td style="border: 1px solid black;">' + quantity_list[n] + '</td>' +
//                         '<td style="border: 1px solid black;">' + prod_unit_list[n] + '</td>' +
//                         '<td style="border: 1px solid black;">' + prod_secondunit_list[n] + '</td>' +
//                         '<td style="border: 1px solid black;">' + prod_level_list[n] + '</td>' +
//                         '<td style="border: 1px solid black;">' + prod_isle_list[n] + '</td>' +
//                         '<td style="border: 1px solid black;">' + prod_pallet_list[n] + '</td>' +
//                     '</tr>'
// }

// console.log("product_list", arrayItems);


// let mailTransporter = nodemailer.createTransport({
//     host: 'smtp.elasticemail.com',
//     port: 2525,
//     auth: {
//         user: 'christian.villamer@jakagroup.com',
//         pass: '6BFC88B744E188F303E090EF40972BA7C7C0'
//     }
// });

// let mailDetails = {
//     from: 'christian.villamer@jakagroup.com',
//     to: 'cvillamer13@gmail.com',
//     subject:'Purchase Mail',
//     attachments: [{
//         filename: 'Logo.png',
//         path: __dirname + '/../public' +'/upload/'+master[0].image,
//         cid: 'logo'
//    }],
//     html:'<!DOCTYPE html>'+
//         '<html><head><title></title>'+
//         '</head><body>'+
//             '<div>'+
//                 '<div style="display: flex; align-items: center; justify-content: center;">'+
//                     '<div>'+
//                         '<img src="cid:logo" class="rounded" width="66.5px" height="66.5px"></img>'+
//                     '</div>'+
                
//                     '<div>'+
//                         '<h2> '+ master[0].site_title +' </h2>'+
//                     '</div>'+
//                 '</div>'+
//                 '<hr class="my-3">'+
//                 '<div>'+
//                     '<h5 style="text-align: left;">'+
//                         ' Order Number : '+ invoice +' '+
//                         '<span style="float: right;">'+
//                             ' Order Date : '+ date +' '+
//                         '</span>'+
                        
//                     '</h5>'+
//                 '</div>'+
//                 '<table style="width: 100% !important;">'+
//                     '<thead style="width: 100% !important;">'+
//                         '<tr>'+
//                             '<th style="border: 1px solid black;"> Product Name </th>'+
//                             '<th style="border: 1px solid black;"> Product Code </th>'+
//                             '<th style="border: 1px solid black;"> Product Quantity </th>'+
//                             '<th style="border: 1px solid black;"> Unit </th>'+
//                             '<th style="border: 1px solid black;"> Secondary Unit </th>'+
//                             '<th style="border: 1px solid black;"> Level </th>'+
//                             '<th style="border: 1px solid black;"> Isle </th>'+
//                             '<th style="border: 1px solid black;"> Pallet </th>'+
//                         '</tr>'+
//                     '</thead>'+
//                     '<tbody style="text-align: center;">'+
//                         ' '+ arrayItems +' '+
//                     '</tbody>'+
//                 '</table>'+
            
//                 '<div>'+
//                     '<strong> Regards </strong>'+
//                     '<h5>'+ master[0].site_title +'</h5>'+
//                 '</div>'+
//             '</div>'+
//         '</body></html>'
// };

// mailTransporter.sendMail(mailDetails, function(err, data) {
//     if(err) {
//         console.log(err);
//         console.log('Error Occurs');
//     } else {
//         console.log('Email sent successfully');
//     }
// });


// ------------- email end ------------- //


        new_purchase.finalize = "True";
        const purchases_data = await new_purchase.save()
            
       


        req.flash("success", `Sales Update successfully`)
        res.redirect("/all_purchases/view")

    } catch (error) {
        console.log(error);
    }
})

//end


// ========= edit Purchase ============ //

router.get("/view/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        // console.log("master" , master);

        const _id = req.params.id
        const user_id = await purchases.findById(_id);
        // console.log("edit Purchase user_id", user_id);

        const suppliers_data = await suppliers.find({});

        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse, "warehouse_category": "Raw Materials" });
        }else{
            // warehouse_data = await warehouse.find({status : 'Enabled'});
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled',
                        "warehouse_category": "Raw Materials"
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ])
        }
        
        const product_data = await product.find({});
        
        const dataSelected = BayBinSelected(user_id.warehouse_name, user_id.room);
        // res.status(200).json( { data: dataSelected });
        let expiry_date = new Date(user_id.expiry_date)
        let ed_day = ('0' + expiry_date.getDate()).slice(-2)
        let ed_month = ('0' + (expiry_date.getMonth() + 1)).slice(-2)
        let ed_year = expiry_date.getFullYear()
        let ed_fullDate = `${ed_year}-${ed_month}-${ed_day}`
        
        
        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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

        res.render("edit_purchases", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            purchases: user_id,
            suppliers: suppliers_data,
            warehouse: warehouse_data,
            product: product_data,
            master_shop : master,
            language : lan_data,
            ed_fullDate	,
            dataSelected
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        
        const purchases_data = await purchases.findOne({ _id: req.params.id })
        
        // console.log("purchases_data", purchases_data);

        const old_warehouse_data = await warehouse.findOne({ name: purchases_data.warehouse_name, room: purchases_data.room });
        // console.log("old_warehouse_data", old_warehouse_data);
        // console.log(purchases_data);
        // return
        purchases_data.product.forEach(product_details => {
            // console.log("if product_details", product_details);

            const match_data = old_warehouse_data.product_details.map((data) => {
                // console.log("map", data);

                // if (data.product_name == product_details.product_name && data.pallet == product_details.pallet) {
                if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay && data.rack == product_details.rack && data.storage == product_details.storage) {
                    data.product_stock = parseInt(data.product_stock) - parseInt(product_details.quantity)
                    
                }

            })
        })
        // console.log("old_warehouse_data", old_warehouse_data);
        await old_warehouse_data.save()
       
        const { invoice, suppliers, date, warehouse_name,  prod_name, prod_code, prod_qty, prod_unit, prod_secondunit, prod_level, prod_isle, prod_pallet, note, expiry_date, batch_code, paid_amount, due_amount, Room_name, primary_code, secondary_code, PO_number, JO_number } = req.body
        

        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            var proudct_code_array = [req.body.prod_code]
            var quantity_array = [req.body.prod_qty]
            var prod_unit_array =  [req.body.prod_unit]
            var prod_secondunit_array = [req.body.prod_secondunit]
            var prod_level_array = [req.body.prod_level]
            var prod_isle_array = [req.body.prod_isle]
            var prod_pallet_array = [req.body.prod_pallet]
            var prod_primaryCode_array = [req.body.primary_code]
            var prod_SecondaryyCode_array = [req.body.secondary_code]
            var MaxStocks_data_aray = [req.body.MaxStocks_data]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            var storage_array = [req.body.storage]
            var rak_array = [req.body.rak]
            var type_array = [req.body.type]
            
            // console.log("if");
        }else{
            var product_name_array = [...req.body.prod_name]
            var proudct_code_array = [...req.body.prod_code]
            var quantity_array = [...req.body.prod_qty]
            var prod_unit_array =  [...req.body.prod_unit]
            var prod_secondunit_array = [...req.body.prod_secondunit]
            var prod_level_array = [...req.body.prod_level]
            var prod_isle_array = [...req.body.prod_isle]
            var prod_pallet_array = [...req.body.prod_pallet]
            var prod_primaryCode_array = [...req.body.primary_code]
            var prod_SecondaryyCode_array = [...req.body.secondary_code]
            var MaxStocks_data_aray = [...req.body.MaxStocks_data]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
            var storage_array = [...req.body.storage]
            var rak_array = [...req.body.rak]
            var type_array = [...req.body.type]

            // console.log("else", product_name_array);
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        proudct_code_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });
        
        
        quantity_array.forEach((value,i) => {
            newproduct[i].quantity = value
        });
        
        prod_unit_array.forEach((value, i) => {
            newproduct[i].standard_unit = value
        })
        
        prod_secondunit_array.forEach((value, i) => {
            newproduct[i].secondary_unit = value
        })
        
         prod_level_array.forEach((value, i) => {
            newproduct[i].bay = value
        })
         prod_isle_array.forEach((value, i) => {
            newproduct[i].bin = value
        })
         prod_pallet_array.forEach((value, i) => {
            newproduct[i].floorlevel = value
        })
        
        
        prod_primaryCode_array.forEach((value, i) => {
            newproduct[i].primary_code = value
        })
        
         prod_SecondaryyCode_array.forEach((value, i) => {
            newproduct[i].secondary_code = value
        })


        MaxStocks_data_aray.forEach((value, i) => {
            newproduct[i].maxStocks = value
        })


        batch_code_array.forEach((value, i) => {
            newproduct[i].batch_code = value
        })
        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })

        type_array.forEach((value, i) => {
            newproduct[i].type = value
        })


        storage_array.forEach((value, i) => {
            newproduct[i].storage = value
        })

        rak_array.forEach((value, i) => {
            newproduct[i].rack = value
        })

        
        const Newnewproduct = newproduct.filter(obj => obj.quantity !== "0" && obj.quantity !== "");
        purchases_data.invoice = invoice
        purchases_data.suppliers = suppliers
        purchases_data.date = date
        purchases_data.warehouse_name = warehouse_name
        purchases_data.product = Newnewproduct
        purchases_data.note = note
        // purchases_data.expiry_date = expiry_date
        // purchases_data.batch_code = batch_code
        purchases_data.paid_amount = paid_amount
        purchases_data.due_amount = due_amount
        purchases_data.room = Room_name
        purchases_data.POnumber = PO_number
        purchases_data.JO_number = JO_number
        
        // console.log("new purchases_data", purchases_data);
        
        const new_data = await purchases_data.save()
        // console.log(data);

        const new_warehouse_data = await warehouse.findOne({ name: req.body.warehouse_name, room: req.body.Room_name });
        // console.log("new_warehouse_data", new_warehouse_data);
       
        purchases_data.product.forEach(product_details => {
            // console.log("if product_details", product_details);

            var x = 0;
            const match_data = new_warehouse_data.product_details.map((data) => {
                // console.log("map", data);
                
                // if (data.product_name == product_details.product_name && data.pallet == product_details.pallet) {
                if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay && data.rack == product_details.rack && data.storage == product_details.storage) {
                    data.product_stock = parseInt(data.product_stock) + parseInt(product_details.quantity)
                    x++
                }

            })

            if (x == "0") {
                new_warehouse_data.product_details = new_warehouse_data.product_details.concat({ 
                    product_name: product_details.product_name, 
                    product_stock: product_details.quantity, 
                    primary_code: product_details.primary_code, 
                    secondary_code: product_details.secondary_code, 
                    product_code: product_details.product_code,
                    storage: product_details.storage, 
                    rack: product_details.rack, 
                    bay: product_details.bay,  
                    bin: product_details.bin, 
                    type: product_details.type, 
                    floorlevel: product_details.floorlevel, 
                    maxProducts: product_details.maxStocks, 
                    unit: product_details.standard_unit, 
                    secondary_unit: product_details.secondary_unit, 
                    expiry_date: product_details.expiry_date  
                })
            }
        })
        
        // console.log("final", new_warehouse_data);
        await new_warehouse_data.save()


        // -------- supplier payment ------- //

        const s_payment = await s_payment_data.findOne({invoice : req.body.invoice})
        
        if (s_payment === null) {
          
        }else{
            console.log("suppliers", s_payment, req.body.invoice);
            s_payment.suppliers = req.body.suppliers
            await s_payment.save()  
            
        }


        // -------- supplier payment end ------- //

        req.flash('success', `purchase data update successfully`)
        res.redirect("/all_purchases/view")
    } catch (error) {
        console.log(error);
    }
})


// ========= Give Payment ============= //

router.post("/give_payment/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const { invoice, suppliers, payable, due_amount } = req.body

        const data = await purchases.findById(_id)

        var subtract = payable - due_amount

        data.paid_amount = parseFloat(data.paid_amount) + parseFloat(due_amount)
        data.due_amount = subtract

        const new_data = await data.save();
        console.log(new_data);

        // -------- s_payment ------- //

        const s_payment = await s_payment_data.findOne({invoice : invoice})
        s_payment.amount = subtract

        await s_payment.save()

        // -------- s_payment end ------- //


        // -------- supplier payment ------- //

        let date_ob = new Date();
        let newdate = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let final_date = year + "-" + month + "-" + newdate
       
        const suppliers_payment_data = new suppliers_payment({invoice, date : year + "-" + month + "-" + newdate, suppliers, reason : "Paid For Purchase", amount : due_amount})

        const new_suppliers_payment = await suppliers_payment_data.save()

        // -------- supplier payment end ------- //

        req.flash('success', `payment successfull`)
        res.redirect("/all_purchases/view")
    } catch (error) {
        console.log(error);
    }
})


router.get("/invoice/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id

        const user_id = await purchases.findById(_id);
        console.log(user_id);
        
        const suppliers_data = await suppliers.findOne({ name : user_id.suppliers });
        console.log(suppliers_data);

        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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
        
        res.render("purchase_invoice", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            supplier : suppliers_data,
            purchase : user_id,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})


// ============ return purchase ============= //

router.get("/view/return_purchase/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id
        console.log(_id);

        const user_id = await purchases.findById(_id);
        console.log("user_id", user_id);

        const product_data = await product.find({});

        const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": user_id.warehouse_name,
                    "room": user_id.room ,
                    "warehouse_category": "Raw Materials"
                }
            },
            {
                $unwind: "$product_details"
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name"},
                    product_stock: { $first: "$product_details.product_stock" },
                    bay: { $first: "$product_details.bay" },
                    bin: { $first: "$product_details.bin" },
                    type: { $first: "$product_details.type" },
                    floorlevel: { $first: "$product_details.floorlevel" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: { $first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                    storage: { $first: "$product_details.storage" },
                    rack: { $first: "$product_details.rack" },
                }
            },
        ])


        warehouse_data = await warehouse.aggregate([
            {
                $match: { 
                    "status": 'Enabled',
                    "name": "Return Goods",
                    "warehouse_category" : "Raw Materials",
                    
                }
            },
            {
                $group: {
                    _id: "$name",
                    name: { $first: "$name" }
                }
            },
            {
                $sort: {
                    name: 1 // 1 for ascending order, -1 for descending order
                }
            }
        ]);

        console.log("stock_data", stock_data);

        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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

        res.render("return_purchase", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            user: user_id,
            stock: stock_data,
            master_shop : master,
            product: product_data,
            language : lan_data,
            warehouse : warehouse_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/return_purchase/:id", auth, async (req, res) => {
    try {
        const { invoice, date, warehouse_name, Room_name, product_name, purchase_quantity, stocks, return_qty, note, level, isle, pallet, to_warehouse_name, to_Room_name } = req.body
        

        const old_purchases_data = await purchases.findOne({ _id: req.params.id })
        const old_warehouse_data = await warehouse.findOne({ name: warehouse_name, room: Room_name });
        // res.json(old_purchases_data)
        if(typeof product_name == "string"){
            var product_name_array = [req.body.product_name]
            var quantity_array = [req.body.purchase_quantity]
            var stock_quantity_array = [req.body.stocks]
            var return_qty_array = [req.body.return_qty]
            var level_array = [req.body.level]
            var isle_array = [req.body.isle]
            var pallet_array = [req.body.pallet]
            var types_array = [req.body.types]
            var product_code_hide_array = [req.body.product_code_hide]
            var primary_code_hide_array = [req.body.primary_code_hide]
            var secondary_code_hide_array = [req.body.secondary_code_hide]
            
        }else{
            var product_name_array = [...req.body.product_name]
            var quantity_array = [...req.body.purchase_quantity]
            var stock_quantity_array = [...req.body.stocks]
            var return_qty_array = [...req.body.return_qty]
            var level_array = [...req.body.level]
            var isle_array = [...req.body.isle]
            var pallet_array = [...req.body.pallet]
            var types_array = [...req.body.types]
            var product_code_hide_array = [...req.body.product_code_hide]
            var primary_code_hide_array = [...req.body.primary_code_hide]
            var secondary_code_hide_array = [...req.body.secondary_code_hide]
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        quantity_array.forEach((value,i) => {
            newproduct[i].purchase_quantity = value
        });

        stock_quantity_array.forEach((value,i) => {
            newproduct[i].stock_quantity = value
        });
        
        return_qty_array.forEach((value, i) => {
            newproduct[i].return_qty = value
        })


        level_array.forEach((value, i) => {
            newproduct[i].bay = value
        })

        isle_array.forEach((value, i) => {
            newproduct[i].bin = value
        })

        pallet_array.forEach((value, i) => {
            newproduct[i].floorlevel = value
        })

        types_array.forEach((value, i) => {
            newproduct[i].type = value
        })


        product_code_hide_array.forEach((value, i) => {
            newproduct[i].product_code = value
        })


        primary_code_hide_array.forEach((value, i) => {
            newproduct[i].primary_code = value
        })


        secondary_code_hide_array.forEach((value, i) => {
            newproduct[i].secondary_code = value
        })


        old_purchases_data.product.forEach(product_details => {

            const match_data = old_warehouse_data.product_details.map((data) => {

                // if (data.product_name == product_details.product_name && product_details.pallet == data.pallet) {
                if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay && data.rack == product_details.rack && data.storage == product_details.storage) {
                    console.log(parseInt(data.product_stock) + " <> " + parseInt(product_details.quantity) )
                    data.product_stock = parseInt(data.product_stock) + parseInt(product_details.quantity)
                
                }

            })
        })
        await old_warehouse_data.save()

        const Newnewproduct = newproduct.filter(obj => obj.return_qty !== "0" && obj.return_qty !== "");

        var error = 0
        Newnewproduct.forEach(data => {
            console.log("foreach newproduct", data);
            if (parseInt(data.purchase_quantity) < parseInt(data.return_qty) || parseInt(data.stock_quantity) < parseInt(data.return_qty) ) {
                
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `Must not be greater than Purchase/Stock Qty`)
            return res.redirect("back")
        }

        const data = new purchases_return({ invoice, suppliers:req.body.suppliers, date, warehouse_name, return_product:Newnewproduct, note, room: Room_name, to_warehouse_name, to_room: to_Room_name })
        const purchases_return_data = await data.save()
        console.log(data);

        const new_purchase = await purchases_return.findOne({ invoice: invoice });

        const warehouse_data = await warehouse.findOne({ name: to_warehouse_name, room: to_Room_name });

        new_purchase.return_product.forEach(product_details => {
            // console.log("if product_details", product_details);

            var x = 0;
            const match_data = warehouse_data.product_details.map((data) => {
                if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay) {
                    data.product_stock = parseInt(data.product_stock) - parseInt(product_details.return_qty)
                    x++;
                }

            })
            if (x == "0") {
                warehouse_data.product_details = warehouse_data.product_details.concat({ 
                    product_name: product_details.product_name, 
                    product_stock: product_details.return_qty, 
                    primary_code: product_details.primary_code, 
                    secondary_code: product_details.secondary_code, 
                    product_code: product_details.product_code,
                    storage: product_details.storage, 
                    rack: product_details.rack, 
                    bay: product_details.bay,  
                    bin: product_details.bin, 
                    type: product_details.type, 
                    floorlevel: product_details.floorlevel, 
                    maxProducts: product_details.maxStocks, 
                    unit: product_details.standard_unit, 
                    secondary_unit: product_details.secondary_unit, 
                    expiry_date: product_details.expiry_date  
                })
            }
        })

        await warehouse_data.save()

        const old_data = await purchases.findOne({ invoice: invoice });
        // console.log(old_data);

        old_data.return_data = "True"

        const purchases_data = await old_data.save()
        // console.log(purchases_data);


        // -------- supplier payment ------- //

        const s_payment = new s_payment_data({invoice : invoice, suppliers : req.body.suppliers , reason : "Purchase Return"})

        await s_payment.save()

        // -------- supplier payment end ------- //


        // ------------- email ------------- //
        

        const master = await master_shop.find()
        console.log("add post", master[0].image);

        const email_data = await email_settings.findOne()

        const suppliers_data = await suppliers.findOne({name : req.body.suppliers})
        console.log("suppliers_data", suppliers_data);
        
        if (master[0].currency_placement == 1) {
            right_currency = master[0].currency
            left_currency = ""
        } else {
            right_currency = ""
            left_currency = master[0].currency
        }

        var product_list = product_name_array
        var return_qty_list = return_qty_array

        var arrayItems = "";
        var n;

        for (n in product_list) {
            arrayItems +=  '<tr>'+
                                '<td style="border: 1px solid black;">' + product_list[n] + '</td>' +
                                '<td style="border: 1px solid black;">' +return_qty_list[n]+ '</td>' +
                            '</tr>'
        }
        
        console.log("product_list", arrayItems);
        
        let mailTransporter = nodemailer.createTransport({
            // host: email_data.host,
            // port: Number(email_data.port),
            // secure: false,
            service: 'gmail',
            auth: {
                user: email_data.email,
                pass: email_data.password
            }
        });

        let mailDetails = {
            from: email_data.email,
            to: suppliers_data.email,
            subject:'Purchase Return Mail',
            attachments: [{
                filename: 'Logo.png',
                path: __dirname + '/../public' +'/upload/'+master[0].image,
                cid: 'logo'
           }],
            html:'<!DOCTYPE html>'+
                '<html><head><title></title>'+
                '</head><body>'+
                    '<div>'+
                        '<div style="display: flex; align-items: center; justify-content: center;">'+
                            '<div>'+
                                '<img src="cid:logo" class="rounded" width="66.5px" height="66.5px"></img>'+
                            '</div>'+
                        
                            '<div>'+
                                '<h2> '+ master[0].site_title +' </h2>'+
                            '</div>'+
                        '</div>'+
                        '<hr class="my-3">'+
                        '<div>'+
                            '<h5 style="text-align: left;">'+
                                ' Order Number : '+ invoice +' '+
                                '<span style="float: right;">'+
                                    ' Order Date : '+ date +' '+
                                '</span>'+
                                
                            '</h5>'+
                        '</div>'+
                        '<table style="width: 100% !important;">'+
                            '<thead style="width: 100% !important;">'+
                                '<tr>'+
                                    '<th style="border: 1px solid black;"> Product Name </th>'+
                                    '<th style="border: 1px solid black;"> Return Quantity </th>'+
                                    '<th style="border: 1px solid black;"> Product Price </th>'+
                                    '<th style="border: 1px solid black;"> Total </th>'+
                                '</tr>'+
                            '</thead>'+
                            '<tbody style="text-align: center;">'+
                                ' '+ arrayItems +' '+
                            '</tbody>'+
                        '</table>'+
                        
                        
                        '<div>'+
                            '<strong> Regards </strong>'+
                            '<h5>'+ master[0].site_title +'</h5>'+
                        '</div>'+
                    '</div>'+
                '</body></html>'
        };
        
        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log(err);
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
            }
        });

        
        // ------------- email end ------------- //

        req.flash('success', `purchases item return successfull`)
        res.redirect("/all_purchases/view")
    } catch (error) {
        console.log(error);

        res.status(200).json({ message: error.message })
    }
})

router.get("/barcode/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        // console.log("barcode Product master" , master);
        
        const _id = req.params.id
        const user_id = await purchases.findById(_id)
       
        // console.log("barcode user_id", user_id);

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
        
        res.render("all_purchases_barcode", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            alldata: user_id,
            master_shop : master,
            language : lan_data
        })
        console.log(alldata)
    } catch (error) {
        console.log(error);
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


router.post("/CheckingWarehouse", async (req, res) => {

    const { primaryCode, secondaryCode, productCode, bay, bin, types, pallet, warehouses, room } = req.body
    console.log(req.body)
    try{
        const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": warehouses,
                    "room": room

                }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: {
                    "product_details.bay" : bay,
                    "product_details.bin" : bin,
                    "product_details.type": types,
                }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name"},
                    product_stock: { $first: "$product_details.product_stock" },
                    level: { $first: "$product_details.level" },
                    isle: { $first: "$product_details.isle" },
                    pallet: { $first: "$product_details.pallet" },
                    maxProducts: { $first: "$product_details.maxProducts" }
                }
            },
        ])


        res.status(200).json(stock_data)
    }catch(error){
        res.status(404).json({ message: error.message })
    }

})
module.exports = router;