Ext.define('d',
    {
        "classAlias": "widget.sppopuptriggerset",
        "className": "sprr.form.field.PopupTriggerSet",
        "inherits": "Ext.form.FieldContainer",
        "autoName": "PopUpSet",
        "helpText": "PopupTriggerSet",
        "toolbox": {
            "name": "PopupTriggerSet",
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
            },
            {
                "name": "codeFieldName",
                "type": "string"
            },
            {
                "name": "textFieldName",
                "type": "string"
            },
            {
                "name":"bindVar",
                "type":"object"
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
)
