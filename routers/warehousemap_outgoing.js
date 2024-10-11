const express = require("express");
const app = express();
const router = express.Router();
const multer  = require('multer');
const { profile, master_shop, email_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
var timezones = require('timezones-list');
const users = require("../public/language/languages.json");





router.get("/view", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const nDate = new Date().toLocaleString('en-US', {
            timeZone: master[0].timezone
        });
        console.log("timezone",nDate);

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
        
        res.render("warehousemap_outgoing", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            timezones,
            language : lan_data
        }) 
    } catch (error) {
        console.log(error);
    }
})


module.exports = router