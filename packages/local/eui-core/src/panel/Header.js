/***
 *
 */
Ext.define('eui.panel.Header', {
    extend: 'Ext.Component',
    xtype: 'euiheader',
    height: 30,
    margin: '10 10 0 5',
    config: {
        title: null,
        iconCls: 'x-fa fa-pencil-square'
    },

    tpl: [
        '<div class="eui-form-table">',
        '<div  class="eui-form-table x-panel-header x-header x-docked x-unselectable x-panel-header-default x-horizontal x-panel-header-horizontal x-panel-header-default-horizontal x-top x-panel-header-top x-panel-header-default-top x-docked-top x-panel-header-docked-top x-panel-header-default-docked-top x-box-layout-ct" role="presentation" style="width: 771px; right: auto; left: 0px; top: 0px;">',
            '<span data-ref="tabGuardBeforeEl" aria-hidden="true" class="x-tab-guard x-tab-guard-" style="width:0px;height:0px;">',
            '</span>',
            '<div data-ref="innerCt" role="presentation" class="x-box-inner" style="width: 761px; height: 16px;">' +
            '<div data-ref="targetEl" class="x-box-target" role="presentation" style="width: 761px;">' +
                '<div class="x-title x-panel-header-title x-panel-header-title-default x-box-item x-title-default x-title-rotate-none x-title-align-left" role="presentation" unselectable="on" style="right: auto; left: 0px; top: 0px; margin: 0px; width: 761px;">' +
                '<div data-ref="iconWrapEl" role="presentation" class="x-title-icon-wrap x-title-icon-wrap-default x-title-icon-left x-title-item">' +
                '<div data-ref="iconEl" role="presentation" unselectable="on" class="x-title-icon x-title-icon-default {iconCls} " style=""></div>' +
                '</div>' +
                '<div data-ref="textEl" class="x-title-text x-title-text-default x-title-item" unselectable="on" role="presentation">{title}</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<span data-ref="tabGuardAfterEl" aria-hidden="true" class="x-tab-guard x-tab-guard-" style="width:0px;height:0px;"></span>' +
                '</div>',
        '</div>'
    ],
    initComponent: function () {
        Ext.apply(this, {
            data: {
                iconCls: this.iconCls,
                title: this.title
            }
        });
        this.callParent(arguments);
    }

});