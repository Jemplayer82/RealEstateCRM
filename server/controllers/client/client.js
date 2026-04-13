const { Client } = require('../../model/schema/client')
const email = require('../../model/schema/email')
const MeetingHistory = require('../../model/schema/meeting')
const phoneCall = require('../../model/schema/phoneCall')
const Task = require('../../model/schema/task')
const TextMsg = require('../../model/schema/textMsg')
const DocumentSchema = require('../../model/schema/document')
const Quotes = require("../../model/schema/quotes.js");
const Invoices = require("../../model/schema/invoices.js");

const index = async (req, res) => {
    const query = req.query
    query.deleted = false;

    let allData = await Client.find(query).populate({
        path: 'createBy',
        match: { deleted: false } // Populate only if createBy.deleted is false
    }).exec()

    const result = allData.filter(item => item.createBy !== null);

    try {
        res.send(result)
    } catch (error) {
        res.send(error)
    }
}

const add = async (req, res) => {
    try {
        req.body.createdDate = new Date();
        const user = new Client(req.body);
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        console.error('Failed to create Client:', err);
        res.status(400).json({ error: 'Failed to create Client' });
    }
}

const addMany = async (req, res) => {
    try {
        const data = req.body;
        const insertedClient = await Client.insertMany(data);
        res.status(200).json(insertedClient);
    } catch (err) {
        console.error('Failed to create Client :', err);
        res.status(400).json({ error: 'Failed to create Client' });
    }
};

const addPropertyInterest = async (req, res) => {
    try {
        const { id } = req.params
        await Client.updateOne({ _id: id }, { $set: { interestProperty: req.body } });
        res.send(' uploaded successfully.');
    } catch (err) {
        console.error('Failed to create Client:', err);
        res.status(400).json({ error: 'Failed to create Client' });
    }
}

const edit = async (req, res) => {
    try {
        let result = await Client.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to Update Client:', err);
        res.status(400).json({ error: 'Failed to Update Client' });
    }
}

const view = async (req, res) => {
    try {
        let client = await Client.findOne({ _id: req.params.id });
        let interestProperty = await Client.findOne({ _id: req.params.id }).populate("interestProperty")

        if (!client) return res.status(404).json({ message: 'No data found.' })
        let EmailHistory = await email.aggregate([
            { $match: { createByContact: client._id } },
            {
                $lookup: {
                    from: 'Clients', // Assuming this is the collection name for 'clients'
                    localField: 'createByContact',
                    foreignField: '_id',
                    as: 'createByRef'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$createByRef', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$createByrefLead', preserveNullAndEmptyArrays: true } },
            { $match: { 'users.deleted': false } },
            {
                $addFields: {
                    senderName: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
                    deleted: {
                        $cond: [
                            { $eq: ['$createByRef.deleted', false] },
                            '$createByRef.deleted',
                            { $ifNull: ['$createByrefLead.deleted', false] }
                        ]
                    },

                    createByName: {
                        $cond: {
                            if: '$createByRef',
                            then: { $concat: ['$createByRef.title', ' ', '$createByRef.firstName', ' ', '$createByRef.lastName'] },
                            else: { $concat: ['$createByrefLead.leadName'] }
                        }
                    },
                }
            },
            {
                $project: {
                    createByRef: 0,
                    createByrefLead: 0,
                    users: 0,
                }
            },
        ]);

        let phoneCallHistory = await phoneCall.aggregate([
            { $match: { createByContact: client._id } },
            {
                $lookup: {
                    from: 'Clients',
                    localField: 'createByContact',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            { $unwind: '$client' },
            { $match: { 'client.deleted': false } },
            {
                $addFields: {
                    senderName: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
                    deleted: '$client.deleted',
                    createByName: { $concat: ['$client.title', ' ', '$client.firstName', ' ', '$client.lastName'] },
                }
            },
            {
                $project: { client: 0, users: 0 }
            },
        ]);
        let meetingHistory = await MeetingHistory.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $in: [client._id, '$attendes'] },
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'Clients',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    attendesArray: '$client.email',
                    createdByName: '$users.username',
                }
            },
            {
                $project: {
                    client: 0,
                    users: 0
                }
            }
        ]);
        let textMsg = await TextMsg.aggregate([
            { $match: { createFor: client._id } },
            {
                $lookup: {
                    from: 'Clients',
                    localField: 'createFor',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            { $unwind: '$client' },
            { $match: { 'client.deleted': false } },
            {
                $addFields: {
                    sender: '$users.username',
                    deleted: '$client.deleted',
                    createByName: { $concat: ['$client.title', ' ', '$client.firstName', ' ', '$client.lastName'] },
                }
            },
            {
                $project: { client: 0, users: 0 }
            },
        ]);

        let task = await Task.aggregate([
            { $match: { assignTo: client._id } },
            {
                $lookup: {
                    from: 'Clients',
                    localField: 'assignTo',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    assignToName: '$client.email',
                    createByName: '$users.username',
                }
            },
            { $project: { client: 0, users: 0 } },
        ])
        let quotes = await Quotes.aggregate([
            { $match: { contact: client._id, deleted: false } },
            {
                $lookup: {
                    from: 'Clients',
                    localField: 'contact',
                    foreignField: '_id',
                    as: 'clientData'
                }
            },
            {
                $lookup: {
                    from: 'Accounts',
                    localField: 'account',
                    foreignField: '_id',
                    as: 'accountData'
                }
            },

            { $unwind: { path: '$clientData', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$accountData', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    contactName: { $concat: ['$clientData.title', ' ', '$clientData.firstName', ' ', '$clientData.lastName'] },
                    accountName: { $concat: ['$accountData.name'] },
                }
            },
            { $project: { clientData: 0, accountData: 0 } },
        ])
        let invoice = await Invoices.aggregate([
            { $match: { contact: client._id, deleted: false } },
            {
                $lookup: {
                    from: 'Clients',
                    localField: 'contact',
                    foreignField: '_id',
                    as: 'clientData'
                }
            },
            {
                $lookup: {
                    from: 'Accounts',
                    localField: 'account',
                    foreignField: '_id',
                    as: 'accountData'
                }
            },

            { $unwind: { path: '$clientData', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$accountData', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    contactName: { $concat: ['$clientData.title', ' ', '$clientData.firstName', ' ', '$clientData.lastName'] },
                    accountName: { $concat: ['$accountData.name'] },
                }
            },
            { $project: { clientData: 0, accountData: 0 } },
        ])

        const Document = await DocumentSchema.aggregate([
            { $unwind: '$file' },
            { $match: { 'file.deleted': false, 'file.linkContact': client._id } },
            {
                $lookup: {
                    from: 'User', // Replace 'users' with the actual name of your users collection
                    localField: 'createBy',
                    foreignField: '_id', // Assuming the 'createBy' field in DocumentSchema corresponds to '_id' in the 'users' collection
                    as: 'creatorInfo'
                }
            },
            { $unwind: { path: '$creatorInfo', preserveNullAndEmptyArrays: true } },
            { $match: { 'creatorInfo.deleted': false } },
            {
                $group: {
                    _id: '$_id',  // Group by the document _id (folder's _id)
                    folderName: { $first: '$folderName' }, // Get the folderName (assuming it's the same for all files in the folder)
                    createByName: { $first: { $concat: ['$creatorInfo.firstName', ' ', '$creatorInfo.lastName'] } },
                    files: { $push: '$file' }, // Push the matching files back into an array
                }
            },
            { $project: { creatorInfo: 0 } },
        ]);

        res.status(200).json({ interestProperty, client, EmailHistory, phoneCallHistory, meetingHistory, textMsg, task, Document, quotes, invoice });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error, err: 'An error occurred.' });
    }
}

const deleteData = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, { deleted: true });
        res.status(200).json({ message: "done", client })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

const deleteMany = async (req, res) => {
    try {
        const client = await Client.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });
        res.status(200).json({ message: "done", client })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

module.exports = { index, add, addPropertyInterest, view, edit, deleteData, deleteMany, addMany }
