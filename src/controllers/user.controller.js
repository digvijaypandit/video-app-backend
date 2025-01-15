import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js'

const registerUser = asyncHandler(async (req,res) => {
    const {fullName,email,username,password} = req.body
    console.log(fullName, email, username, password)

    if (fullName === ""){
        throw new ApiError(400,"fullname is required");
    }
})

export {registerUser}