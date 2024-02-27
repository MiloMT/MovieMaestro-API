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
        value: { type: String },
        label: { type: String },
        },
    },
    streamingPlatform: [{ 
        "value": { type: String },
        "label": { type: String }
    }],
    region: {
        type: Object,
        properties: {
            value: { type: String },
            label: { type: String },
        },
    },
    watchList: [{ 
        "adult": { type: Boolean },
        "backdrop_path": { type: String },
        "genre_ids": [{ type: Number }],
        "id": { type: Number },
        "original_language": { type: String },
        "original_title": { type: String },
        "overview": { type: String },
        "popularity": { type: Number },
        "poster_path": { type: String },
        "release_date": { type: String },
        "title": { type: String },
        "video": { type: Boolean },
        "vote_average": { type: Number },
        "vote_count": { type: Number },
    }],
    wishList: [{ 
        "adult": { type: Boolean },
        "backdrop_path": { type: String },
        "genre_ids": [{ type: Number }],
        "id": { type: Number },
        "original_language": { type: String },
        "original_title": { type: String },
        "overview": { type: String },
        "popularity": { type: Number },
        "poster_path": { type: String },
        "release_date": { type: String },
        "title": { type: String },
        "video": { type: Boolean },
        "vote_average": { type: Number },
        "vote_count": { type: Number },
    }],
    isAdmin: {
        type: Boolean,
        default: false
    }
})

export default usersSchema