const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require('bcryptjs');
const {sing_up, staff, profile, master_shop} = require("../models/all_models");
const auth = require("../middleware/auth");



router.get("/sing_up", (req, res) => {

    res.render("sing_up", {
        success: req.flash('success'),
        errors: req.flash('errors'),
    })
});


router.post("/sing_up", async(req, res) => {
    try{
        console.log(req.body);
        const {name, email, password, role} = req.body;
        console.log(role);
        const hash = await bcrypt.hash(password, 10)
        
        const data = new sing_up({name, email, password:hash, role:"admin"})
        const userdata = await data.save();

        const new_profile = new profile({firstname: name, email})
        const profile_data = await new_profile.save();
        
        req.flash('success', `welcome ${name}`)
        res.redirect("/login");
    }catch(error){
        console.log(error);
    }
})


router.get("/sing_up_staff", async(req, res) => {
    try {
        const master = await master_shop.find()
        console.log("login master" , master);
    
        res.render("sing_up_staff", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            master_shop : master
        })  
    } catch (error) {
        console.log(error);
    }
});

router.post("/sing_up_staff", async(req, res) => {
    try{
        console.log(req.body);
        const {name, email, password, mobile} = req.body;
        
        const hash = await bcrypt.hash(password, 10)
        
        const data = new sing_up({name, email, password:hash, mobile, role:"staff"})
        const userdata = await data.save();


        const new_staff = new staff({name, email, mobile, status:"Disabled"})
        const staff_data = await new_staff.save();


        const new_profile = new profile({firstname: name, email})
        const profile_data = await new_profile.save();
        // console.log("hello");
        
        req.flash('success', `Your information will be sent to the administration for approval.!`)
        res.redirect("/sing_up_staff");
    }catch(error){
        console.log(error);
    }
})

module.exports = router;