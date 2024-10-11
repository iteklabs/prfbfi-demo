const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../middleware/auth");
const {profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, suppliers_payment, expenses_type, all_expenses, adjustment, supervisor_settings, email_settings} = require("../models/all_models");
const users = require("../public/language/languages.json");
const nodemailer = require('nodemailer');


router.get("/view", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        // const warehouse_data = await warehouse.find({status : "Enabled"})
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
        }else{
            warehouse_data = await warehouse.find({status : 'Enabled'});
        }


        const product_data = await product.find()


        // const adjustment_data = await adjustment.find()
        let adjustment_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            adjustment_data = await adjustment.find({ warehouse_name : staff_data.warehouse })
        }else{
            // adjustment_data = await adjustment.find()
            adjustment_data = await adjustment.aggregate([
                {
                    $unwind: "$product"
                },
                {
                  $group: {
                    _id: "$_id",
                    invoice: { $first: "$invoice" },
                    date: { $first: "$date" },
                    warehouse_name: { $first: "$warehouse_name" },
                    room: { $addToSet: "$product.room_names" },
                    finalize: { $first: "$finalize" },
                    isAllowEdit: { $first: "$isAllowEdit"}
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
                    finalize: 1,
                    isAllowEdit: 1
                    
                  }
               }
          ]);
        }

        

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
        res.render("adjustment", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            warehouse : warehouse_data,
            product : product_data,
            adjustment : adjustment_data,
            master_shop : master,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
    
})
async function getRandom8DigitNumber() {
    const min = 10000000;
    const max = 99999999; 
    
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    var IDInvoice;


    const new_purchase = await adjustment.findOne({ invoice: "ADJ-"+random });
    if (new_purchase && new_purchase.length > 0) {
        IDInvoice = "ADJ-"+random;
    }else{
        IDInvoice = "ADJ-"+random; 
    }
    return IDInvoice ;
}

router.get("/view/add_adjustment", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        name: staff_data.warehouse,
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

        const adjustment_data = await adjustment.find({})
        const invoice_noint = adjustment_data.length + 1
        const invoice_no = "ADJ-" + invoice_noint.toString().padStart(5, "0")
        var rooms_data = ["Ambient", "Enclosed", "Return Rooms"];

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
        const randominv = getRandom8DigitNumber();

        randominv.then(invoicedata => {
            res.render("add_adjustment", {
                success: req.flash('success'),
                errors: req.flash('errors'),
                role : role_data,
                profile : profile_data,
                warehouse: warehouse_data,
                product: product_data,
                master_shop : master,
                language : lan_data,
                rooms_data,
                invoice_no: invoicedata
            })
        }).catch(error => {
            req.flash('errors', `There's a error in this transaction`)
            res.redirect("/adjustment/view");
        })
    } catch (error) {
        console.log(error);
    }
})


router.post("/view/add_adjustment", auth, async(req, res) => {
    try{
        const {warehouse_name, date, prod_name, level, isle, pallet, stock, types, adjust_qty, new_adjust_qty, note, Room_name, invoice, JO_number, expiry_date } = req.body
        
        
        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            var level_array = [req.body.level]
            var stock_array = [req.body.stock]
            var types_array = [req.body.types]
            var adjust_qty_array = [req.body.New_Qty_Converted_adj]
            var new_adjust_qty_array = [req.body.New_Qty_Converted]
            var unit_units_array = [req.body.Primary_Units]
            var Secondary_units_array = [req.body.Secondary_units]
            var product_code_array = [req.body.prod_code]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            var max_per_unit_array = [req.body.max_per_unit]
            var production_date_array = [req.body.production_date]
            var prod_cat_array = [req.body.prod_cat]
            var Rooms_array = [req.body.Rooms]
            var prime1_array = [req.body.prime1]
            var second1_array = [req.body.second1]
            var prod_invoice_array = [req.body.prod_invoice]
            var id_transaction_array = [req.body.id_transaction]
        
        }else{
            var product_name_array = [...req.body.prod_name]
            var level_array = [...req.body.level]
            var stock_array = [...req.body.stock]
            var types_array = [...req.body.types]
            var adjust_qty_array = [...req.body.New_Qty_Converted_adj]
            var new_adjust_qty_array = [...req.body.New_Qty_Converted]
            var unit_units_array = [...req.body.unit]
            var Secondary_units_array = [...req.body.Secondary_units]
            var product_code_array = [...req.body.prod_code]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
            var max_per_unit_array = [...req.body.max_per_unit]
            var production_date_array = [...req.body.production_date]
            var prod_cat_array = [...req.body.prod_cat]
            var Rooms_array = [...req.body.Rooms]
            var prime1_array = [...req.body.prime1]
            var second1_array = [...req.body.second1]
            var prod_invoice_array = [...req.body.prod_invoice]
            var id_transaction_array = [...req.body.id_transaction]
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    } 
        })


        level_array.forEach((value, i) => {
            Rooms_array.forEach((valueRoom, a) => {

                if(valueRoom == "Receiving Area" && i == a){

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
                    var valData;
                    if(value[4] == "L"){
                        valData = "Level";
                    }else if(value[4] == "F"){
                        valData = "Floor";
                    }

                    // console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value)
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = value[2]
                    newproduct[i].bin = value[3]
                    newproduct[i].type = valData
                    newproduct[i].floorlevel = value[5]
                }
    
            })
        })
        
    
        stock_array.forEach((value,i) => {
            newproduct[i].stockBefore = value
        });


        id_transaction_array.forEach((value, i) => {
            newproduct[i].id_transaction_from = value
        })

        types_array.forEach((value, i) => {
            newproduct[i].types = value
        })

        adjust_qty_array.forEach((value,i) => {
            newproduct[i].adjust_qty = value
        });

        new_adjust_qty_array.forEach((value,i) => {
            newproduct[i].new_adjust_qty = value
        });

        unit_units_array.forEach((value,i) => {
            newproduct[i].unit = value
        });

        Secondary_units_array.forEach((value,i) => {
            newproduct[i].secondary_unit = value
        });

        product_code_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });

        batch_code_array.forEach((value,i) => {
            newproduct[i].batch_code = value
        });

        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })


        max_per_unit_array.forEach((value, i) => {
            newproduct[i].maxperunit = value
        })

        production_date_array.forEach((value, i) => {
            newproduct[i].production_date = value
        })


        prod_cat_array.forEach((value, i) => {
            newproduct[i].prod_cat = value
        })


        Rooms_array.forEach((value, i) => {
            newproduct[i].room_names = value
        })


        prime1_array.forEach((value, i) => {
            newproduct[i].primary_code = value
        })


        second1_array.forEach((value, i) => {
            newproduct[i].secondary_code = value
        })


        prod_invoice_array.forEach((value, i) =>{
            newproduct[i].invoice = value
        })

        
        
        const newFilter = newproduct.filter(obj => obj.adjust_qty !== "0" && obj.adjust_qty !== "");
        var error = 0
        newFilter.forEach(data => {
            console.log("foreach newproduct", data);
            if (parseInt(data.adjust_qty) <= 0 ) {
                
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `You can't subtract, the current stock is 0`)
            return res.redirect("back")
        }


        const data = new adjustment({ warehouse_name, date, product:newFilter, note, room: Room_name, invoice, JO_number, expiry_date })

        const adjustment_data = await data.save() 
        
        req.flash('success', `adjustment add successfull`)
        res.redirect("/adjustment/preview/"+adjustment_data._id)
    }catch(error){
        console.log(error);
        res.status(200).json({ message: error.message })
    }
})


router.get("/preview/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()

        const _id = req.params.id
        const adjustment_data = await adjustment.findById({_id})


        const purchases_data = await purchases.aggregate([
            {
                $match: { "warehouse_name": adjustment_data.warehouse_name }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$product.product_name", 
                }
            },
        ])
        // console.log("purchases_data" , purchases_data);

        const product_data = await product.find({})


        const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": adjustment_data.warehouse_name,
                    // "room": adjustment_data.room 
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
                    maxPerUnit: { $first: "$product_details.maxPerUnit"},
                    expiry_date: { $first: "$product_details.expiry_date" },
                    production_date: { $first: "$product_details.production_date" },
                    batch_code: { $first: "$product_details.batch_code"},
                    room: { $first: "$room"}
                }
            },
        ])

        
        // const RoomAll = adjustment_data.product;
        
        // const results = [];
        // async function fetchStockData(value) {
        //     const stock_data = await warehouse.aggregate([
        //         {
        //             $match: { 
        //                 "name": adjustment_data.warehouse_name,
        //                 "room": value 
        //             }
        //         },
        //         {
        //             $unwind: "$product_details"
        //         },
        //         {
        //             $group: {
        //                 _id: "$product_details._id",
        //                 name: { $first: "$product_details.product_name"},
        //                 product_stock: { $first: "$product_details.product_stock" },
        //                 bay: { $first: "$product_details.bay" },
        //                 bin: { $first: "$product_details.bin" },
        //                 type: { $first: "$product_details.type" },
        //                 floorlevel: { $first: "$product_details.floorlevel" },
        //                 primary_code: { $first: "$product_details.primary_code" },
        //                 secondary_code: { $first: "$product_details.secondary_code" },
        //                 product_code: { $first: "$product_details.product_code" },
        //                 storage: { $first: "$product_details.storage" },
        //                 rack: { $first: "$product_details.rack" },
        //                 maxPerUnit: { $first: "$product_details.maxPerUnit"},
        //                 expiry_date: { $first: "$product_details.expiry_date" },
        //                 production_date: { $first: "$product_details.production_date" },
        //                 batch_code: { $first: "$product_details.batch_code"},
        //             }
        //         },
        //     ])

        //     results.push(stock_data);

        // }
   
        // const promises = RoomAll.map((value) => fetchStockData(value.room_names));
        // await Promise.all(promises);
//  res.json(results)
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
        // res.json(results)
        res.render("edit_adjustment_view", {
            success: req.flash('success'), 
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            adjustment: adjustment_data,
            stock: stock_data,  
            master_shop : master,
            warehouse_name : purchases_data,
            unit: product_data,
            language : lan_data,
        })
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message })
    }
})


router.post("/preview/:id", auth, async (req, res) => {
    try {
   
        const _id = req.params.id;
        const {warehouse_name, Room_name} = req.body

        // const warehouse_data = await warehouse.findOne({ name: warehouse_name, room: Room_name });
        const data = await adjustment.findById({_id})


        // data.product.forEach(product_details => {
        //     if(product_details.adjust_qty > 0){
        //         const match_data = warehouse_data.product_details.map((data) => {
       
        //             if (product_details.type == "minus") {

        //                 if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay && data.rack == product_details.rack && data.storage == product_details.storage && data.expiry_date == product_details.expiry_date && data.batch_code == product_details.batch_code && data.production_date ==  product_details.production_date ) {
                            
        //                     data.product_stock = data.product_stock - product_details.adjust_qty
        //                 }
        //             } else {
   
        //                 if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay && data.rack == product_details.rack && data.storage == product_details.storage && data.expiry_date == product_details.expiry_date && data.batch_code == product_details.batch_code && data.production_date ==  product_details.production_date) {
                            
        //                     data.product_stock = data.product_stock + product_details.adjust_qty
        //                 }
        //             }
       
       
        //         })
        //     }

        // })
       
        // await warehouse_data.save()

        const promises = data.product.map( async (product_details) => {
            if(product_details.adjust_qty > 0){
                var warehouse_data = await warehouse.findOne({ name: warehouse_name, room: product_details.room_names, warehouse_category: "Raw Materials" });
                
                const match_data = warehouse_data.product_details.map((data) => {
                    console.log(product_details.types + " <> ")
                    if (product_details.types == "minus") {

                        if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay && data.rack == product_details.rack && data.storage == product_details.storage && data.expiry_date == product_details.expiry_date && data.batch_code == product_details.batch_code && data.production_date ==  product_details.production_date && data.invoice == product_details.invoice && data._id == product_details.id_transaction_from) {
                            var QTYAdj ;
                            QTYAdj = product_details.adjust_qty;
                            if(product_details.prod_cat == "S"){
                                QTYAdj = product_details.adjust_qty;
                            }
                            data.product_stock = data.product_stock - QTYAdj
                            // data.product_stock = product_details.new_adjust_qty
                        }
                    } else {
   
                        if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay && data.rack == product_details.rack && data.storage == product_details.storage && data.expiry_date == product_details.expiry_date && data.batch_code == product_details.batch_code && data.production_date ==  product_details.production_date && data.invoice == product_details.invoice && data._id == product_details.id_transaction_from) {
                            console.log(product_details)
                            var QTYAdj ;
                            QTYAdj = product_details.adjust_qty;
                            if(product_details.prod_cat == "S"){
                                QTYAdj = product_details.adjust_qty;
                            }

                            // console.log(QTYAdj + " <> " + product_details.adjust_qty + " <> " + data.maxPerUnit + " <> " + product_details.prod_cat)
                            data.product_stock = data.product_stock + QTYAdj
                            // data.product_stock = product_details.new_adjust_qty
                            // console.log(data.product_name +"=="+ product_details.product_name +"&&"+ data.floorlevel +"=="+ product_details.floorlevel +"&&"+ data.type +"=="+ product_details.type +"&&"+ data.bin +"=="+ product_details.bin +"&&"+ data.bay +"=="+ product_details.bay +"&&"+ data.rack +"=="+ product_details.rack +"&&"+ data.storage +"=="+ product_details.storage +"&&"+ data.expiry_date +"=="+ product_details.expiry_date +"&&"+ data.batch_code +"=="+ product_details.batch_code +"&&"+ data.production_date +"=="+  product_details.production_date + " <> " + QTYAdj)
                        }
                    }
                })
            }
            return warehouse_data;
        })


        Promise.all(promises)
            .then(async (updatedWarehouseDataArray) => {
                try {


                    // res.json(updatedWarehouseDataArray)
                    // return
                    
                    for (const warehouseData of updatedWarehouseDataArray) {
                        await warehouseData.save();
                    }
                    
                    data.finalize = "True";
                    const adjustment_data = await data.save();



                    const master = await master_shop.find()
                    const email_data = await email_settings.findOne()
                    const supervisor_data = await supervisor_settings.find();


                    var product_list = data.product

                    var arrayItems = "";
                    var n;

                    for (n in product_list) {
                        arrayItems +=  '<tr>'+
                                            '<td style="border: 1px solid black;">' + product_list[n].product_name + '</td>' +
                                            '<td style="border: 1px solid black;">' + product_list[n].product_code + '</td>' +  
                                            '<td style="border: 1px solid black;">' + product_list[n].adjust_qty + '</td>' +
                                            '<td style="border: 1px solid black;">' + product_list[n].unit + '</td>' +
                                            '<td style="border: 1px solid black;">' + product_list[n].secondary_unit + '</td>' +
                                            '<td style="border: 1px solid black;">' + data.warehouse_name + '</td>' +
                                            '<td style="border: 1px solid black;">' + product_list[n].room_names + '</td>' +
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
                            subject:'Adjustment Mail',
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
                                                ' Order Number : '+ data.invoice +' '+
                                                '<span style="float: right;">'+
                                                    ' Order Date : '+ data.date +' '+
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


                    req.flash('success', `adjustment Finalized successfully`)
                    res.redirect("/picking_list/PDF_adjustment_rm/" + adjustment_data._id)
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


        
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message })
    }
})


router.get("/view/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        const _id = req.params.id
        const adjustment_data = await adjustment.findById({_id})
      
        const purchases_data = await purchases.aggregate([
            {
                $match: { "warehouse_name": adjustment_data.warehouse_name }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$product.product_name", 
                }
            },
        ])
   

        const product_data = await product.find({})


        const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": adjustment_data.warehouse_name,
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
                    maxPerUnit: { $first: "$product_details.maxPerUnit"},
                    expiry_date: { $first: "$product_details.expiry_date" },
                    production_date: { $first: "$product_details.production_date" },
                    batch_code: { $first: "$product_details.batch_code"},
                    room: { $first: "$room"}
                }
            },
        ])

        

        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        name: staff_data.warehouse,
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
        // res.status(200).json(stock_data)
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

        res.render("edit_adjustment", {
            success: req.flash('success'), 
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            adjustment: adjustment_data,
            stock: stock_data,  
            master_shop : master,
            warehouse_name : purchases_data,
            unit: product_data,
            language : lan_data,
            warehouse : warehouse_data
        })
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message })
    }
})

router.post("/view/:id", auth, async (req, res) => {
    try{
        const _id = req.params.id;
        const old_adjustment = await adjustment.findById({_id})

        const old_warehouse_data = await warehouse.findOne({name : old_adjustment.warehouse_name, room: old_adjustment.room })

        
        const {warehouse_name, date, prod_name, level, isle, pallet, stock, types, adjust_qty, new_adjust_qty, note, Room_name, invoice, JO_number, expiry_date } = req.body
       
        
        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            var level_array = [req.body.level]
            var stock_array = [req.body.stock]
            var types_array = [req.body.types]
            var adjust_qty_array = [req.body.New_Qty_Converted_adj]
            var new_adjust_qty_array = [req.body.New_Qty_Converted]
            var unit_units_array = [req.body.Primary_Units]
            var Secondary_units_array = [req.body.Secondary_units]
            var product_code_array = [req.body.prod_code]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            var max_per_unit_array = [req.body.max_per_unit]
            var production_date_array = [req.body.production_date]
            var prod_cat_array = [req.body.prod_cat]
            var Rooms_array = [req.body.Rooms]
            var prime1_array = [req.body.prime1]
            var second1_array = [req.body.second1]
        
        }else{
            var product_name_array = [...req.body.prod_name]
            var level_array = [...req.body.level]
            var stock_array = [...req.body.stock]
            var types_array = [...req.body.types]
            var adjust_qty_array = [...req.body.New_Qty_Converted_adj]
            var new_adjust_qty_array = [...req.body.New_Qty_Converted]
            var unit_units_array = [...req.body.unit]
            var Secondary_units_array = [...req.body.Secondary_units]
            var product_code_array = [...req.body.prod_code]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
            var max_per_unit_array = [...req.body.max_per_unit]
            var production_date_array = [...req.body.production_date]
            var prod_cat_array = [...req.body.prod_cat]
            var Rooms_array = [...req.body.Rooms]
            var prime1_array = [...req.body.prime1]
            var second1_array = [...req.body.second1]
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    } 
        })


        level_array.forEach((value, i) => {
            Rooms_array.forEach((valueRoom, a) => {

                if(valueRoom == "Receiving Area" && i == a){

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
                    var valData;
                    if(value[4] == "L"){
                        valData = "Level";
                    }else if(value[4] == "F"){
                        valData = "Floor";
                    }

                    // console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value)
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = value[2]
                    newproduct[i].bin = value[3]
                    newproduct[i].type = valData
                    newproduct[i].floorlevel = value[5]
                }
    
            })
        })
        
    
        stock_array.forEach((value,i) => {
            newproduct[i].stockBefore = value
        });

        types_array.forEach((value, i) => {
            newproduct[i].types = value
        })

        adjust_qty_array.forEach((value,i) => {
            newproduct[i].adjust_qty = value
        });

        new_adjust_qty_array.forEach((value,i) => {
            newproduct[i].new_adjust_qty = value
        });

        unit_units_array.forEach((value,i) => {
            newproduct[i].unit = value
        });

        Secondary_units_array.forEach((value,i) => {
            newproduct[i].secondary_unit = value
        });

        product_code_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });

        batch_code_array.forEach((value,i) => {
            newproduct[i].batch_code = value
        });

        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })


        max_per_unit_array.forEach((value, i) => {
            newproduct[i].maxperunit = value
        })

        production_date_array.forEach((value, i) => {
            newproduct[i].production_date = value
        })


        prod_cat_array.forEach((value, i) => {
            newproduct[i].prod_cat = value
        })


        Rooms_array.forEach((value, i) => {
            newproduct[i].room_names = value
        })


        prime1_array.forEach((value, i) => {
            newproduct[i].primary_code = value
        })


        second1_array.forEach((value, i) => {
            newproduct[i].secondary_code = value
        })

       

        const newFilter = newproduct.filter(obj => obj.adjust_qty !== "0" && obj.adjust_qty !== "");
        var error = 0
        newFilter.forEach(data => {
            console.log("foreach newproduct", data);
            if (parseInt(data.adjust_qty) <= 0 ) {
                
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `You can't subtract, the current stock is 0`)
            return res.redirect("back")
        }

        
 


        old_adjustment.warehouse_name = warehouse_name
        old_adjustment.date = date
        old_adjustment.product = newFilter
        old_adjustment.note = note
        old_adjustment.invoice = invoice
        old_adjustment.isAllowEdit = "False"

        const adjustment_data = await old_adjustment.save()

        

        req.flash('success', `adjustment data update successfully`)
        res.redirect("/adjustment/view")

    } catch (error) {
        console.log(error);
    }
})




router.post("/barcode_scanner", async (req, res) => {
    const { primary_code, warehouse_data, rooms_data, Roomslist } = req.body;
    const RoomAll = Roomslist.split(",");
    // console.log(req.body)
    const results = [];

    // Define a function to fetch stock data asynchronously
    async function fetchStockData(value) {
        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": warehouse_data, "room" : value }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.primary_code": primary_code }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name" },
                    product_stock: { $first: "$product_details.product_stock" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: {$first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                    level: { $first: "$product_details.bay" },
                    isle: { $first: "$product_details.bin" },
                    type: { $first: "$product_details.type" },
                    pallet: { $first: "$product_details.floorlevel" },
                    unit: { $first: "$product_details.unit" },
                    secondary_unit: { $first: "$product_details.secondary_unit" },
                    storage: { $first: "$product_details.storage" },
                    rack: { $first: "$product_details.rack" },
                    expiry_date: { $first: "$product_details.expiry_date" },
                    production_date: { $first: "$product_details.production_date" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    batch_code: { $first: "$product_details.batch_code" },
                    product_cat:{ $first: "$product_details.product_cat" },
                    computeUsed : { $first: "P" },
                    roomNamed : { $first: "$room" },
                    invoice : { $first: "$product_details.invoice" }
                }
            },
        ]);

        const stock_data2 = await warehouse.aggregate([
            
            {
                $match: { "name": warehouse_data, "room" : value }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.secondary_code": primary_code }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name" },
                    product_stock: { $first: "$product_details.product_stock" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: {$first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                    level: { $first: "$product_details.bay" },
                    isle: { $first: "$product_details.bin" },
                    type: { $first: "$product_details.type" },
                    pallet: { $first: "$product_details.floorlevel" },
                    unit: { $first: "$product_details.unit" },
                    secondary_unit: { $first: "$product_details.secondary_unit" },
                    storage: { $first: "$product_details.storage" },
                    rack: { $first: "$product_details.rack" },
                    expiry_date: { $first: "$product_details.expiry_date" },
                    production_date: { $first: "$product_details.production_date" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    batch_code: { $first: "$product_details.batch_code" },
                    product_cat:{ $first: "$product_details.product_cat" },
                    computeUsed : { $first: "S" },
                    roomNamed : { $first: "$room" }
                }
            },
        ]);

        if (stock_data.length > 0) {
            results.push(stock_data);
        } else if (stock_data2.length > 0) {
            results.push(stock_data2);
        }
    }

    // Create an array of promises for each value
    const promises = RoomAll.map((value) => fetchStockData(value));

    // Wait for all promises to resolve before sending the response
    await Promise.all(promises);

    res.json(results);
});

router.post("/CheckingWarehouse", async (req, res) => {

    const { primaryCode, secondaryCode, productCode, level, isle, pallet, warehouses, room } = req.body

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
                    "product_details.level" : parseInt(level),
                    "product_details.isle" : isle,
                    "product_details.pallet": parseInt(pallet),
                    // "product_details.product_code" : productCode,
                    // "product_details.secondary_code": secondaryCode,
                    // "product_details.primary_code" : primaryCode
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