const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../model/schema/user');
const bcrypt = require('bcrypt');
const { initializeLeadSchema } = require("../model/schema/lead");
const { initializeClientSchema } = require("../model/schema/client");
const { initializePropertySchema } = require("../model/schema/property");
const { createNewModule } = require("../controllers/customField/customField.js");
const { add: createNewRole } = require("../controllers/roleAccess/roleAccess.js");
const customField = require('../model/schema/customField.js');
const { clientFields } = require('./clientFields.js');
const { leadFields } = require('./leadFields.js');
const { propertiesFields } = require('./propertiesFields.js');
const { defaultRole } = require("./defaultRoles.js");

const initializedSchemas = async () => {
    await initializeLeadSchema();
    await initializeClientSchema();
    await initializePropertySchema();

    const CustomFields = await customField.find({ deleted: false });
    const createDynamicSchemas = async (CustomFields) => {
        for (const module of CustomFields) {
            const { moduleName, fields } = module;

            // Check if schema already exists
            if (!mongoose.models[moduleName]) {
                // Create schema object
                const schemaFields = {};
                for (const field of fields) {
                    schemaFields[field.name] = { type: field.backendType };
                    if (field.ref) schemaFields[field.name] = { type: field.backendType, ref: field.ref };
                }
                // Create Mongoose schema
                const moduleSchema = new mongoose.Schema(schemaFields);
                // Create Mongoose model
                mongoose.model(moduleName, moduleSchema, moduleName);
                console.log(`Schema created for module: ${moduleName}`);
            }
        }
    };

    createDynamicSchemas(CustomFields);

}

const connectDB = async (DATABASE_URL, DATABASE) => {
    try {
        const DB_OPTIONS = {
            dbName: DATABASE
        }

        mongoose.set("strictQuery", false);
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);

        // const collectionsToDelete = ['abc', 'Report and analytics', 'test', 'krushil', 'bca', 'xyz', 'lkjhg', 'testssssss', 'tel', 'levajav', 'tellevajav', 'Contact'];
        // const db = mongoose.connection.db;
        // console.log(db)
        // for (const collectionName of collectionsToDelete) {
        //     await db.collection(collectionName).drop();
        //     console.log(`Collection ${collectionName} deleted successfully.`);
        // }

        await initializedSchemas();

        /* this was temporary  */
        const mockRes = {
            status: (code) => {
                return {
                    json: (data) => { }
                };
            },
            json: (data) => { }
        };

        // Create default modules
        await createNewModule({ body: { moduleName: 'Leads', fields: leadFields, headings: [], isDefault: true } }, mockRes);
        await createNewModule({ body: { moduleName: 'Clients', fields: clientFields, headings: [], isDefault: true } }, mockRes);
        await createNewModule({ body: { moduleName: 'Properties', fields: propertiesFields, headings: [], isDefault: true } }, mockRes);

        // Create default role
        // await createNewRole({ body: defaultRole }, mockRes);

        /*  */
        await initializedSchemas();

        const adminExisting = await User.find({ role: 'superAdmin' });
        if (adminExisting.length <= 0) {
            console.log("No admin account found. Visit the app to complete initial setup.");
        } else if (adminExisting[0].deleted === true) {
            await User.findByIdAndUpdate(adminExisting[0]._id, { deleted: false });
            console.log("Admin restored successfully.");
        }

        console.log("Database Connected Successfully..");
    } catch (err) {
        console.log("Database Not connected", err.message);
    }
}
module.exports = connectDB