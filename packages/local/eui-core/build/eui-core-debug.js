Ext.define('Override.Component', {
    override: 'Ext.Component',
    /**
     * @cfg {String/Array} [localeProperties=html] A string or array of strings of properties on the component to be localized.
     */
    localeProperties: 'html',
    /**
     * @private
     * @cfg {RegExp} _localeRe A RegExp that will match an id and default string, both are required in this format:
     *
     *     {{id}{default text}}
     */
    //    _localeRe: /^{{(.+)}{(.+)}}$/,
    _localeRe: /^{(.+)}$/,
    initComponent: function() {
        this.doLocale();
        //        console.log('i18n: ', Ext.getStore('i18n'))
        this.callParent();
    },
    /**
     * @private
     * Method that will create a setter function that will localize the string and pass it to the original setter.
     */
    _createLocaleSetter: function(property) {
        var configurator = this.getConfigurator(),
            config = configurator.configs[property],
            store = Ext.getStore('i18n'),
            re = this._localeRe,
            setName, oldSetter, newSetter;
        console.log('store', store);
        if (Ext.isEmpty(store)) {
            /*Ext.Error.raise({
             msg: '다국어 지원을 위한 데이터를 제공받지 못했습니다...'
             });*/
            console.log('다국어 지원을 위한 데이터를 제공받지 못했습니다...', arguments);
            return null;
        }
        if (!config) {
            config = configurator.configs[property] = new Ext.Config(property);
        }
        setName = config.names.set;
        oldSetter = this[setName];
        if (oldSetter.isLocaleSetter) {
            newSetter = oldSetter;
        } else {
            newSetter = this[setName] = function(value) {
                var info, id, defaultString, record;
                if (value && Ext.typeOf(value) == 'string' && (value.indexOf("#") != -1)) {
                    var allVar = value.split("#"),
                        len = allVar.length;
                    for (var i = 1; i < len; i++) {
                        var chkStr;
                        if (allVar[i].split('}').length == 2) {
                            chkStr = allVar[i].split('}')[0] + '}';
                        }
                        info = re.exec(chkStr);
                        if (info) {
                            if (i === 1) {
                                value = allVar[0];
                            }
                            id = info[1];
                            record = id && store.findRecord('MSG_ID', id, 0, false, false, true);
                            value += (record ? record.get('MSG_CONTENTS') : id) + allVar[i].split('}')[1];
                        } else {
                            value = allVar[i];
                        }
                    }
                }
                return oldSetter.call(this, value);
            };
            newSetter.isLocaleSetter = true;
        }
        return newSetter;
    },
    /**
     * @private
     * Method that will iterate through the {@link #localeProperties} to create a setter hook into a current setter.
     */
    doLocale: function() {
        var me = this,
            properties = Ext.Array.from(me.localeProperties),
            i = 0,
            length = properties.length,
            property, value, setter;
        for (; i < length; i++) {
            property = properties[i];
            value = me[property];
            if (value && Ext.typeOf(value) == 'string' && (value.indexOf("#") != -1)) {
                setter = me._createLocaleSetter(property);
                if (value && !Ext.isEmpty(setter)) {
                    setter.call(me, value);
                }
            }
        }
    }
});

Ext.define('Override.app.Application', {
    override: 'Ext.app.Controller',
    init: function() {
        console.log('init....');
    }
});

Ext.define('Override.grid.column.Column', {
    override: 'Ext.grid.column.Column',
    localeProperties: [
        'text'
    ],
    initComponent: function() {
        if (this.editor) {
            this.cls = 'dirtymark';
        }
        this.callParent(arguments);
    }
});

Ext.define('Override.window.Window', {
    override: 'Ext.window.Window',
    localeProperties: [
        'title'
    ]
});

/***
 * App전역 변수 설정.
 */
Ext.define('eui.Config', {
    singleton: true,
    alternateClassName: [
        'Config'
    ],
    localeCode: 'kr',
    localeValueField: 'MSG_ID',
    localeDisplayField: 'MSG_CONTENTS',
    /***
     *
     */
    internalLabelFile: 'resources/data/i18n.json',
    /***
     * eui-core에 필요한 텍스트 레이블 정보.
     */
    initLocale: function() {
        var cfg = {
                url: Config.internalLabelFile,
                params: {
                    locale: Config.localeCode
                },
                pSync: false,
                pCallback: function(pScope, params, retData) {
                    var store = Ext.create('Ext.data.Store', {
                            fields: [],
                            storeId: 'i18n'
                        });
                    store.loadData(retData.data);
                }
            };
        Util.CommonAjax(cfg);
    },
    initCustomLocale: function() {
        var store = Ext.getStore('i18n');
        if (Ext.isEmpty(store)) {
            store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        }
        var cfg = {
                url: 'resources/data/customI18n.json',
                params: {},
                pSync: false,
                pCallback: function(pScope, params, retData) {
                    store.add(retData.data);
                }
            };
        Util.CommonAjax(cfg);
    }
});

