const User = require('../models/Users');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const otpStorage = new Map();



const generateNumericOTP = () => {
    const length = 6;
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
    }
    return otp;
};

module.exports = {

    login: async (req, res) => {
        try {
            console.log("logincalsede", req)
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({ success: false, message: "Email / Password is missing " })
            }

            let findEmail = await User.find({ email: req.body.email });
            if (findEmail.length) {
                bcrypt.compare(req.body.password, findEmail[0].password, (err, result) => {
                    if (err) {
                        return res.status(400).json({ success: false, message: "Error from password", error: err });
                    } else if (result) {
                        return res.status(200).json({ success: false, message: "Login successful", data: findEmail[0] });
                    } else {
                        return res.status(400).json({ success: false, message: "Password is not matched" });
                    }
                });

            } else {
                return res.status(400).json({ success: false, message: "Email is dose not exists" });
            }

        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
    },

    create: async (req, res) => {

        console.log("pass - ", req)
        if (!req.body.email || !req.body.password || !req.body.fullName) {
            return res.status(400).json({ success: false, message: "Email / Name / Password is missing " })
        }

        if (req.body.email) {
            let findEmail = await User.find({ email: req.body.email });
            console.log("email = ", findEmail)
            if (findEmail.length) {
                return res.status(400).json({ success: false, message: "Email is already exists" })
            }
        }

        bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
                return res.status(400).json({ success: false, message: "Error from bcrypt password", error: error })
            } else {
                const users = new User({
                    userType: req.body.userType,
                    fullName: req.body.fullName,
                    email: req.body.email,
                    password: hash
                })
                try {
                    const a1 = await users.save();
                    res.json(a1);

                } catch (err) {
                    res.send(err);
                }
            }
        });





    },

    findAll: async (req, res) => {
        try {
            const users = await User.find();
            console.log("Get request from user");
            res.json(users);
        } catch (err) {
            console.log(err);
        }
    },
    findById: async (req, res) => {
        try {
            const users = await User.findById(req.params.id);
            console.log("Get request from user by id  - ");
            res.json(users);
        } catch (err) {
            console.log(err);
        }
    },

    updateData: async (req, res) => {

        console.log("data of patch = ", req.params.id);
        if (!req.params.id) {
            return res.status(400).json({ success: false, message: "Id is not found" })
        }
        const findData = await User.findById(req.params.id);
        if (!findData) {
            return res.status(400).json({ success: false, message: "User not found" })
        }

        if (req.body.email) {
            if (findData.email != req.body.email) {
                let findEmail = await User.find({ email: req.body.email });
                if (findEmail.length > 0) {
                    return res.status(400).json({ success: false, message: "Email is already exits" });
                }
            }
        }
        req.body.fullName = req.body.fullName || findData.fullName;
        // a.userType = req.body.userType,
        // a.firstName = req.body.firstName,
        // a.lastName = req.body.lastName,
        // a.address = req.body.address,
        // a.phone = req.body.phone,
        // a.state = req.body.state,
        // a.age = req.body.age,
        // a.pincode = req.body.pincode,
        // a.adhar_card = req.body.adhar_card,
        // a.email = req.body.email

        // const a1 = await a.save();
        const updateData = await User.findByIdAndUpdate(req.params.id, req.body);
        res.json(updateData);
    },
    deleteById: async (req, res) => {
        console.log("delete id : ", req.params.id);
        await User.findByIdAndDelete(req.params.id);
        console.log("successfull")
    },

    searchUser: async (req, res) => {
        try {
            console.log("search = ", req.params.params);
            const searchKeyword = req.params.params;

            // Using regular expression to perform case-insensitive search
            const searchRegex = new RegExp(searchKeyword, 'i');




            if (searchKeyword) {
                console.log("caleed");
                const findData = await User.find({
                    $or: [
                        { fullName: { $regex: searchKeyword, $options: 'i' } },
                        { email: { $regex: searchKeyword, $options: 'i' } }
                    ]
                });
                return res.status(200).json({ success: false, message: "Success ", data: findData })
            } else {
                const users = await User.find();
                console.log("Get request from user");
                return res.status(200).json({ success: false, message: "Success ", data: users })
            }

        } catch (error) {
            return res.status(400).json({ success: false, message: "Something is went wrong" })
        }
    },

    uploadAvatar: async (req, res) => {
        try {
            console.log("upload avatar == ", req.body.file.uri)
            cloudinary.uploader.upload(req.body.file.uri).then(result => {
                console.log("Result = ", result)
            }).catch(error => {
                console.log("error from cloudinary =  ", error);
            })
        } catch (error) {
            console.log("error = ", error);
        }
    },
    otpGenerate: async (req, res) => {
        try {
            console.log("otp = ", otpGenerator);
            const { phoneNumber } = req.body;

            // Generate OTP
            const otp = await generateNumericOTP();
            console.log("OTP --  ", otp)
            // Store OTP and associated user data (replace with database operation)
            otpStorage.set(phoneNumber, { otp, generationTime: new Date() });
            console.log("otpppp   --  ", otpStorage);

            // Your Twilio credentials
            const accountSid = 'AC9cb11d75c342a6d63d1c6983a7e3bbdc';
            const authToken = 'b8d9f827d4f0d35537ee1e203498739e';
            const twilioClient = twilio(accountSid, authToken);

            await twilioClient.messages
                .create({
                    body: `Your OTP is - ${otp} for ${phoneNumber} `,
                    from: '+15188726608',
                    to: `+${phoneNumber}`
                })
                .then(message => console.log(message.sid))


            return res.status(200).json({ success: true, message: "OTP Generate", otp: otp })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}