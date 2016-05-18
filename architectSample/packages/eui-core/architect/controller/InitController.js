/*Ext.define('d',*/
{
    "classAlias": "controller.spinit",
    "className": "sprr.controller.InitController",
    "inherits": "Ext.app.Controller",
    "autoName": "InitialController",
    "helpText": "localeStore Setting <br> ",
    "toolbox": {
        "name": "InitialController",
        "category": "Sprr Controllers",
        "groups": ["Sprr"]
    },
    "configs": [
        {
            "name":"globalUrlPrefix",
            "type": "string"
        },
        {
            "name": "localeStoreUrl",
            "type": "string"
        },
        {
            "name":"localeStoreValueField",
            "type":"string",
            "initialValue" :"MSG_ID"
        },
        {
            "name":"localeStoreDisplayField",
            "type":"string",
            "initialValue" :"MSG_CONTENTS"
        }
    ]
}
/*)*/
