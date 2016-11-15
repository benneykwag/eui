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
        viewModel.getStore('shortcuts').loadData([
            {"CHILD_YN": "Y", "ICONCLS": "", "SWIDGET": "", "TEXT": "Grid", "SHOTCUT": "", "LEVEL": 1, "CLS": "", "RESIZABLE": "", "SCLASS": "", "CODE": "MNMAT", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 7, "PCODE": "*", "ID": "", "MAXIMIZABLE": ""},
            {"CHILD_YN": "N", "ICONCLS": "", "SWIDGET": "sample-basic-grid", "TEXT": "Basic Grid", "SHOTCUT": "", "LEVEL": 2, "CLS": "", "RESIZABLE": "", "SCLASS": "Eui.sample.view.grid.Basic", "CODE": "MNMAT01", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 1, "PCODE": "MNMAT", "ID": "", "MAXIMIZABLE": ""},
            {"CHILD_YN": "N", "ICONCLS": "", "SWIDGET": "sample-mergegrid", "TEXT": "Merge Grid", "SHOTCUT": "", "LEVEL": 2, "CLS": "", "RESIZABLE": "", "SCLASS": "Eui.sample.view.grid.MergeGrid", "CODE": "MNMAT02", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 1, "PCODE": "MNMAT", "ID": "", "MAXIMIZABLE": ""}

//            {"CHILD_YN": "Y", "ICONCLS": "", "SWIDGET": "", "TEXT": "Material System", "SHOTCUT": "", "LEVEL": 1, "CLS": "", "RESIZABLE": "", "SCLASS": "", "CODE": "MNMAT", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 7, "PCODE": "*", "ID": "", "MAXIMIZABLE": ""},
//            {"CHILD_YN": "Y", "ICONCLS": "", "SWIDGET": "", "TEXT": "Material Mgt", "SHOTCUT": "", "LEVEL": 2, "CLS": "", "RESIZABLE": "", "SCLASS": "", "CODE": "MNMAT01", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 1, "PCODE": "MNMAT", "ID": "", "MAXIMIZABLE": ""},
//            {"CHILD_YN": "N", "ICONCLS": "ae-shortcut", "SWIDGET": "MAT010103V", "TEXT": "Material Booking List", "WIDTH": 1000, "SHOTCUT": "N", "LEVEL": 3, "CLS": "ae-shortcut", "HEIGHT": 600, "RESIZABLE": "Y", "SCLASS": "mat.view.mat010103.MAT010103V", "CODE": "MNMAT0103", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 1, "PCODE": "MNMAT01", "ID": "MAT010103V", "MAXIMIZABLE": "Y"},
//            {"CHILD_YN": "N", "ICONCLS": "ae-shortcut", "SWIDGET": "MAT010102V", "TEXT": "Material Truck Order", "WIDTH": 1000, "SHOTCUT": "Y", "LEVEL": 3, "CLS": "ae-shortcut", "HEIGHT": 600, "RESIZABLE": "Y", "SCLASS": "mat.view.mat010102.MAT010102V", "CODE": "MNMAT0102", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 1, "PCODE": "MNMAT01", "ID": "MAT010102V", "MAXIMIZABLE": "Y"},
//            {"CHILD_YN": "N", "ICONCLS": "ae-shortcut", "SWIDGET": "MAT010106V", "TEXT": "Material Booking Status", "WIDTH": 1000, "SHOTCUT": "N", "LEVEL": 3, "CLS": "ae-shortcut", "HEIGHT": 600, "RESIZABLE": "Y", "SCLASS": "mat.view.mat010106.MAT010106V", "CODE": "MNMAT0106", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 1, "PCODE": "MNMAT01", "ID": "MAT010106V", "MAXIMIZABLE": "Y"},
//            {"CHILD_YN": "N", "ICONCLS": "ae-shortcut", "SWIDGET": "MAT010101V", "TEXT": "Material Stock List", "WIDTH": 1000, "SHOTCUT": "N", "LEVEL": 3, "CLS": "ae-shortcut", "HEIGHT": 600, "RESIZABLE": "Y", "SCLASS": "mat.view.mat010101.MAT010101V", "CODE": "MNMAT0101", "DSKT_SQ": 1, "DSKT_CD": "MNMAT", "ORDER_SEQ": 1, "PCODE": "MNMAT01", "ID": "MAT010101V", "MAXIMIZABLE": "Y"}
        ]);
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
            if(id == 'LOGOUT'){
                me.logOut();
            }
        } else {
            cmp = contentPanel.down('[itemId=' + id + ']');
            if(!cmp){
                Ext.suspendLayouts();

                Ext.require(className, function () {
                    ViewClass = Ext.ClassManager.get(className);
                    cmp = new ViewClass();

                    if(id == 'PTL070001V'){
                        cmp.title = 'User Info';
                    }else{
                        var rec = me.getViewModel().getStore('shortcuts').findRecord('SWIDGET', id);
                        cmp.title = rec.get('TEXT');
                    }
                    // console.log('viewClass', ViewClass);
                    clsProto = ViewClass.prototype;
                    // cmp.margin = 5;
                    cmp.itemId = id;
                    if(!cmp.height){
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
