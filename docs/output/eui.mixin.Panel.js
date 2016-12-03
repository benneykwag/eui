Ext.data.JsonP.eui_mixin_Panel({"tagname":"class","name":"eui.mixin.Panel","autodetected":{"aliases":true,"alternateClassNames":true,"extends":true,"mixins":true,"requires":true,"uses":true,"members":true,"code_type":true},"files":[{"filename":"Panel.js","href":"Panel3.html#eui-mixin-Panel"}],"aliases":{},"alternateClassNames":[],"extends":"Ext.Mixin","mixins":[],"requires":[],"uses":[],"members":[{"name":"defaultToolbarPosition","tagname":"cfg","owner":"eui.mixin.Panel","id":"cfg-defaultToolbarPosition","meta":{"private":true}},{"name":"defaultToolbarUi","tagname":"cfg","owner":"eui.mixin.Panel","id":"cfg-defaultToolbarUi","meta":{"private":true}},{"name":"hiddenBtmTbar","tagname":"cfg","owner":"eui.mixin.Panel","id":"cfg-hiddenBtmTbar","meta":{"private":true}},{"name":"mixinConfig","tagname":"property","owner":"eui.mixin.Panel","id":"property-mixinConfig","meta":{"private":true}},{"name":"applyButtonToolBar","tagname":"method","owner":"eui.mixin.Panel","id":"method-applyButtonToolBar","meta":{}},{"name":"getDefaultToolbarPosition","tagname":"method","owner":"eui.mixin.Panel","id":"method-getDefaultToolbarPosition","meta":{}},{"name":"getDefaultToolbarUi","tagname":"method","owner":"eui.mixin.Panel","id":"method-getDefaultToolbarUi","meta":{}},{"name":"getHiddenBtmTbar","tagname":"method","owner":"eui.mixin.Panel","id":"method-getHiddenBtmTbar","meta":{}},{"name":"setDefaultToolbarPosition","tagname":"method","owner":"eui.mixin.Panel","id":"method-setDefaultToolbarPosition","meta":{}},{"name":"setDefaultToolbarUi","tagname":"method","owner":"eui.mixin.Panel","id":"method-setDefaultToolbarUi","meta":{}},{"name":"setHiddenBtmTbar","tagname":"method","owner":"eui.mixin.Panel","id":"method-setHiddenBtmTbar","meta":{}}],"code_type":"ext_define","id":"class-eui.mixin.Panel","component":false,"superclasses":["Ext.Mixin"],"subclasses":[],"mixedInto":["eui.form.Panel","eui.grid.Panel"],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.Mixin<div class='subclass '><strong>eui.mixin.Panel</strong></div></div><h4>Mixed into</h4><div class='dependency'><a href='#!/api/eui.form.Panel' rel='eui.form.Panel' class='docClass'>eui.form.Panel</a></div><div class='dependency'><a href='#!/api/eui.grid.Panel' rel='eui.grid.Panel' class='docClass'>eui.grid.Panel</a></div><h4>Files</h4><div class='dependency'><a href='source/Panel3.html#eui-mixin-Panel' target='_blank'>Panel.js</a></div></pre><div class='doc-contents'><h2>Summary</h2>\n\n<p>패널 클래스 공통제어 .</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-defaultToolbarPosition' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-defaultToolbarPosition' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-cfg-defaultToolbarPosition' class='name expandable'>defaultToolbarPosition</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;top&#39;</code></p></div></div></div><div id='cfg-defaultToolbarUi' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-defaultToolbarUi' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-cfg-defaultToolbarUi' class='name expandable'>defaultToolbarUi</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;default&#39;</code></p></div></div></div><div id='cfg-hiddenBtmTbar' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-hiddenBtmTbar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-cfg-hiddenBtmTbar' class='name expandable'>hiddenBtmTbar</a> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>하단 명령 툴바 제어. ...</div><div class='long'><p>하단 명령 툴바 제어.</p>\n<p>Defaults to: <code>false</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-mixinConfig' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-property-mixinConfig' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-property-mixinConfig' class='name expandable'>mixinConfig</a> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>{}</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-applyButtonToolBar' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-method-applyButtonToolBar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-method-applyButtonToolBar' class='name expandable'>applyButtonToolBar</a>( <span class='pre'>defaultButtons, otherButtons</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>명령 라인 버튼 설정\nhbuttons으로 추가될 경우 기존 버튼과 합쳐보여준다. ...</div><div class='long'><p>명령 라인 버튼 설정\nhbuttons으로 추가될 경우 기존 버튼과 합쳐보여준다.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>defaultButtons</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li><li><span class='pre'>otherButtons</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getDefaultToolbarPosition' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-defaultToolbarPosition' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-method-getDefaultToolbarPosition' class='name expandable'>getDefaultToolbarPosition</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of defaultToolbarPosition. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.mixin.Panel-cfg-defaultToolbarPosition\" rel=\"eui.mixin.Panel-cfg-defaultToolbarPosition\" class=\"docClass\">defaultToolbarPosition</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getDefaultToolbarUi' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-defaultToolbarUi' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-method-getDefaultToolbarUi' class='name expandable'>getDefaultToolbarUi</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of defaultToolbarUi. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.mixin.Panel-cfg-defaultToolbarUi\" rel=\"eui.mixin.Panel-cfg-defaultToolbarUi\" class=\"docClass\">defaultToolbarUi</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getHiddenBtmTbar' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-hiddenBtmTbar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-method-getHiddenBtmTbar' class='name expandable'>getHiddenBtmTbar</a>( <span class='pre'></span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of hiddenBtmTbar. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.mixin.Panel-cfg-hiddenBtmTbar\" rel=\"eui.mixin.Panel-cfg-hiddenBtmTbar\" class=\"docClass\">hiddenBtmTbar</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-setDefaultToolbarPosition' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-defaultToolbarPosition' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-method-setDefaultToolbarPosition' class='name expandable'>setDefaultToolbarPosition</a>( <span class='pre'>defaultToolbarPosition</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of defaultToolbarPosition. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.mixin.Panel-cfg-defaultToolbarPosition\" rel=\"eui.mixin.Panel-cfg-defaultToolbarPosition\" class=\"docClass\">defaultToolbarPosition</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>defaultToolbarPosition</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setDefaultToolbarUi' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-defaultToolbarUi' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-method-setDefaultToolbarUi' class='name expandable'>setDefaultToolbarUi</a>( <span class='pre'>defaultToolbarUi</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of defaultToolbarUi. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.mixin.Panel-cfg-defaultToolbarUi\" rel=\"eui.mixin.Panel-cfg-defaultToolbarUi\" class=\"docClass\">defaultToolbarUi</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>defaultToolbarUi</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setHiddenBtmTbar' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.mixin.Panel'>eui.mixin.Panel</span><br/><a href='source/Panel3.html#eui-mixin-Panel-cfg-hiddenBtmTbar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.mixin.Panel-method-setHiddenBtmTbar' class='name expandable'>setHiddenBtmTbar</a>( <span class='pre'>hiddenBtmTbar</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of hiddenBtmTbar. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.mixin.Panel-cfg-hiddenBtmTbar\" rel=\"eui.mixin.Panel-cfg-hiddenBtmTbar\" class=\"docClass\">hiddenBtmTbar</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>hiddenBtmTbar</span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});