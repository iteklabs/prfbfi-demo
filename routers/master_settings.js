const express = require("express");
const app = express();
const router = express.Router();
const multer  = require('multer');
const { profile, master_shop, email_settings, supervisor_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
var timezones = require('timezones-list');
const users = require("../public/language/languages.json");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/upload")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)

    }
})

const upload = multer({storage : storage});



router.get("/view", auth, async(req, res) => {
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
        
        res.render("master_settings", {
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

router.get("/:id", auth, async(req, res) => {
    try {
        console.log("language");
        console.log(req.params.id);

        const master = await master_shop.findOne()

        master.language = req.params.id
        await master.save()
        console.log("master" , master); 

    } catch (error) {
        console.log(error);
    }
})


router.post("/view/edit_settings", auth, upload.single("image"), async(req, res) => {
    try {
        const {site_title, currency, currency_placement, timezone} = req.body;
        if (req.body.hidden == 0) {
            
            const master_shop_data = await master_shop.findOne()
            console.log("master_shop_data", master_shop_data);
            
            if (master_shop_data == "") {
                
                const data = new master_shop({ site_title, image, currency, currency_placement, timezone});
                const master_data = await data.save()
                
            } else {

                master_shop_data.site_title = site_title
                master_shop_data.currency = currency
                master_shop_data.currency_placement = currency_placement
                master_shop_data.timezone = timezone
                await master_shop_data.save()      
            }
            
        } else {
            
            const image = req.file.filename;
            const master_shop_data = await master_shop.findOne()
            console.log("2nd master_shop_data" , master_shop_data);
            
            if (master_shop_data == null) {
                console.log("1" , site_title);

                const data = new master_shop({ site_title, image, currency, currency_placement, timezone});
                const master_data = await data.save()
                
            } else {
                
                console.log("2" , site_title);
                master_shop_data.site_title = site_title
                master_shop_data.image = image
                master_shop_data.currency = currency
                master_shop_data.currency_placement = currency_placement
                master_shop_data.timezone = timezone

                await master_shop_data.save()  
            }

        }

           
        req.flash('success', `shop setting edit successfully`)
        res.redirect("/master_shop/view")
    } catch (error) {
        console.log(error);
    }
})


router.get("/view/email", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const email_data = await email_settings.findOne()
        console.log("master settings email_data", email_data);

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

        res.render("email_settings", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            email : email_data,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})


router.post("/view/email/edit_settings", auth, async(req, res) => {
    try {
        const {host, port, email, password} = req.body

        const email_data = await email_settings.findOne()

        if (email_data == null) {
            
            const data = new email_settings({host, port, email, password})
            await data.save()
            
        } else {
            
            email_data.host = host
            email_data.port = port
            email_data.email = email
            email_data.password = password
            
            await email_data.save()
        }


        req.flash('success', `shop setting edit successfully`)
        res.redirect("/master_shop/view/email")
    } catch (error) {
        console.log(error);
    }
})



router.get("/view/supervisors", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const supervisor_data = await supervisor_settings.find()
        const profile_data = await profile.findOne({email : role_data.email})
        
        const master = await master_shop.find()

        const nDate = new Date().toLocaleString('en-US', {
            timeZone: master[0].timezone
        });


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
        
        res.render("supervisor_settings", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            supervisor_data: supervisor_data[0],
            timezones,
            language : lan_data
        }) 
    } catch (error) {
        console.log(error);
    }
})


router.post("/view/supervisors", auth,  async(req, res) => {
    try {
        const { rm_name, fg_name, rm_email,  fg_email, rm_mobilenum, fg_number} = req.body

        const supervisor_data = await supervisor_settings.findOne();

        if(supervisor_data == null){
            const data = new supervisor_settings({RMSName : rm_name, RMSEmail : rm_email, RMSnumber : rm_mobilenum, FGSName: fg_name , FGSEmail: fg_email , FGSnumber: fg_number})
            await data.save()
        } else {
            supervisor_data.RMSName = rm_name
            supervisor_data.RMSEmail = rm_email
            supervisor_data.RMSnumber = rm_mobilenum
            supervisor_data.FGSName = fg_name
            supervisor_data.FGSEmail = fg_email
            supervisor_data.FGSnumber = fg_number

            await supervisor_data.save();
        }

        
              
        req.flash('success', `shop setting edit successfully`)
        res.redirect("/master_shop/view/supervisors")
    } catch (error) {
        console.log(error);
    }
})


module.exports = router