const express = require("express");
const app = express();
const router = express.Router();
const multer  = require('multer');
const { master_shop, profile, sing_up} = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");

var abc = 0
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/upload")
        abc++
        console.log("1111111", file.originalname);
    },
    filename: (req, file, cb) => {

        cb(null, Date.now() + file.originalname)
        console.log("1111111", file.originalname);
    }
})

const upload = multer({storage : storage});


router.get("/view", auth, async(req, res) => {
    try{
    // const {username, email, role} = req.user
    const role_data = req.user
    console.log(req.user.email);
    
    const profile_data = await profile.findOne({email : role_data.email})
    console.log("profile_data", profile_data);

    const master = await master_shop.find()
    console.log("master" , master);
        
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

    res.render("profile", {
        success: req.flash('success'),
        errors: req.flash('errors'),
        profile : profile_data,
        master_shop : master,
        role : role_data,
        language : lan_data
    })
    } catch(error){
        console.log(error);
    }
})

router.post("/view/:id", auth, upload.single("image"), async(req, res) => {
    try{
        const {firstname, lastname, email} = req.body;
        console.log("0000000000", abc);
        const data = await profile.findById(req.params.id)
        console.log("data", data);

        if (abc == 0) {
            console.log(222222222);
            const image = data.image;
            const _id = req.params.id
            console.log(req.body);
            console.log("img", image);
            console.log("_id", _id);
            const profile_data = await profile.findById(_id)
    
            profile_data.firstname = firstname
            profile_data.lastname = lastname
            profile_data.email = email
            profile_data.image = image
            console.log("profile_data", profile_data);
    
            await profile_data.save()

        } else {
            console.log(1111111111);
            const image = req.file.filename;
            const _id = req.params.id
            console.log(req.body);
            console.log("img", image);
            console.log("_id", _id);
            const profile_data = await profile.findById(_id)
    
            profile_data.firstname = firstname
            profile_data.lastname = lastname
            profile_data.email = email
            profile_data.image = image
            console.log("profile_data", profile_data);
    
            await profile_data.save()
        }


        req.flash("success", `Profile Edit successfully`)
        res.redirect("/profile/view")
    }catch(error){

        console.log(error);
    }
})


module.exports = router;