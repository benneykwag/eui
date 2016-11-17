Ext.define('Eui.sample.view.frame.Header', {
    extend: 'Ext.Component',
    xtype: 'simheader',
//    contentEl: 'simheader',
    height: 50,

    tpl: [
        '<header id="simheader" class="main-header">',
        '<a href="index.html" class="logo">',
        '<span class="logo-mini"><b>E</b>UI</span>',
        '<span class="logo-lg">',
        '<b>Eui</b>JS',
        '</span>',
        '</a>',
        '<nav class="navbar navbar-static-top">',

        '<a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button">',
            '<span class="sr-only">Toggle navigation</span>',
        '</a>',

        '<div class="navbar-custom-menu">',
            '<ul class="nav navbar-nav">',
                '<li class="dropdown user user-menu">',
                    '<a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="true">',
//                        '<img src="resources/images/senchalogo.jpeg" style="width:50px" class="22user-image" alt="User Image">',
                            '<span class="hidden-xs">김앤곽 센차컨설팅 그룹</span>',
                        '</a>',
                        '<ul class="dropdown-menu">',
                            '<li class="user-header">',
                            '<img src="https://www.sencha.com/wp-content/themes/sencha/images/logo.svg" class="img-circle" alt="User Image">',
                                '<p>',
                                '{text1}  {text4}',
                                    '<small>since Nov. 2015</small>',
                                '</p>',
                            '</li>',
//                            '<li class="user-body">',
//                                '<div class="row">',
//                                    '<div class="col-xs-4 text-center">',
//                                        '<a href="#">Followers</a>',
//                                    '</div>',
//                                    '<div class="col-xs-4 text-center">',
//                                        '<a href="#">Sales</a>',
//                                    '</div>',
//                                    '<div class="col-xs-4 text-center">',
//                                        '<a href="#">Friends</a>',
//                                    '</div>',
//                                '</div>',
//                            '</li>',
//                            '<li class="user-footer">',
//                                '<div class="pull-left">',
//                                    '<a href="#" class="btn btn-default btn-flat Profile">Profile</a>',
//                                '</div>',
//                                '<div class="pull-right">',
//                                    '<a href="#LOGOUT" class="btn btn-default btn-flat">Sign out</a>',
//                                '</div>',
//                            '</li>',
                        '</ul>',
                    '</li>',
                    '<li>',
                        '<a href="#LOGOUT" data-toggle="control-sidebar"><i class="fa fa-sign-out"></i></a>',
                    '</li>',
                '</ul>',
            '</div>',
        '</nav>',
        '</header>'
    ],
    initComponent: function () {
        Ext.apply(this, {

            data: {
                text1: "김앤곽센차컨설팅그룹",
//                text2: 255,
//                text3: 'Messages',
                text4: "(kksencha.com)",
                text5: "PHOTO_PATH",
                group: [
                    {
                        link: 'http://gw.htns.com',
                        icon: 'icon-envelope',
                        text: 'Groupware',
                        tar: '_blank'
                    },
                    {
                        link: 'index.html',
                        icon: 'icon-home',
                        text: 'Home',
                        tar: ''
                    },
                    {
                        link: '#PTL070001V',
                        icon: 'icon-cogs',
                        text: 'User Info',
                        tar: ''
                    },
                    {
                        link: '#LOGOUT',
                        icon: 'icon-off',
                        text: 'Logout',
                        tar: ''
                    }
                ]
            }
        })
        this.callParent(arguments);
    },

    afterRender: function () {
        var me = this;

        me.el.on("click", me.onClickTab, me, {
            delegate: ".sidebar-toggle"
        });

        me.el.on("click", me.openProfile, me, {
            delegate: ".Profile"
        });

        this.callParent(arguments);
    },

    Signout : function () {

    },

    openProfile: function () {
        Util.commonPopup(this, 'Excel Uploader', 'com.view.com060104.COM060104V', 800, 600, {}, null, true).show();
    },

    onClickTab: function () {
        var sidebar = Ext.getCmp('sidebarpanel');
        if (sidebar.getWidth() == 50) {
            Ext.getCmp('sidebarpanel').setWidth(230);
        } else {
            Ext.getCmp('sidebarpanel').setWidth(50);
        }

    }
});