/***
 *
 * ## Summary
 *
 * Ext.form.RadioGroup 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.RadioGroup', {
    extend: 'Ext.form.RadioGroup',
    xtype: 'euiradiogroup',

    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    defaultListenerScope: true,
//    listeners: {
//        afterrender: 'setCheckboxGroupRadioGroupBindVar'
//    },
    simpleValue: true,

//    setValue: function(value) {
//        debugger;
//        var items = this.items,
//            cbValue, cmp, formId, radios, i, len, name;
//
//        Ext.suspendLayouts();
//
//        if (this.simpleValue) {
//            for (i = 0, len = items.length; i < len; ++i) {
//                cmp = items.items[i];
//
//                if (cmp.inputValue === value) {
//                    cmp.setValue(true);
//                    break;
//                }
//            }
//        }
//        else if (Ext.isObject(value)) {
//            cmp = items.first();
//            formId = cmp ? cmp.getFormId() : null;
//
//            for (name in value) {
//                cbValue = value[name];
//                radios = Ext.form.RadioManager.getWithValue(name, cbValue, formId).items;
//                len = radios.length;
//
//                for (i = 0; i < len; ++i) {
//                    radios[i].setValue(true);
//                }
//            }
//        }
//
//        Ext.resumeLayouts(true);
//
//        return this;
//    },

    initComponent: function () {
        this.setAllowBlank();
        this.callParent(arguments);
    }
});