import app from '../src/app.js'
import request from 'supertest'
import dotenv from "dotenv"

dotenv.config()


describe("GET /", () => {
    let res

    beforeAll(async () => {
        res = await request(app).get("/")
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
        
    })

    test("Correct JSON object is returned", async () => {
        expect(res.body.info).toBeDefined()
        expect(res.body.info).toBe("MovieMaestro API")
    })
})

describe("GET /users", () => {
    let adminToken
    let userToken
    let adminRes
    let userRes

    beforeAll(async () => {
        adminToken = await request(app).post("/users/login").send({
            email: "fake@fake.com",
            password: process.env.TEST_PASSWORD
        })

        userToken = await request(app).post("/users/login").send({ 
            "email": "fake3@fake.com",
            "password": process.env.TEST_PASSWORD
        })

        adminRes = await request(app).get("/users").set({
            Authorization: `Bearer ${adminToken.body.accessToken}`
        }).send()

        userRes = await request(app).get("/users").set({
            Authorization: `Bearer ${userToken.body.accessToken}`
        }).send()
    })

    test("Admin: Returns JSON with 200 Status", async () => {
        expect(adminRes.status).toBe(200)
        expect(adminRes.header["content-type"]).toContain("json")
    })

    test("Admin: Returns an array", () => {
        expect(adminRes.body).toBeInstanceOf(Array)
    })

    test("Admin: Array has at least 3 elements", () => {
        expect(adminRes.body.length).toBeGreaterThan(2)
    })

    test("Admin: One user is an object with key 'name' == 'Myles'", () => {
        expect(adminRes.body).toEqual(expect.arrayContaining([expect.objectContaining({ name: "Myles" })]))
    })

    test("User: Returns JSON with 200 Status", async () => {
        expect(userRes.status).toBe(200)
        expect(userRes.header["content-type"]).toContain("json")
    })

    test("User: Returns an array", () => {
        expect(userRes.body).toBeInstanceOf(Array)
    })

    test("User: Array has 1 element", () => {
        expect(userRes.body).toHaveLength(1)
    })

    test("User: The returned object has key 'name' == 'User'", () => {
        expect(userRes.body).toEqual(expect.arrayContaining([expect.objectContaining({ name: "User" })]))
    })
})

describe("POST /users", () => {
    let res
    let token
    let deletion

    beforeAll(async () => {
        res = await request(app).post("/users").send({
            "name": "Post Test",
            "email": "jest@test.com",
            "password": "password"
        })

        token = await request(app).post("/users/login").send({
            email: "jest@test.com",
            password: process.env.TEST_PASSWORD
        })
    })

    test("Returns JSON with 201 Status", async () => {
        expect(res.status).toBe(201)
        expect(res.header["content-type"]).toContain("json")
    })

    test("Body has name, email, password, streamingPlatform, watchList, wishList, isAdmin, _id & __v", () => {
        expect(res.body.name).toBeDefined()
        expect(res.body.email).toBeDefined()
        expect(res.body.password).toBeDefined()
        expect(res.body.streamingPlatform).toBeDefined()
        expect(res.body.watchList).toBeDefined()
        expect(res.body.wishList).toBeDefined()
        expect(res.body.isAdmin).toBeDefined()
        expect(res.body._id).toBeDefined()
        expect(res.body.__v).toBeDefined()
    })

    test("Correct content returned", () => {
        expect(res.body.name).toBe("Post Test")
        expect(res.body.email).toBe("jest@test.com")
    })

    afterAll( async () => {
        // Cleanup
        deletion = await request(app).delete(`/users/${res.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        })
    })
})

describe("POST /users/login", () => {
    let res

    beforeAll(async () => {
        res = await request(app).post("/users/login").send({
            email: "fake@fake.com",
            password: process.env.TEST_PASSWORD
        })
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
    })
    
    test("Body has status, accessToken", () => {
        expect(res.body.status).toBeDefined()
        expect(res.body.accessToken).toBeDefined()
    })

    test("Correct status returned", () => {
        expect(res.body.status).toBe("Successful Login")
    })
})

describe("GET /users/:id", () => {
        let token
        let userList
        let res


    beforeAll(async () => {
        token = await request(app).post("/users/login").send({
            email: "fake@fake.com",
            password: process.env.TEST_PASSWORD
        })

        userList = await request(app).get("/users").set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send()

        res = await request(app).get(`/users/${userList.body[0]._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send()
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
    })
    
    test("Body has name, email, password, language, streamingPlatform, region, watchList, wishList, isAdmin, _id & __v", () => {
        expect(res.body.name).toBeDefined()
        expect(res.body.email).toBeDefined()
        expect(res.body.password).toBeDefined()
        expect(res.body.language).toBeDefined()
        expect(res.body.streamingPlatform).toBeDefined()
        expect(res.body.region).toBeDefined()
        expect(res.body.watchList).toBeDefined()
        expect(res.body.wishList).toBeDefined()
        expect(res.body.isAdmin).toBeDefined()
        expect(res.body._id).toBeDefined()
        expect(res.body.__v).toBeDefined()
    })

    test("Correct field types", () => {
        expect(res.body.region).toBeInstanceOf(Object)
        expect(res.body.streamingPlatform).toBeInstanceOf(Array)
        expect(res.body.streamingPlatform[0]).toBeInstanceOf(Object)
        expect(res.body.language).toBeInstanceOf(Object)
        expect(res.body.watchList).toBeInstanceOf(Array)
        expect(res.body.wishList).toBeInstanceOf(Array)
    })
})

describe("PATCH /users/:id", () => {
    let res
    let testUser
    let token
    let deletion

    beforeAll(async () => {
        testUser = await request(app).post("/users").send({
            "name": "Created User",
            "email": "example@test.com",
            "password": "password"
        })

        token = await request(app).post("/users/login").send({
            email: "example@test.com",
            password: process.env.TEST_PASSWORD
        })

        res = await request(app).patch(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "name": "Patch Test",
            "email": "jest@test.com"
        })
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
    })

    test("Body has name, email, password, streamingPlatform, watchList, wishList, isAdmin, _id & __v", () => {
        expect(res.body.name).toBeDefined()
        expect(res.body.email).toBeDefined()
        expect(res.body.password).toBeDefined()
        expect(res.body.streamingPlatform).toBeDefined()
        expect(res.body.watchList).toBeDefined()
        expect(res.body.wishList).toBeDefined()
        expect(res.body.isAdmin).toBeDefined()
        expect(res.body._id).toBeDefined()
        expect(res.body.__v).toBeDefined()
    })

    test("Correct content returned", () => {
        expect(res.body.name).toBe("Patch Test")
        expect(res.body.email).toBe("jest@test.com")
    })

    afterAll( async () => {
        // Cleanup
        deletion = await request(app).delete(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        })
    })
})

describe("DELETE /users/:id", () => {
    let res
    let testUser
    let token
    let check

    beforeAll(async () => {
        testUser = await request(app).post("/users").send({
            "name": "Created User",
            "email": "example@test.com",
            "password": "password"
        })

        token = await request(app).post("/users/login").send({
            email: "example@test.com",
            password: process.env.TEST_PASSWORD
        })

        res = await request(app).delete(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send()
    })

    test("Returns JSON with 200 Status and confirmation message", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
        expect(res.body.status).toBe("User has been deleted")
    })

    test("Fail user get request after deletion", async () => {
        check = await request(app).delete(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send()
        expect(check.status).toBe(404)
        expect(check.body.error).toBe("User not found")
    })
})

describe("PATCH /users/:id/watchList", () => {
    let res
    let testUser
    let token
    let deletion
    let checkDupe
    let checkInfo

    beforeAll(async () => {
        testUser = await request(app).post("/users").send({
            "name": "Created User",
            "email": "example@test.com",
            "password": "password"
        })

        token = await request(app).post("/users/login").send({
            email: "example@test.com",
            password: process.env.TEST_PASSWORD
        })

        res = await request(app).patch(`/users/${testUser.body._id}/watchList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "adult": false,
            "backdrop_path": "image",
            "genre_ids": [
                    1
            ],
            "id": 1,
            "original_language": "en",
            "original_title": "test",
            "overview": "test",
            "popularity": 1,
            "poster_path": "image",
            "release_date": "2024-01-01",
            "title": "Test",
            "video": false,
            "vote_average": 1,
            "vote_count": 1
        })
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
    })
    
    test("Body has name, email, password, streamingPlatform, watchList, wishList, isAdmin, _id & __v", () => {
        expect(res.body.name).toBeDefined()
        expect(res.body.email).toBeDefined()
        expect(res.body.password).toBeDefined()
        expect(res.body.streamingPlatform).toBeDefined()
        expect(res.body.watchList).toBeDefined()
        expect(res.body.wishList).toBeDefined()
        expect(res.body.isAdmin).toBeDefined()
        expect(res.body._id).toBeDefined()
        expect(res.body.__v).toBeDefined()
    })

    test("Correct field types", () => {
        expect(res.body.streamingPlatform).toBeInstanceOf(Array)
        expect(res.body.watchList).toBeInstanceOf(Array)
        expect(res.body.watchList[0]).toBeInstanceOf(Object)
        expect(res.body.wishList).toBeInstanceOf(Array)
    })

    test("Correct information in added watchList entry", () => {
        expect(res.body.watchList[0].title).toBe("Test")
        expect(res.body.watchList[0].original_language).toBe("en")
        expect(res.body.watchList[0].overview).toBe("test")
    })

    test("Duplicate entries should not be added", async () => {
        checkDupe = await request(app).patch(`/users/${testUser.body._id}/watchList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "adult": false,
            "backdrop_path": "image",
            "genre_ids": [
                    1
            ],
            "id": 1,
            "original_language": "en",
            "original_title": "test",
            "overview": "test",
            "popularity": 1,
            "poster_path": "image",
            "release_date": "2024-01-01",
            "title": "Test",
            "video": false,
            "vote_average": 1,
            "vote_count": 1
        })
        expect(checkDupe.status).toBe(409)
        expect(checkDupe.header["content-type"]).toContain("json")
        expect(checkDupe.body.error).toBe("Movie already in watched list")
    })

    test("Entry shouldn't be added if data fails validation", async () => {
        checkInfo = await request(app).patch(`/users/${testUser.body._id}/watchList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "title": "Test"
        })
        console.log(checkInfo.body.watchList[1])
        expect(checkInfo.status).toBe(400)
        expect(checkInfo.header["content-type"]).toContain("json")
        expect(checkInfo.body.error).toBe("Operation not completed successfully")
    })

    afterAll( async () => {
        // Cleanup
        deletion = await request(app).delete(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        })
    })
})

describe("DELETE /users/:id/watchList", () => {
    let res
    let testUser
    let token
    let deletion

    beforeAll(async () => {
        testUser = await request(app).post("/users").send({
            "name": "Created User",
            "email": "example@test.com",
            "password": "password"
        })

        token = await request(app).post("/users/login").send({
            email: "example@test.com",
            password: process.env.TEST_PASSWORD
        })

        res = await request(app).patch(`/users/${testUser.body._id}/watchList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "adult": false,
            "backdrop_path": "image",
            "genre_ids": [
                    1
            ],
            "id": 1,
            "original_language": "en",
            "original_title": "test",
            "overview": "test",
            "popularity": 1,
            "poster_path": "image",
            "release_date": "2024-01-01",
            "title": "Test",
            "video": false,
            "vote_average": 1,
            "vote_count": 1
        })

        res = await request(app).delete(`/users/${testUser.body._id}/watchList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "adult": false,
            "backdrop_path": "image",
            "genre_ids": [
                    1
            ],
            "id": 1,
            "original_language": "en",
            "original_title": "test",
            "overview": "test",
            "popularity": 1,
            "poster_path": "image",
            "release_date": "2024-01-01",
            "title": "Test",
            "video": false,
            "vote_average": 1,
            "vote_count": 1
        })
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
    })
    
    test("Body has name, email, password, streamingPlatform, watchList, wishList, isAdmin, _id & __v", () => {
        expect(res.body.name).toBeDefined()
        expect(res.body.email).toBeDefined()
        expect(res.body.password).toBeDefined()
        expect(res.body.streamingPlatform).toBeDefined()
        expect(res.body.watchList).toBeDefined()
        expect(res.body.wishList).toBeDefined()
        expect(res.body.isAdmin).toBeDefined()
        expect(res.body._id).toBeDefined()
        expect(res.body.__v).toBeDefined()
    })

    test("Correct field types", () => {
        expect(res.body.streamingPlatform).toBeInstanceOf(Array)
        expect(res.body.watchList).toBeInstanceOf(Array)
        expect(res.body.wishList).toBeInstanceOf(Array)
    })

    test("No entries in watchList", () => {
        expect(res.body.watchList).toHaveLength(0)
    })

    afterAll( async () => {
        // Cleanup
        deletion = await request(app).delete(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        })
    })
})

describe("PATCH /users/:id/wishList", () => {
    let res
    let testUser
    let token
    let deletion

    beforeAll(async () => {
        testUser = await request(app).post("/users").send({
            "name": "Created User",
            "email": "example@test.com",
            "password": "password"
        })

        token = await request(app).post("/users/login").send({
            email: "example@test.com",
            password: process.env.TEST_PASSWORD
        })

        res = await request(app).patch(`/users/${testUser.body._id}/wishList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "adult": false,
            "backdrop_path": "image",
            "genre_ids": [
                    1
            ],
            "id": 1,
            "original_language": "en",
            "original_title": "test",
            "overview": "test",
            "popularity": 1,
            "poster_path": "image",
            "release_date": "2024-01-01",
            "title": "Test",
            "video": false,
            "vote_average": 1,
            "vote_count": 1
        })
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
    })
    
    test("Body has name, email, password, streamingPlatform, watchList, wishList, isAdmin, _id & __v", () => {
        expect(res.body.name).toBeDefined()
        expect(res.body.email).toBeDefined()
        expect(res.body.password).toBeDefined()
        expect(res.body.streamingPlatform).toBeDefined()
        expect(res.body.watchList).toBeDefined()
        expect(res.body.wishList).toBeDefined()
        expect(res.body.isAdmin).toBeDefined()
        expect(res.body._id).toBeDefined()
        expect(res.body.__v).toBeDefined()
    })

    test("Correct field types", () => {
        expect(res.body.streamingPlatform).toBeInstanceOf(Array)
        expect(res.body.watchList).toBeInstanceOf(Array)
        expect(res.body.wishList).toBeInstanceOf(Array)
        expect(res.body.wishList[0]).toBeInstanceOf(Object)
    })

    test("Correct information in added wishList entry", () => {
        expect(res.body.wishList[0].title).toBe("Test")
        expect(res.body.wishList[0].original_language).toBe("en")
        expect(res.body.wishList[0].overview).toBe("test")
    })

    afterAll( async () => {
        // Cleanup
        deletion = await request(app).delete(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        })
    })
})

describe("DELETE /users/:id/wishList", () => {
    let res
    let testUser
    let token
    let deletion

    beforeAll(async () => {
        testUser = await request(app).post("/users").send({
            "name": "Created User",
            "email": "example@test.com",
            "password": "password"
        })

        token = await request(app).post("/users/login").send({
            email: "example@test.com",
            password: process.env.TEST_PASSWORD
        })

        res = await request(app).patch(`/users/${testUser.body._id}/wishList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "adult": false,
            "backdrop_path": "image",
            "genre_ids": [
                    1
            ],
            "id": 1,
            "original_language": "en",
            "original_title": "test",
            "overview": "test",
            "popularity": 1,
            "poster_path": "image",
            "release_date": "2024-01-01",
            "title": "Test",
            "video": false,
            "vote_average": 1,
            "vote_count": 1
        })

        res = await request(app).delete(`/users/${testUser.body._id}/wishList`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        }).send({
            "adult": false,
            "backdrop_path": "image",
            "genre_ids": [
                    1
            ],
            "id": 1,
            "original_language": "en",
            "original_title": "test",
            "overview": "test",
            "popularity": 1,
            "poster_path": "image",
            "release_date": "2024-01-01",
            "title": "Test",
            "video": false,
            "vote_average": 1,
            "vote_count": 1
        })
    })

    test("Returns JSON with 200 Status", async () => {
        expect(res.status).toBe(200)
        expect(res.header["content-type"]).toContain("json")
    })
    
    test("Body has name, email, password, streamingPlatform, watchList, wishList, isAdmin, _id & __v", () => {
        expect(res.body.name).toBeDefined()
        expect(res.body.email).toBeDefined()
        expect(res.body.password).toBeDefined()
        expect(res.body.streamingPlatform).toBeDefined()
        expect(res.body.watchList).toBeDefined()
        expect(res.body.wishList).toBeDefined()
        expect(res.body.isAdmin).toBeDefined()
        expect(res.body._id).toBeDefined()
        expect(res.body.__v).toBeDefined()
    })

    test("Correct field types", () => {
        expect(res.body.streamingPlatform).toBeInstanceOf(Array)
        expect(res.body.watchList).toBeInstanceOf(Array)
        expect(res.body.wishList).toBeInstanceOf(Array)
    })

    test("No entries in wishList", () => {
        expect(res.body.wishList).toHaveLength(0)
    })

    afterAll( async () => {
        // Cleanup
        deletion = await request(app).delete(`/users/${testUser.body._id}`).set({
            Authorization: `Bearer ${token.body.accessToken}`
        })
    })
})