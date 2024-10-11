const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, sales, sales_return, suppliers_payment, customer_payment, transfers, email_settings, supervisor_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");
const nodemailer = require('nodemailer');


router.get("/view", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})
        
        const master = await master_shop.find()
        console.log("master" , master);

        // const transfer_data = await transfers.find()
        
        let transfer_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            transfer_data = await transfers.find({ from_warehouse : staff_data.warehouse });
        }else{
            transfer_data = await transfers.aggregate([
              
        
                {
                  $unwind: "$product"
                },
                {
                  $group: {
                    _id: "$_id",
                    invoice: { $first: "$invoice" },
                    date: { $first: "$date" },
                    from_warehouse: { $first: "$from_warehouse" },
                    to_warehouse: { $first: "$to_warehouse" },
                    from_room_name: { $addToSet: "$product.from_room_name" },
                    to_room_name: { $addToSet: "$product.to_room_name" },
                    finalize: { $first: "$finalize" },
                    isAllowEdit: { $first: "$isAllowEdit" }
                  }
                  
                },
                {
                  $project: {
                    _id: 1,
                    invoice: 1,
                    date: 1,
                    from_warehouse:1,
                    to_warehouse: 1,
                    from_room_name: 1,
                    to_room_name: 1,
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

        res.render("transfer", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            transfer: transfer_data,
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


    const new_purchase = await transfers.findOne({ invoice: "TRF-"+random });
    if (new_purchase && new_purchase.length > 0) {
        IDInvoice = "TRF-"+random;
    }else{
        IDInvoice = "TRF-"+random; 
    }
    return IDInvoice ;
}


router.get("/view/add_transfer", auth, async(req, res) => {
    try{
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        // const warehouse_data = await warehouse.find({status : 'Enabled'})
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        name: staff_data.warehouse, 
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
        var rooms_data = ["Ambient", "Enclosed", "Return Rooms"];


        const transfer_data = await transfers.find({})
        const invoice_noint = transfer_data.length + 1
        const invoice_no = "TRF-" + invoice_noint.toString().padStart(5, "0")


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
        const randominv = getRandom8DigitNumber();

        randominv.then(invoicedata => {
            res.render("add_transfer", {
                success: req.flash('success'),
                errors: req.flash('errors'),
                role : role_data,
                profile : profile_data,
                master_shop : master,
                warehouse: warehouse_data,
                language : lan_data,
                rooms_data,
                invoice: invoicedata
            })
        }).catch(error => {
            req.flash('errors', `There's a error in this transaction`)
            res.redirect("/transfer/view");
        })
        
    }catch(error){
        console.log(error);
    }
})

router.post("/view/add_transfer", auth, async(req, res) => {
    try{
        console.log(req.body);
        const {date, from_warehouse, FromRoom_name, to_warehouse, ToRoom_name, prod_name, from_prod_qty, from_prod_level, from_prod_isle, from_prod_pallet, to_prod_qty, to_prod_level, to_prod_isle, to_prod_pallet, primary_code, secondary_code, product_code3, note, MaxStocks_data2, invoice, expiry_date} = req.body

        
        // res.status(200).json({ message:req.body} )
        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            
            var from_qty_array = [req.body.from_prod_qty]
            var from_level_array = [req.body.from_prod_level]

        

            var to_qty_array = [req.body.New_Qty_Converted]
            var to_level_array = [req.body.to_prod_level]

            
            var primary_code_array = [req.body.primary_code]
            var secondary_code_array = [req.body.secondary_code]
            var product_code3_array = [req.body.product_code3]
            var MaxStocks_data2_array = [req.body.MaxStocks_data2]

            var unit_array = [req.body.primary_unit]
            var secondary_unit_array = [req.body.secondary_unit]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]

            var max_per_unit_array = [req.body.max_per_unit]
            var production_date_array = [req.body.production_date]
            var prod_cat_array = [req.body.prod_cat]

            var RoomAssigned_array = [req.body.RoomAssigned]
            var ToRoomAssigned_array = [req.body.ToRoomAssigned]
            
            
            var from_invoice_array = [req.body.from_invoice]
            var to_invoice_array = [req.body.to_invoice]

            var id_transaction_array = [req.body.id_transaction]
        }else{
            var product_name_array = [...req.body.prod_name]

            

            var from_qty_array = [...req.body.from_prod_qty]
            var from_level_array = [...req.body.from_prod_level]

        
            
            var to_qty_array = [...req.body.New_Qty_Converted]
            var to_level_array = [...req.body.to_prod_level]

            
            var primary_code_array = [...req.body.primary_code]
            var secondary_code_array = [...req.body.secondary_code]
            var product_code3_array = [...req.body.product_code3]
            var MaxStocks_data2_array = [...req.body.MaxStocks_data2]

            var unit_array = [...req.body.primary_unit]
            var secondary_unit_array = [...req.body.secondary_unit]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]

            var max_per_unit_array = [...req.body.max_per_unit]
            var production_date_array = [...req.body.production_date]
            var prod_cat_array = [...req.body.prod_cat]

            var RoomAssigned_array = [...req.body.RoomAssigned]
            var ToRoomAssigned_array = [...req.body.ToRoomAssigned]
            var from_invoice_array = [...req.body.from_invoice]
            var to_invoice_array = [...req.body.to_invoice]
            var id_transaction_array = [...req.body.id_transaction]
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        from_qty_array.forEach((value,i) => {
            newproduct[i].from_quantity = value
        });

        from_invoice_array.forEach((value,i) => {
            newproduct[i].from_invoice = value
        });
        to_invoice_array.forEach((value,i) => {
            newproduct[i].To_invoice = value
        });


        id_transaction_array.forEach((value, i) => {
            newproduct[i].id_transaction_id = value
        })


        from_level_array.forEach((value, i) => {
            RoomAssigned_array.forEach((valueRoom, a) => {

                if(valueRoom == "Receiving Area" && i == a){

                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].from_storage = value[0]
                    newproduct[i].from_rack = value[1]
                    newproduct[i].from_bay = 0
                    newproduct[i].from_bin = 0
                    newproduct[i].from_types = "Floor"
                    newproduct[i].from_floorlevel = resultValueFloorLevel
                }else if(valueRoom == "Shelves" && i == a){
                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].from_storage = value[0]
                    newproduct[i].from_rack = value[1]
                    newproduct[i].from_bay = 0
                    newproduct[i].from_bin = 0
                    newproduct[i].from_types = "Floor"
                    newproduct[i].from_floorlevel = value[5]
                }else if(i == a){


                    if(value[0] == "A" && value[1] == "L" && value[2] == "L"){
                        console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value + "here")

                        newproduct[i].from_storage = value[0]
                        newproduct[i].from_rack = value[1]
                        newproduct[i].from_bay = 0
                        newproduct[i].from_bin = 0
                        newproduct[i].from_types = "Floor"
                        newproduct[i].from_floorlevel = value[3]

                    }else{
                        var valData;
                        if(value[4] == "L"){
                            valData = "Level";
                        }else if(value[4] == "F"){
                            valData = "Floor";
                        }

                        // console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value)
                        newproduct[i].from_storage = value[0]
                        newproduct[i].from_rack = value[1]
                        newproduct[i].from_bay = value[2]
                        newproduct[i].from_bin = value[3]
                        newproduct[i].from_types = valData
                        newproduct[i].from_floorlevel = value[5]
                    }
                }
    
            })
        })

   
        
        
        
        
        to_qty_array.forEach((value,i) => {
            newproduct[i].to_quantity = value
        });

        to_level_array.forEach((value, i) => {
            ToRoomAssigned_array.forEach((valueRoom, a) => {

                if(valueRoom == "Receiving Area" && i == a){

                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].to_bay = 0
                    newproduct[i].to_bin = 0
                    newproduct[i].to_types = "Floor"
                    newproduct[i].to_floorlevel = resultValueFloorLevel
                }else if(valueRoom == "Shelves" && i == a){
                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].to_bay = 0
                    newproduct[i].to_bin = 0
                    newproduct[i].to_types = "Floor"
                    newproduct[i].to_floorlevel = value[5]
                }else if(i == a){

                    if(value[0] == "A" && value[1] == "L" && value[2] == "L"){
                        console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value + "here")

                        newproduct[i].storage = value[0]
                        newproduct[i].rack = value[1]
                        newproduct[i].to_bay = 0
                        newproduct[i].to_bin = 0
                        newproduct[i].to_types = "Floor"
                        newproduct[i].to_floorlevel = value[3]

                    }else{
                        var valData;
                        if(value[4] == "L"){
                            valData = "Level";
                        }else if(value[4] == "F"){
                            valData = "Floor";
                        }

                        // console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value)
                        newproduct[i].storage = value[0]
                        newproduct[i].rack = value[1]
                        newproduct[i].to_bay = value[2]
                        newproduct[i].to_bin = value[3]
                        newproduct[i].to_types = valData
                        newproduct[i].to_floorlevel = value[5]
                    }
                }
    
            })
        })

        




        
        primary_code_array.forEach((value,i) => {
            newproduct[i].primary_code = value
        });
        
        secondary_code_array.forEach((value,i) => {
            newproduct[i].secondary_code = value
        });
        
        product_code3_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });

        MaxStocks_data2_array.forEach((value, i) => {
            newproduct[i].maxProducts = value
        })



        unit_array.forEach((value, i) => {
            newproduct[i].unit = value
        })


        secondary_unit_array.forEach((value, i) => {
            newproduct[i].secondary_unit = value
        })


        batch_code_array.forEach((value, i) => {
            newproduct[i].batch_code = value
        })


        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })




        max_per_unit_array.forEach((value, i) => {
            newproduct[i].maxperunit = value
        })


        production_date_array.forEach((value, i) => {
            newproduct[i].production_date = value
        })


        prod_cat_array.forEach((value, i)=>{
            newproduct[i].prod_cat = value
        })


        RoomAssigned_array.forEach((value, i) => {
            newproduct[i].from_room_name = value
        })


        ToRoomAssigned_array.forEach((value, i) => {
            newproduct[i].to_room_name = value
        })

       
        const Newnewproduct = newproduct.filter(obj => obj.to_quantity !== "0" && obj.to_quantity !== "" || obj.to_floorlevel !== "0" && obj.to_floorlevel !== "");

        // res.json(Newnewproduct);
        // return
        
        const data = new transfers({ date, from_warehouse, to_warehouse, product:Newnewproduct, note, invoice })
        const transfers_data = await data.save()


        req.flash('success', `Product Transfer successfully`)
        res.redirect("/transfer/preview/"+transfers_data._id)

    }catch(error){
        console.log(error);
        res.status(200).json({ errorMessage: error.message})
    }
})


router.get("/preview/:id", auth, async(req, res) => {
    try { 
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);


        const transfer_data = await transfers.findById(req.params.id)
        
        let expiry_date = new Date(transfer_data.expiry_date)
        let ed_day = ('0' + expiry_date.getDate()).slice(-2)
        let ed_month = ('0' + (expiry_date.getMonth() + 1)).slice(-2)
        let ed_year = expiry_date.getFullYear()
        let ed_fullDate = `${ed_year}-${ed_month}-${ed_day}`
        // const warehouse_data = await warehouse.find({status : 'Enabled'})
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse, "warehouse_category": "Raw Materials" });
        }else{
            warehouse_data = await warehouse.find({status : 'Enabled' , "warehouse_category": "Raw Materials"});
        }

        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": transfer_data.from_warehouse }
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
                    expiry_date: { $first: "$product_details.expiry_date"},
                    production_date: { $first: "$product_details.production_date" },
                    room: { $first: "$room" }
                }
            },
        ])

        // const RoomAll = transfer_data.product;
        // const results = [];
        // async function fetchStockData(value) {
        //     const stock_data = await warehouse.aggregate([
        //         {
        //             $match: { 
        //                 "name": transfer_data.from_warehouse,
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
        //                 expiry_date: { $first: "$product_details.expiry_date"},
        //                 production_date: { $first: "$product_details.production_date" },
        //                 from_room: { $first: "$room" }
        //             }
        //         },
        //     ])

        //     results.push(stock_data);

        // }


        // const promises = RoomAll.map((value) => fetchStockData(value.from_room_name));
        // await Promise.all(promises);


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

        res.render("edit_transfer_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            warehouse: warehouse_data,
            transfer: transfer_data,
            stock: stock_data,
            language : lan_data,
        
        })
        
    } catch (error) {
        console.log(error);
    }
})


router.post("/preview/:id", auth, async(req, res) => {
    try { 

        const _id = req.params.id;
        const { from_warehouse, FromRoom_name, to_warehouse, ToRoom_name} = req.body
        const data = await transfers.findById({_id});
       
        const promises = data.product.map(async(product_details) => {
            
                if(product_details.to_quantity > 0){
                    var from_warehouse_data = await warehouse.findOne({ name: data.from_warehouse, room: product_details.from_room_name, warehouse_category: "Raw Materials" });
                     
                    const match_data = from_warehouse_data.product_details.map((data) => {
                        if (data.product_name == product_details.product_name && data.floorlevel == product_details.from_floorlevel && data.type == product_details.from_types && data.bin == product_details.from_bin && data.bay == product_details.from_bay && data.rack == product_details.from_rack && data.storage == product_details.from_storage && data.expiry_date == product_details.expiry_date && data.batch_code == product_details.batch_code && data.production_date == product_details.production_date && data.invoice == product_details.from_invoice && data._id == product_details.id_transaction_id) {
                            data.product_stock = data.product_stock - product_details.to_quantity
                            
                        }

                    })
                } 

            return from_warehouse_data;
        })


        Promise.all(promises)
            .then(async (updatedWarehouseDataArray1) => {

                try {
                    
                    for (const warehouseData of updatedWarehouseDataArray1) {
                        await warehouseData.save();
                    }


                    try {

                        const promises2 = data.product.map( async (product_details) => {
                        
                            if(product_details.to_quantity > 0){
                                var to_warehouse_data = await warehouse.findOne({ name: data.to_warehouse, room: product_details.to_room_name, warehouse_category: "Raw Materials"  });
                                var x = 0;
                                const match_data = to_warehouse_data.product_details.map((data) => {
                                    if (data.product_name == product_details.product_name && data.floorlevel == product_details.to_floorlevel && data.type == product_details.to_types && data.bin == product_details.to_bin && data.bay == product_details.to_bay && data.rack == product_details.rack && data.storage == product_details.storage && data.expiry_date == product_details.expiry_date && data.batch_code == product_details.batch_code && data.production_date == product_details.production_date && data.invoice == product_details.To_invoice) {
                                        data.product_stock = data.product_stock + product_details.to_quantity
                                        x++
                                    }  
                                })
                
                
                                if (x == "0") {
                                    to_warehouse_data.product_details = to_warehouse_data.product_details.concat({ 
                                        product_name: product_details.product_name, 
                                        product_stock: product_details.to_quantity, 
                                        bay: product_details.to_bay, 
                                        bin: product_details.to_bin, 
                                        type: product_details.to_types , 
                                        floorlevel: product_details.to_floorlevel, 
                                        storage:product_details.storage, 
                                        rack: product_details.rack , 
                                        product_code: product_details.product_code, 
                                        primary_code: product_details.primary_code, 
                                        secondary_code: product_details.secondary_code, 
                                        maxProducts: product_details.maxProducts,
                                        storage: product_details.storage,
                                        rack: product_details.rack,
                                        expiry_date: product_details.expiry_date,
                                        maxPerUnit: product_details.maxperunit,
                                        batch_code: product_details.batch_code,
                                        production_date: product_details.production_date
                                    })
                                }
                            }
                
                            return to_warehouse_data;
                        })
    
    
    
                        Promise.all(promises2)
                            .then(async (updatedWarehouseDataArray) => {
                                try {
                               
                                    for (const warehouseData1 of updatedWarehouseDataArray) {
                                        
                                            await warehouse.updateOne({ _id: warehouseData1._id }, {
                                                $addToSet: {
                                                    product_details: { $each: warehouseData1.product_details }
                                                }
                                          });
                                      
                                        
                                    }
                            
                                    
                                    data.finalize = "True";
                                    const transfer_data = await data.save();
    
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
                                                            '<td style="border: 1px solid black;">' + product_list[n].to_quantity + '</td>' +
                                                            '<td style="border: 1px solid black;">' + product_list[n].unit + '</td>' +
                                                            '<td style="border: 1px solid black;">' + product_list[n].secondary_unit + '</td>' +
                                                            '<td style="border: 1px solid black;">' + data.to_warehouse + '</td>' +
                                                            '<td style="border: 1px solid black;">' + product_list[n].to_room_name + '</td>' +
                                                            '<td style="border: 1px solid black;">' + product_list[n].storage+product_list[n].rack+product_list[n].to_bay+product_list[n].to_bin+product_list[n].to_types[0]+product_list[n].to_floorlevel+ '</td>' 
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
                                        subject:'Transfer Mail',
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

                                    
                                    req.flash('success', `Transfer Finalize Successfully`)
                                    res.redirect("/picking_list/PDF_transfer_rm/"+transfer_data._id)
    
                                } catch (error) {
                                    console.error(error);
                                    res.status(500).json({ Perror: 'An error occurred while saving data.', message: error.message });
                                }
                            })
                            .catch((error) => {
                                // Handle any errors that might have occurred during the process.
                                console.error(error);
                                res.status(500).json({ Perror: 'An error occurred.' });
                            });
                        
                    } catch (error) {
                        res.json(error)
                    }
                    
                    
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ Merror: 'An error occurred while saving data.', Message: error.message });
                }
            })
            .catch((error) => {
                // Handle any errors that might have occurred during the process.
                console.error(error);
                res.status(500).json({ Merror: 'An error occurred.' });
            });
      


        // const to_warehouse_data = await warehouse.findOne({ name: to_warehouse, room: ToRoom_name });


        // data.product.forEach(product_details => {
        //     // console.log("if product_details", product_details);
        //     if(product_details.to_quantity > 0){
        //         var x = 0;
        //         const match_data = to_warehouse_data.product_details.map((data) => {
        //             // console.log("map", data);
                    
        //                 // if (data.product_name == product_details.product_name && data.pallet == product_details.to_pallet ) {
        //                 if (data.product_name == product_details.product_name && data.floorlevel == product_details.to_floorlevel && data.type == product_details.to_types && data.bin == product_details.to_bin && data.bay == product_details.to_bay && data.rack == product_details.rack && data.storage == product_details.storage && data.expiry_date == product_details.expiry_date && data.batch_code == product_details.batch_code && data.production_date == product_details.production_date) {
        //                     data.product_stock = data.product_stock + product_details.to_quantity
        //                     x++
        //                 }
                    
        //         })

        //         if (x == "0") {
        //             to_warehouse_data.product_details = to_warehouse_data.product_details.concat({ 
        //                 product_name: product_details.product_name, 
        //                 product_stock: product_details.to_quantity, 
        //                 bay: product_details.to_bay, 
        //                 bin: product_details.to_bin, 
        //                 type: product_details.to_types , 
        //                 floorlevel: product_details.to_floorlevel, 
        //                 storage:product_details.storage, 
        //                 rack: product_details.rack , 
        //                 product_code: product_details.product_code, 
        //                 primary_code: product_details.primary_code, 
        //                 secondary_code: product_details.secondary_code, 
        //                 maxProducts: product_details.maxProducts,
        //                 storage: product_details.storage,
        //                 rack: product_details.rack,
        //                 expiry_date: product_details.expiry_date,
        //                 maxPerUnit: product_details.maxperunit,
        //                 batch_code: product_details.batch_code,
        //                 production_date: product_details.production_date
        //             })
        //         }
        //     }  
        //     // console.log("final", to_warehouse_data);
        // })

        // await to_warehouse_data.save()

        


        
            
       
    } catch (error) {
        console.log(error);
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



router.get("/view/:id", auth, async(req, res) => {
    try { 
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
       


        const transfer_data = await transfers.findById(req.params.id)
  
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        name: staff_data.warehouse, 
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
        }else{
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

        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": transfer_data.from_warehouse, "warehouse_category" : "Raw Materials" }
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
                    expiry_date: { $first: "$product_details.expiry_date"},
                    production_date: { $first: "$product_details.production_date" },
                    room: { $first: "$room" }
                }
            },
        ])
        

        const product_data = await product.find({})
        const dataSelected = BayBinSelected(transfer_data.to_warehouse, transfer_data.to_room);
        // res.json(dataSelected)

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

        res.render("edit_transfer", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            warehouse: warehouse_data,
            transfer: transfer_data,
            stock: stock_data,
            unit: product_data,
            language : lan_data,
            
        })
        
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth, async(req, res) => {
    try {
        const _id = req.params.id
        

        const transfer_data = await transfers.findById(_id)
       
        res.json(req.body);
        return

        const {date, from_warehouse, FromRoom_name, to_warehouse, ToRoom_name, prod_name, from_prod_qty, from_prod_level, from_prod_isle, from_prod_pallet, to_prod_qty, to_prod_level, to_prod_isle, to_prod_pallet, primary_code, secondary_code, product_code3, note, invoice, expiry_date} = req.body


        // res.status(200).json( req.body)
        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            
            var from_qty_array = [req.body.from_prod_qty]
            var from_level_array = [req.body.from_prod_level]
            var from_isle_array = [req.body.from_prod_isle]
            var from_pallet_array = [req.body.from_prod_pallet]
            var from_types_array = [req.body.from_types]
        

            var to_qty_array = [req.body.to_prod_qty]
            var to_level_array = [req.body.to_prod_level]
            var to_isle_array = [req.body.to_prod_isle]
            var to_pallet_array = [req.body.to_prod_pallet]
            var to_types_array = [req.body.to_types]
            var storage_array = [req.body.storage]
            var rak_array = [req.body.rak]
            
            var primary_code_array = [req.body.primary_code]
            var secondary_code_array = [req.body.secondary_code]
            var product_code3_array = [req.body.product_code3]
            var MaxStocks_data2_array = [req.body.MaxStocks_data2]

            var unit_array = [req.body.unit]
            var secondary_unit_array = [req.body.secondary_unit]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            var from_storage_array = [req.body.from_storage]
            var from_rak_array = [req.body.from_rak]
            
            
            
        }else{
            var product_name_array = [...req.body.prod_name]
            var storage_array = [...req.body.storage]
            var rak_array = [...req.body.rak]
            var from_types_array = [...req.body.from_types]
            var to_types_array = [...req.body.to_types]
            

            var from_qty_array = [...req.body.from_prod_qty]
            var from_level_array = [...req.body.from_prod_level]
            var from_isle_array = [...req.body.from_prod_isle]
            var from_pallet_array = [...req.body.from_prod_pallet]
        
            
            var to_qty_array = [...req.body.to_prod_qty]
            var to_level_array = [...req.body.to_prod_level]
            var to_isle_array = [...req.body.to_prod_isle]
            var to_pallet_array = [...req.body.to_prod_pallet]
            
            var primary_code_array = [...req.body.primary_code]
            var secondary_code_array = [...req.body.secondary_code]
            var product_code3_array = [...req.body.product_code3]
            var MaxStocks_data2_array = [...req.body.MaxStocks_data2]

            var unit_array = [...req.body.unit]
            var secondary_unit_array = [...req.body.secondary_unit]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]

            var from_storage_array = [...req.body.from_storage]
            var from_rak_array = [...req.body.from_rak]
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        from_qty_array.forEach((value,i) => {
            newproduct[i].from_quantity = value
        });

        from_level_array.forEach((value,i) => {
            newproduct[i].from_bay = value
        });
        
        
        from_isle_array.forEach((value,i) => {
            newproduct[i].from_bin = value
        });
        
        from_pallet_array.forEach((value,i) => {
            newproduct[i].from_floorlevel = value
        });
        
        
        
        to_qty_array.forEach((value,i) => {
            newproduct[i].to_quantity = value
        });
        
        to_level_array.forEach((value,i) => {
            newproduct[i].to_bay = value
        });
        to_isle_array.forEach((value,i) => {
            newproduct[i].to_bin = value
        });
        to_pallet_array.forEach((value,i) => {
            newproduct[i].to_floorlevel = value
        });
        
        primary_code_array.forEach((value,i) => {
            newproduct[i].primary_code = value
        });
        
        secondary_code_array.forEach((value,i) => {
            newproduct[i].secondary_code = value
        });
        
        product_code3_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });

        MaxStocks_data2_array.forEach((value, i) => {
            newproduct[i].maxProducts = value
        })



        unit_array.forEach((value, i) => {
            newproduct[i].unit = value
        })


        secondary_unit_array.forEach((value, i) => {
            newproduct[i].secondary_unit = value
        })


        batch_code_array.forEach((value, i) => {
            newproduct[i].batch_code = value
        })


        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })


       storage_array.forEach((value, i) => {
            newproduct[i].storage = value
       })
       rak_array.forEach((value, i) => {
                newproduct[i].rack = value
        })
       from_types_array.forEach((value, i) => {
                newproduct[i].from_types = value
        })

       to_types_array.forEach((value, i) => {
                newproduct[i].to_types = value
        })


        from_storage_array.forEach((value, i) => {
            newproduct[i].from_storage = value
        })
        from_rak_array.forEach((value, i) => {
            newproduct[i].from_rack = value
        })
        
        const Newnewproduct = newproduct.filter(obj => obj.to_quantity !== "0" && obj.to_quantity !== "" || obj.to_floorlevel !== "0" && obj.to_floorlevel !== "");

        var error = 0
        Newnewproduct.forEach(data => {
            if (parseInt(data.from_quantity) < parseInt(data.to_quantity)) {
                
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `Must not be greater than stock Qty`)
            return res.redirect("back")
        }




        const old_from_warehouse_data = await warehouse.findOne({ name: transfer_data.from_warehouse, room: transfer_data.from_room });

        transfer_data.product.forEach(product_details => {
            // console.log("if product_details", product_details);

            if(product_details.to_quantity > 0){
                const match_data = old_from_warehouse_data.product_details.map((data) => {
                    // console.log("map", data);

                    // if (data.product_name == product_details.product_name && data.pallet == product_details.from_pallet) {
                    if (data.product_name == product_details.product_name && data.floorlevel == product_details.from_floorlevel && data.type == product_details.from_types && data.bin == product_details.from_bin && data.bay == product_details.from_bay && data.rack == product_details.from_rack && data.storage == product_details.from_storage) {
                        data.product_stock = parseInt(data.product_stock) + parseInt(product_details.to_quantity)
                        
                    }

                })
            }
            // console.log("final", old_from_warehouse_data);
        })

        await old_from_warehouse_data.save()



        const old_to_warehouse_data = await warehouse.findOne({ name: transfer_data.to_warehouse, room: transfer_data.to_room });

        transfer_data.product.forEach(product_details => {
            // console.log("if product_details", product_details);
            if(product_details.to_quantity > 0){
                const match_data = old_to_warehouse_data.product_details.map((data) => {
                    // console.log("map", data);

                    // if (data.product_name == product_details.product_name && data.pallet == product_details.to_pallet) {
                    if (data.product_name == product_details.product_name && data.floorlevel == product_details.to_floorlevel && data.type == product_details.to_types && data.bin == product_details.to_bin && data.bay == product_details.to_bay && data.rack == product_details.rack && data.storage == product_details.storage) {
                        data.product_stock = parseInt(data.product_stock) - parseInt(product_details.to_quantity)
                    
                    }

                })
            }
            // console.log("final", old_to_warehouse_data);
        })

        await old_to_warehouse_data.save()



        
        transfer_data.date = date
        transfer_data.from_warehouse = from_warehouse
        transfer_data.to_warehouse = to_warehouse
        transfer_data.product = Newnewproduct
        transfer_data.note = note
        transfer_data.invoice = invoice
        // transfer_data.expiry_date = expiry_date

        const data = await transfer_data.save()
        console.log(data);



        const from_warehouse_data = await warehouse.findOne({ name: from_warehouse, room: FromRoom_name });

        data.product.forEach(product_details => {
            // console.log("if product_details", product_details);

            if(product_details.to_quantity > 0){
                const match_data = from_warehouse_data.product_details.map((data) => {
                    // console.log("map", data);

                    // if (data.product_name == product_details.product_name && data.pallet == product_details.from_pallet) {
                        if (data.product_name == product_details.product_name && data.floorlevel == product_details.from_floorlevel && data.type == product_details.from_types && data.bin == product_details.from_bin && data.bay == product_details.from_bay && data.rack == product_details.from_rack && data.storage == product_details.from_storage) {
                        data.product_stock = parseInt(data.product_stock) - parseInt(product_details.to_quantity)
                        
                    }

                })
           }
            // console.log("final", from_warehouse_data);
        })

        await from_warehouse_data.save()



        const to_warehouse_data = await warehouse.findOne({ name: to_warehouse, room: ToRoom_name });

        data.product.forEach(product_details => {
            // console.log("if product_details", product_details);
            if(product_details.to_quantity > 0){
                var x = 0;
                const match_data = to_warehouse_data.product_details.map((data) => {
                    // console.log("map", data);

                    // if (data.product_name == product_details.product_name && data.pallet == product_details.from_pallet) {
                    if (data.product_name == product_details.product_name && data.floorlevel == product_details.to_floorlevel && data.type == product_details.to_types && data.bin == product_details.to_bin && data.bay == product_details.to_bay && data.rack == product_details.rack && data.storage == product_details.storage) {
                        data.product_stock = parseInt(data.product_stock) + parseInt(product_details.to_quantity)
                        x++
                    }

                })

                if (x == "0") {
                    to_warehouse_data.product_details = to_warehouse_data.product_details.concat({  
                        product_name: product_details.product_name, 
                        product_stock: product_details.to_quantity, 
                        bay: product_details.to_bay, 
                        bin: product_details.to_bin, 
                        type: product_details.to_types , 
                        floorlevel: product_details.to_floorlevel, 
                        storage:product_details.storage, 
                        rack: product_details.rack , 
                        product_code: product_details.product_code, 
                        primary_code: product_details.primary_code, 
                        secondary_code: product_details.secondary_code, 
                        maxProducts: product_details.maxProducts,
                        storage: product_details.storage,
                        rack: product_details.rack
                    })
                }
            } 
            // console.log("final", to_warehouse_data);
        })

        await to_warehouse_data.save()
        
        req.flash('success', `Transfer Edit Successfully`)
        res.redirect("/transfer/view")

    } catch (error) {
        console.log(error);
    }
})

// router.post("/barcode_scanner", async(req, res) => {
//     try{
//         const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, primary_code } = req.body 
    
        
        
//         const warehouse_data = await warehouse.aggregate([
//                 {
//                     $match: { "name": FromWareHouse, room: FromRoom }
//                 },
//                 {
//                     $unwind: "$product_details"
//                 },
//                 {
//                     $match: { "product_details.primary_code" : primary_code }
//                 },
//                 {
//                     $group: {
//                     //   _id: "$product_details._id",
//                     //   name: { $first: "$product_details.product_name"},
//                     //   primary_code: { $first: "$product_details.primary_code" } ,
//                     //   secondary_code: { $first: "$product_details.secondary_code" } ,
//                     //   product_code: { $first: "$product_details.product_code" } ,
//                     //   instock: { $first: "$product_details.product_stock" } ,
//                     //   warehouse: { $first: "$name" },
//                     //   level: { $first: "$product_details.level" },
//                     //   isle: { $first: "$product_details.isle" },
//                     //   pallet: { $first: "$product_details.pallet" },
//                     //   maxProducts: { $first: "$product_details.maxProducts" },
//                     //   unit: { $first: "$product_details.unit" },
//                     //   secondary_unit: { $first: "$product_details.secondary_unit" },
//                         _id: "$product_details._id",
//                         name: { $first: "$product_details.product_name" },
//                         instock: { $first: "$product_details.product_stock" },
//                         primary_code: { $first: "$product_details.primary_code" },
//                         secondary_code: {$first: "$product_details.secondary_code" },
//                         product_code: { $first: "$product_details.product_code" },
//                         level: { $first: "$product_details.bay" },
//                         isle: { $first: "$product_details.bin" },
//                         type: { $first: "$product_details.type" },
//                         pallet: { $first: "$product_details.floorlevel" },
//                         unit: { $first: "$product_details.unit" },
//                         secondary_unit: { $first: "$product_details.secondary_unit" },
//                         storage: { $first: "$product_details.storage" },
//                         rack: { $first: "$product_details.rack" },
//                         expiry_date : { $first: "$product_details.expiry_date" },
//                         maxPerUnit: { $first: "$product_details.maxPerUnit" },
//                         batch_code: { $first: "$product_details.batch_code"},
//                         production_date: { $first: "$product_details.production_date" }
//                     }
//                 },
            
            
//             ])
        
//         res.status(200).json(warehouse_data)
        
//     }catch(error){
//         res.status(404).json({ message : error.message })    
//     }
// })


// router.post("/barcode_scanner", async(req, res) => {
//     try{
//         const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, primary_code } = req.body 
    
        
//         var checkBy;
//         const warehouse_data = await warehouse.aggregate([
//                 {
//                     $match: { "name": FromWareHouse, room: FromRoom }
//                 },
//                 {
//                     $unwind: "$product_details"
//                 },
//                 {
//                     $match: { "product_details.primary_code" : primary_code }
//                 },
//                 {
//                     $group: {
//                         _id: "$product_details._id",
//                         name: { $first: "$product_details.product_name" },
//                         instock: { $first: "$product_details.product_stock" },
//                         primary_code: { $first: "$product_details.primary_code" },
//                         secondary_code: {$first: "$product_details.secondary_code" },
//                         product_code: { $first: "$product_details.product_code" },
//                         level: { $first: "$product_details.bay" },
//                         isle: { $first: "$product_details.bin" },
//                         type: { $first: "$product_details.type" },
//                         pallet: { $first: "$product_details.floorlevel" },
//                         unit: { $first: "$product_details.unit" },
//                         secondary_unit: { $first: "$product_details.secondary_unit" },
//                         storage: { $first: "$product_details.storage" },
//                         rack: { $first: "$product_details.rack" },
//                         expiry_date: { $first: "$product_details.expiry_date" },
//                         production_date: { $first: "$product_details.production_date" },
//                         batch_code: { $first: "$product_details.batch_code" },
//                         maxPerUnit: { $first: "$product_details.maxPerUnit" },
//                         prod_cat: { $first: "P" }
//                     }
//                 },
            
            
//             ])


//             const warehouse_data2 = await warehouse.aggregate([
//                 {
//                     $match: { "name": FromWareHouse, room: FromRoom }
//                 },
//                 {
//                     $unwind: "$product_details"
//                 },
//                 {
//                     $match: { "product_details.secondary_code" : primary_code }
//                 },
//                 {
//                     $group: {
//                         _id: "$product_details._id",
//                         name: { $first: "$product_details.product_name" },
//                         instock: { $first: "$product_details.product_stock" },
//                         primary_code: { $first: "$product_details.primary_code" },
//                         secondary_code: {$first: "$product_details.secondary_code" },
//                         product_code: { $first: "$product_details.product_code" },
//                         level: { $first: "$product_details.bay" },
//                         isle: { $first: "$product_details.bin" },
//                         type: { $first: "$product_details.type" },
//                         pallet: { $first: "$product_details.floorlevel" },
//                         unit: { $first: "$product_details.unit" },
//                         secondary_unit: { $first: "$product_details.secondary_unit" },
//                         storage: { $first: "$product_details.storage" },
//                         rack: { $first: "$product_details.rack" },
//                         expiry_date: { $first: "$product_details.expiry_date" },
//                         production_date: { $first: "$product_details.production_date" },
//                         batch_code: { $first: "$product_details.batch_code" },
//                         maxPerUnit: { $first: "$product_details.maxPerUnit" },
//                         prod_cat: { $first: "S" }
//                     }
//                 },
            
            
//             ])

//             if(warehouse_data.length > 0){
//                 checkBy = warehouse_data;
//             }else if(warehouse_data2.length > 0){
//                 checkBy = warehouse_data2;
//             }
        
//         res.status(200).json(checkBy)
        
//     }catch(error){
//         res.status(404).json({ message : error.message })    
//     }
// })


router.post("/barcode_scanner", async (req, res) => {
    const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, primary_code , Roomslist } = req.body;
    const RoomAll = Roomslist.split(",");
    const results = [];
    // console.log(req.body)
    // Define a function to fetch stock data asynchronously
    async function fetchStockData(value) {
        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": FromWareHouse, "room" : value }
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
                    instock: { $first: "$product_details.product_stock" },
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
                    batch_code: { $first: "$product_details.batch_code" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    prod_cat: { $first: "P" },
                    roomNamed : { $first: "$room" },
                    maxProducts: { $first : "$product_details.maxProducts" },
                    invoice_product: { $first : "$product_details.invoice" },
                }
            },
        ]);

        const stock_data2 = await warehouse.aggregate([
            
            {
                $match: { "name": FromWareHouse, "room" : value }
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
                    instock: { $first: "$product_details.product_stock" },
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
                    batch_code: { $first: "$product_details.batch_code" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    prod_cat: { $first: "S" },
                    roomNamed : { $first: "$room" },
                    maxProducts: { $first : "$product_details.maxProducts" },
                    invoice_product: { $first : "$product_details.invoice" },

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

router.post("/barcode_scanner2", async(req, res) => {
    try{
        const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, secondary_code } = req.body 
    
        
        
        const warehouse_data = await warehouse.aggregate([
                {
                    $match: { "name": FromWareHouse }
                },
                {
                    $unwind: "$product_details"
                },
                {
                    $match: { "product_details.secondary_code" : secondary_code }
                },
                {
                    $group: {
                      _id: "$product_details._id",
                      name: { $first: "$product_details.product_name"},
                      primary_code: { $first: "$product_details.primary_code" } ,
                      secondary_code: { $first: "$product_details.secondary_code" } ,
                      product_code: { $first: "$product_details.product_code" } ,
                      instock: { $first: "$product_details.product_stock" } ,
                      warehouse: { $first: "$name" },
                      level: { $first: "$product_details.level" },
                      isle: { $first: "$product_details.isle" },
                      pallet: { $first: "$product_details.pallet" },
                      maxProducts: { $first: "$product_details.maxProducts" },
                      unit: { $first: "$product_details.unit" },
                    }
                },
            
            
            ])
        
        res.status(200).json(warehouse_data)
        
    }catch(error){
        res.status(404).json({ message : error.message })    
    }
})

router.post("/barcode_scanner3", async(req, res) => {
    try{
        const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, product_code } = req.body 
    
        
        
        const warehouse_data = await warehouse.aggregate([
                {
                    $match: { "name": FromWareHouse }
                },
                {
                    $unwind: "$product_details"
                },
                {
                    $match: { "product_details.product_code" : product_code }
                },
                {
                    $group: {
                      _id: "$product_details._id",
                      name: { $first: "$product_details.product_name"},
                      primary_code: { $first: "$product_details.primary_code" } ,
                      secondary_code: { $first: "$product_details.secondary_code" } ,
                      product_code: { $first: "$product_details.product_code" } ,
                      instock: { $first: "$product_details.product_stock" } ,
                      warehouse: { $first: "$name" },
                      level: { $first: "$product_details.level" },
                      isle: { $first: "$product_details.isle" },
                      pallet: { $first: "$product_details.pallet" },
                      maxProducts: { $first: "$product_details.maxProducts" },
                      unit: { $first: "$product_details.unit" },
                    }
                },
            
            
            ])
        
        res.status(200).json(warehouse_data)
        
    }catch(error){
        res.status(404).json({ message : error.message })    
    }
})



router.post("/CheckingWarehouse", async (req, res) => {

    const {  level, isle, pallet, warehouses, room } = req.body

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