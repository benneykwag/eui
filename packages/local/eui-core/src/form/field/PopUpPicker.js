/***
 *
 * ## Summary
 *
 * 팝업을 호출하고 선택된 값을 설정한다.
 *
 **/

Ext.define('eui.form.field.PopUpPicker', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.euipopuppicker',
    triggerCls: 'x-form-search-trigger',
    cellCls: 'fo-table-row-td',
    callBack: 'onTriggerCallback',
    config: {
        simpleMode: false,
        displayField: 'NAME',
        valueField: 'CODE'
    },

    onTriggerCallback: function (trigger, record, valueField, displayField) {
        this.setValue(record.get(this.getValueField()));
    },

    enableKeyEvents: true,

    matchFieldWidth: false,

    doAlign: function () {
        var me = this,
            picker = me.picker,
            aboveSfx = '-above',
            isAbove;

        // Align to the trigger wrap because the border isn't always on the input element, which
        // can cause the offset to be off
        if (me.simpleMode) {
            me.picker.alignTo(me.triggerWrap, me.pickerAlign, me.pickerOffset);
        }

        // add the {openCls}-above class if the picker was aligned above
        // the field due to hitting the bottom of the viewport
        isAbove = picker.el.getY() < me.inputEl.getY();
        me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
        picker[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);
    },



    createPicker: function (C) {        // #4
        var me = this;
        if (!me.picker) {

            me.picker = Ext.create('Ext.panel.Panel', {
                title: me.popupConfig.title,
                floating: true,
                height: (me.simpleMode ? 300 : me.popupConfig.height),
                width: me.popupConfig.width,
                layout: 'fit',
                items: [
                    {
                        xtype: me.popupConfig.popupWidget,
                        height: (me.simpleMode ? 290 : me.popupConfig.height - 10),
                        tableColumns: 2,
                        trigger: me,
                        valueField: me.valueField,
                        __PARENT: me,
                        __PARAMS: {
                            popupConfig: me.popupConfig
                        },
                        multiReturnValue: false
                    }
                ]
            });
        }
//        me.picker.on('show', function () {
////            Ext.defer(function () {
//            me.fireEvent('pickerbeforeshow', me, me.picker);
////            },00)
//
//        })
        return me.picker;
    }
});