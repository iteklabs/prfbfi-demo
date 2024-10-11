const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, purchases } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");


router.get("/view", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})


        const master = await master_shop.find()
        console.log("master" , master);

        const find_data = await warehouse.find();
        var rooms_data = ["Rack 1", "Rack 2","Rack A", "Rack B",  "Rack C" ,"Rack D","Rack E","Rack F", "Receiving Area", "Shelves"];
        var rawfinished_data = ["Raw Materials", "Finished Goods"];
        var vategory_data = ["ALL", "Packaging", "Ingredients"];
        // console.log(find_data);

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

        res.render("warehouse",{
            success: req.flash('success'),
            errors: req.flash('errors'),
            user: find_data, 
            profile : profile_data,  
            master_shop : master,
            role : role_data,
            language : lan_data,
            rooms_data,
            rawfinished_data,
            vategory_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view", auth, async (req, res) => {
    try {
        const {name, address, status, Room_name, rawfinished, category_name } = req.body;

        const data = new warehouse({ name, address, status, room: Room_name, warehouse_category: rawfinished , category: category_name })

        const warehouse_name = await warehouse.findOne({ name:name, room: Room_name });
        if(warehouse_name){
            req.flash('errors', `${name} warehouse is alredy added. please choose another`)
        }else{
            req.flash('success', `${name} warehouse is add successfully`)
        }

        const userdata = await data.save();
        // console.log(userdata);

        res.redirect("/warehouse/view")
    } catch (error) {
        console.log(error);
    }
})


router.get("/view/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        
        const master = await master_shop.find()
        console.log("master" , master);

        const user_id = await warehouse.findById(_id)

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

        res.render("warehouse", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            master_shop : master,
            user: user_id,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const data = await warehouse.findById(_id);
        console.log("edit warehouse data", data.name);

        const { name, address, status, Room_name  } = req.body;

        
        

        // const purchases_data = await purchases.updateMany({warehouse_name:"Nike Warehouses"}, { $set: { warehouse_name: name } });
        const warehouse_data = await warehouse.findById(_id);
        console.log("edit warehouse warehouse_data", warehouse_data);

        
        const purchases_data = await purchases.find({ warehouse_name : data.name, room: Room_name})
        console.log("edit warehouse purchases_data", purchases_data);

        // const match_data = purchases_data.map((data) => {

        //     data.warehouse_name = name

        // })
        // console.log("Products find_data", purchases_data);

        data.name = name
        data.address = address
        data.status = status
        data.room = Room_name

        const new_data = await data.save();

        req.flash('success', `warehouse data update successfully`)
        res.redirect("/warehouse/view")
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;