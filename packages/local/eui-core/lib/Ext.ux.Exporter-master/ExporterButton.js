/**
 * @class Ext.ux.Exporter.Button
 * @extends Ext.Button
 * @author Nige White, with modifications from Ed Spencer, with modifications from iwiznia with modifications from yogesh
 * Internally, this is just a link.
 * Pass it either an Ext.Component subclass with a 'store' property, or componentQuery of that component or just a store or nothing and it will try to grab the first parent of this button that is a grid or tree panel:
 * new Ext.ux.Exporter.ExporterButton({component: someGrid});
 * new Ext.ux.Exporter.ExporterButton({store: someStore});
 * new Ext.ux.Exporter.ExporterButton({component: '#itemIdSomeGrid'});
 * @cfg {Ext.Component} component The component the store is bound to
 * @cfg {Ext.data.Store} store The store to export (alternatively, pass a component with a getStore method)
 */
Ext.define("Ext.ux.exporter.ExporterButton", {
    extend: "Ext.Button",
    requires: ['Ext.ux.exporter.Exporter', 'Ext.ux.exporter.FileSaver'],
    alias: "widget.exporterbutton",
    config: {
        iconCls: null,
        showText: true
    },
    localeProperties: ['text','iconCls'],
    /**
     * @cfg {String} text
     * The button text to be used as innerHTML (html tags are accepted).
     */
    text: 'Download',

    /**
     * @cfg {String} format
     * The Exported File formatter
     */
    format: 'excel',

    /**
     * @cfg {Boolean} preventDefault
     * False to allow default action when the {@link #clickEvent} is processed.
     */
    preventDefault: false,

    /**
     * @cfg {Number} saveDelay
     * Increased buffer to avoid clickEvent fired many times within a short period.
     */
    saveDelay: 300,

    //iconCls: 'save',

    /**
     * @cfg {Boolean} remote
     * To remotely download file only if browser doesn't support locally
     * otherwise it will try to open in new window
     */
    remote: false,
    /**
     * @cfg {String} title
     * To set name to eported file, extension will be appended based on format
     */
    title: 'export',

    constructor: function (config) {
        var me = this;

        Ext.ux.exporter.ExporterButton.superclass.constructor.call(me, config);

        me.on("afterrender", function () { //wait for the button to be rendered, so we can look up to grab the component
            if (me.component) {
                me.component = !Ext.isString(me.component) ? me.component : Ext.ComponentQuery.query(me.component)[0];
            }
            me.setComponent(me.store || me.component || me.up("gridpanel") || me.up("treepanel") || me.targetGrid, config);
        });
    },

    onClick: function (e) {
        var me = this,
            blobURL = "",
            format = me.format,
            title = me.title,
            remote = me.remote,
            dt = new Date(),
            link = me.el.dom,
            res, fullname;

        me.fireEvent('start', me);
        res = Ext.ux.exporter.Exporter.exportAny(me.component, format, { title: title });
        filename = title + "_" + Ext.Date.format(dt, "Y-m-d h:i:s") + "." + res.ext;
        Ext.ux.exporter.FileSaver.saveAs(res.data, res.mimeType, res.charset, filename, link, remote, me.onComplete, me);

        me.callParent(arguments);
    },

    setComponent: function (component, config) {
        var me = this;
        me.component = component;
        var store = component.getStore(),
            total = store.getCount();
//            extraParam = store.getProxy().getExtraParams()||{};

//        if (component.getStore().pageSize) {
//            Ext.getCmp(me.up('menu').getId()).mask("Updating... Please wait...", 'loading');
//            extraParam['limit'] = 5000;
//            extraParam['page'] = 1;
//            extraParam['start'] = 0;
//            component.store_ = Ext.create('Ext.data.Store', {
//                fields: [],
//                proxy: {
//                    type: 'memory',
//                    reader: {
//                        type: 'json',
//                        rootProperty: 'data'
//                    }
//                }
//            });
//            Ext.defer(function () {
//                Util.CommonAjax({
//                    url: component.getStore().getProxy().getUrl(),
////                    params: extraParam,
//                    pSync: false,
//                    pCallback: function (pScope, params, retData) {
//                        component.store_.loadData(retData[component.getStore().getProxy().getReader().getRootProperty()]);
//                        Ext.getCmp(me.up('menu').getId()).unmask();
//                    }
//                });
//            },1000)
//
//        }

        me.store = !component.is ? component : component.getStore(); // only components or stores, if it doesn't respond to is method, it's a store
    },

    onComplete: function () {
        this.fireEvent('complete', this);
    }
});
