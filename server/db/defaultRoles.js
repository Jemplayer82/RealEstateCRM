// default role
const defaultRole = {
    "roleName": "Sales",
    "description": "Sales person",
    "access": [
        {
            "title": "Emails",
            "create": true,
            "update": false,
            "delete": false,
            "view": true
        },
        {
            "title": "Calls",
            "create": true,
            "update": false,
            "delete": false,
            "view": true
        },
        {
            "title": "Clients",
            "create": true,
            "update": false,
            "delete": false,
            "view": true
        },
        {
            "title": "Leads",
            "create": true,
            "update": false,
            "delete": false,
            "view": true
        }
    ]
};

module.exports = { defaultRole };