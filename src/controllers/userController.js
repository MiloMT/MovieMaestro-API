import mongoose from 'mongoose'

const validateEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
}

const usersSchema = new mongoose.Schema({
    name: { 
        type: String, 
        trim: true,
        required: [true, "Name is required"],
        minlength: [3, "The name must be at least 3 characters long"],
        maxlength: [50, "The name can be a maximum of 50 characters long"]
    },
    email: { 
        type: String,
        trim: true,
        minlength: [5, "The Email address must be at least 5 characters long"],
        maxlength: [100, "The Email address can be a maximum of 100 characters long"],
        required: [true, "Email address is required"],
        unique: [true, "An account already exists with that email"],
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        trim: true,
        minlength: [5, "Your password must be a minimum of 5 characters long"],
        maxlength: [100, "The Email address can be a maximum of 100 characters long"],
        required: [true, "Password is required"]
    },
    language: {
        type: Object,
        properties: {
            value: { type: String, required: true },
            label: { type: String, required: true },
        },
    },
    streamingPlatform: [{ 
        "value": { type: String, required: true },
        "label": { type: String, required: true }
    }],
    region: {
        type: Object,
        properties: {
            value: { type: String, required: true },
            label: { type: String, required: true },
        },
    },
    watchList: [{ 
        "adult": { type: Boolean, required: true },
        "backdrop_path": { type: String, required: true },
        "genre_ids": [{ type: Number, required: true }],
        "id": { type: Number, required: true },
        "original_language": { type: String, required: true },
        "original_title": { type: String, required: true },
        "overview": { type: String, required: true },
        "popularity": { type: Number, required: true },
        "poster_path": { type: String, required: true },
        "release_date": { type: String, required: true },
        "title": { type: String, required: true },
        "video": { type: Boolean, required: true },
        "vote_average": { type: Number, required: true },
        "vote_count": { type: Number, required: true },
    }],
    wishList: [{ 
        "adult": { type: Boolean, required: true },
        "backdrop_path": { type: String, required: true },
        "genre_ids": [{ type: Number, required: true }],
        "id": { type: Number, required: true },
        "original_language": { type: String, required: true },
        "original_title": { type: String, required: true },
        "overview": { type: String, required: true },
        "popularity": { type: Number, required: true },
        "poster_path": { type: String, required: true },
        "release_date": { type: String, required: true },
        "title": { type: String, required: true },
        "video": { type: Boolean, required: true },
        "vote_average": { type: Number, required: true },
        "vote_count": { type: Number, required: true },
    }],
    isAdmin: {
        type: Boolean,
        default: false
    }
})

// Performs validation on user object prior to saving
usersSchema.pre("save", async function (next) {
    const validationError = this.validateSync()
    if (validationError) {
        return next(validationError)
    }
    next()
})

export default usersSchema