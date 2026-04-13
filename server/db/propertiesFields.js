const propertiesFields = [
    {
      "name": "name",
      "label": "Address",
      "type": "text",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "String",
      "isTableField": true,
      "isView": false,
      "options": [],
      "validation": [
        {
          "require": false,
          "message": ""
        }
      ]
    },
    {
      name: "lrNo",
      label: "MLS Number",
      type: "text",
      fixed: true,
      delete: false,
      belongsTo: null,
      backendType: "String",
      editable: false,
      isTableField: true,
      options: [],
      validation: [
        {
          require: true,
          message: "MLS Number is required",
        },
      ],
    },
    {
      "name": "status",
      "label": "Status",
      "type": "select",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "Mixed",
      "isTableField": true,
      "isView": false,
      "options": [
        {
          "name": "For Sale",
          "value": "For Sale"
        },
        {
          "name": "Pending",
          "value": "Pending"
        },
        {
          "name": "Contingent",
          "value": "Contingent"
        },
        {
          "name": "Sold",
          "value": "Sold"
        }
      ],
      "validation": [
        {
          "message": "Invalid type value for Lead Status",
          "formikType": "String"
        },
        {
          "require": true,
          "message": ""
        }
      ]
    },
    // {
    //   "name": "Unit",
    //   "label": "Unit ",
    //   "type": "text",
    //   "fixed": true,
    //   "isDefault": false,
    //   "editable": false,
    //   "delete": false,
    //   "belongsTo": null,
    //   "backendType": "Mixed",
    //   "isTableField": false,
    //   "isView": false,
    //   "validation": [
    //     {
    //       "require": true,
    //       "message": ""
    //     }
    //   ]
    // },
    {
      "name": "Floor",
      "label": "Floors",
      "type": "number",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "Mixed",
      "isTableField": false,
      "isView": false,
      "validation": [
        {
          "require": false,
          "message": ""
        }
      ]
    },
    {
      "name": "yearBuilt",
      "label": "Year Built",
      "type": "number",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "Mixed",
      "isTableField": false,
      "isView": false
    },
    {
      "name": "propertyDescription",
      "label": "Property Description",
      "type": "text",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "Mixed",
      "isTableField": false,
      "isView": false
    },
    {
      "name": "parking",
      "label": "Parking",
      "type": "radio",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "Mixed",
      "isTableField": false,
      "isView": false,
      "options": [
        {
          "name": "Yes",
          "value": "Yes"
        },
        {
          "name": "No",
          "value": "No"
        }
      ]
    },
    {
      "name": "flooringType",
      "label": "Flooring Type",
      "type": "text",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "Mixed",
      "isTableField": false,
      "isView": false
    },
    {
      "name": "location",
      "label": "Location",
      "type": "text",
      "fixed": true,
      "isDefault": false,
      "editable": false,
      "delete": false,
      "belongsTo": null,
      "backendType": "Mixed",
      "isTableField": false,
      "isView": false
    },
  ];
exports.propertiesFields = propertiesFields;