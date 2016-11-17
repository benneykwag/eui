/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Eui.sample.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    initViewModel: function (viewModel) {
        viewModel.getStore('shortcuts').loadData(eui.Config.menuData);
        viewModel.getStore('shortcuts').commitChanges();
    },

    config: {
        routes: {
            ':id': {
                before: 'beforeHandleRoute',
                action: 'onClassLoad'
            }
        }
    },

    beforeHandleRoute: function (id, action) {
        action.resume();
    },

    logOut: function () {
        Ext.Msg.show({
            title: 'Warning',
            icon: Ext.Msg.QUESTION,
            buttons: Ext.Msg.YESNO,
            message: 'Are you sure you want to logout?',
            fn: function (btn) {
                if (btn == 'yes') {
                    var option = {
                        headers: {
                            'AJAX': false,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        url: '/j_spring_security_logout',
                        pCallback: function () {
                            window.location.href = '/';
                        }
                    }
                    Util.CommonAjax(option);
                }
            }
        });
    },

    onClassLoad: function (id) {
        var me = this,
//            store = Ext.data.StoreManager.lookup('Navigation'),
//            node = store.getNodeById(id),
            className,
            ViewClass,
            cmp,
            contentPanel = me.getView().down('#contentPanel');

//        if (node.isLeaf()) {
        className = Ext.ClassManager.getNameByAlias('widget.' + id);
        console.log('token', id)
        if (!className) {
            console.log('class not loading..');
            if (id == 'LOGOUT') {
                me.logOut();
            }
        } else {
            cmp = contentPanel.down('[itemId=' + id + ']');
            if (!cmp) {
                Ext.suspendLayouts();

                Ext.require(className, function () {
                    ViewClass = Ext.ClassManager.get(className);
                    cmp = new ViewClass();

                    if (id == 'PTL070001V') {
                        cmp.title = 'User Info';
                    } else {
                        var rec = me.getViewModel().getStore('shortcuts').findRecord('SWIDGET', id);
                        cmp.title = rec.get('TEXT');
                    }
                    // console.log('viewClass', ViewClass);
                    clsProto = ViewClass.prototype;
                    // cmp.margin = 5;
                    cmp.itemId = id;
                    if (!cmp.height) {
                        cmp.height = 700;
                    }
                    cmp.closable = true;
                    contentPanel.add(cmp);
                    contentPanel.setActiveItem(cmp);
                });

                Ext.resumeLayouts(true);
            }
            contentPanel.setActiveItem(cmp);
        }
//        }
    }
});
