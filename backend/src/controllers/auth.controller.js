import express from "express";
import User from "../models/user.model.js"; 
import bcryptjs from "bcryptjs"
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;

    try {
        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        
        // Hash the password before saving
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({ email, fullName, password: hashedPassword });

        // create jwt
        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                message: "User created successfully",
                user: newUser
            });
        } else {
            res.status(400).json({ message: "Invalid User details" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message)
        res.status(500).json({ message: "Internal Server Error", error });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

    if (!email || !password) {
        return res.status(401).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    generateToken(user._id, res);
    res.status(200).json({ message: "Login successful", user });
   } catch (error) {
       console.log("Error in login controller", error.message);
       res.status(500).json({ message: "Internal Server Error", error });
   }
}

export const logout = (req, res) => {
    try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logout successful" });        
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error", error });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(profilePic);

        // Update user profile
        await User.findByIdAndUpdate(userId, { profilePic: result.secure_url }, { new: true });

        res.status(200).json({ message: "Profile updated successfully", profilePic: result.secure_url });
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error", error });
    }
}

export const checkAuth = (req, res) => {
    try{
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error", error });
    }
}
