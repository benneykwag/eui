/*Ext.define('d',*/
{
    "classAlias": "widget.sppopuptrigger",
    "className": "sprr.form.field.PopupTrigger",
    "inherits": "Ext.form.field.Text",
    "autoName": "PopUp",
    "helpText": "PopupTrigger",
    "toolbox": {
        "name": "PopupTrigger",
        "category": "Sprr Forms Fields",
        "groups": ["Sprr"]
    },
    "configs": [
        {
            "name": "displayField",
            "type": "string"
        },
        {
            "name": "valueField",
            "type": "string"
        },
        {
            "name": "popupOption",
            "type": "object"
        }
    ],
    "events": [
        {
            "name": "popupvaluechange",
            "params": [
                {
                    "name": "trigger",
                    "type": "object"
                },
                {
                    "name": "codeNewValue",
                    "type": "string"
                },
                {
                    "name": "codeOldValue",
                    "type": "string"
                },
                {
                    "name": "nameNewValue",
                    "type": "string"
                },
                {
                    "name": "nameOldValue",
                    "type": "string"
                },
                {
                    "name": "records",
                    "type": "array"
                }
            ]
        }
    ]
}

/*
 )*/
