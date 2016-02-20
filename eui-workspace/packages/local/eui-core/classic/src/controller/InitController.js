Ext.define('eui.controller.InitController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.spinit',
    constructor: function (cfg) {
        cfg = cfg || {};

        if(this.globalUrlPrefix){
            Util.HurlPrefix = this.globalUrlPrefix;
        }


        Util.localeStoreDisplayField = this.localeStoreDisplayField;
        Util.localeStoreValueField = this.localeStoreValueField;


//        var fileref=document.createElement("link");
//        fileref.setAttribute("rel", "stylesheet");
//        fileref.setAttribute("type", "text/css");
//        fileref.setAttribute("href", 'resources/css/sprr-theme.css');
//        document.getElementsByTagName("head")[0].appendChild(fileref);


        var store = Ext.create('Ext.data.Store', {
            fields: [],
            storeId: 'i18n'
        });
        Ext.apply(cfg, {
            url: Util.HurlPrefix + this.localeStoreUrl,
            pSync: false,
            outDs: {
                data: Ext.getStore('i18n')
            }
        });
        if(this.localeStoreUrl){
            Util.CommonAjax(cfg);
        }

        Util.globalCheckLogin();

        this.callParent(this.processInitialController(cfg));
    },

    processInitialController: function (config) {
        return config;
    },

    init: function (application) {
        console.log('init', this.localeUrl)

    }
});
