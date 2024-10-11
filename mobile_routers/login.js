const express = require("express");
const app = express();
const router = express.Router();
const {sing_up, staff, profile, master_shop} = require("../models/all_models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require("../middleware/auth");




router.post("/login", async(req, res) => {
    try{

        // console.log(password)
        const email = req.body.email;
        
        const  useremail = await sing_up.findOne({email : email});
        // console.log("login useremail", useremail);

        if(!useremail){
            res.json({msgbox : "your email is not register"})
        }
        const staff_data1 = await staff.findOne({email : useremail.email})

        // res.json(staff_data1.warehouse_category)
        // var user_warehouse_cat = "All" ;
        var user_warehouse_cat = staff_data1.warehouse_category ;
        if(useremail.role == "staff"){
            const staff_data = await staff.findOne({email : useremail.email})
            // console.log("staff_data", staff_data);
            if (staff_data.status == "Disabled") {
                // req.flash('errors', `Your account is currently disabled by the Admin.`)
                res.json({msgbox : "Your account is currently disabled by the Admin.", data: staff_data1})
            }
        user_warehouse_cat = staff_data.warehouse_category ;

        }
       
        const password = req.body.password;

        const hash_pass = await bcrypt.compare(password, useremail.password)
        
        if(hash_pass == false){
            // req.flash('errors', `your password is wrong`)
            // return res.redirect("/login")
            res.json({msgbox : "login failed.", token: null, isValid: hash_pass, data: null})
        }

        const token = jwt.sign({username : useremail.username, email : useremail.email, role : useremail.role, warehouse_category: user_warehouse_cat }, process.env.secret_key)


        // res.cookie("jwt", token, {expires : new Date(Date.now() + 60000 * 60)})
        res.cookie("jwt", token, {expires : new Date(253402300000000)})
        res.json({msgbox : "login successfully.", token: token, isValid: hash_pass, data:staff_data1})
        // res.redirect("/index")
    }catch(error){
        console.log(error);
    }
})


router.get("/logout", (req, res) => {
    res.clearCookie("jwt")


    res.redirect('/login');
});



module.exports = router;