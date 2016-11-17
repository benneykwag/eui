/***
 *
 * ## Summary
 *
 * Ext.button.Button 클래스를 확장합니다. toolbar 또는 기타 container의 자식으로 포함됩니다.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *          requires: ['eui.button.Button'],
 *          items: [
 *              {
 *                  xtype: 'euibutton',
 *                  text: '저장',
 *                  handler: 'onClickButton'
 *              }
 *         ],
 *         height: 500,
 *         width: 800,
 *         renderTo: Ext.getBody()
 *     });
 *
 */
Ext.define('eui.button.Button', {
    extend: 'Ext.button.Button',
    xtype: 'euibutton',
//    text: 'SpButton',
//    ui: 'basicbtn',

    config: {
        iconCls: null,
        showText: true
    },

    localeProperties: ['text','iconCls'],
    margin: '0 5 2 0',
    initComponent: function() {
        var me = this;
        if(!me.getShowText()){
            delete me.text;
        }
        me.callParent(arguments);
    }
});