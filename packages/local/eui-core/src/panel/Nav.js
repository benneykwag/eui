/***
 *  화면 상단 네비게이션
 */
Ext.define('eui.panel.Nav', {
    extend: 'Ext.Component',
    xtype: 'euiheadernav',
    config: {
        text: null
    },

    tpl: [
        '<div class="eui-form-table">',
        '<div>{text}</div>',
        '</div>'
    ],

    initComponent: function () {
        Ext.apply(this, {
            data: {
                text: this.text
            }
        });
        this.callParent(arguments);
    }

});