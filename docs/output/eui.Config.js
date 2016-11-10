Ext.data.JsonP.eui_Config({"tagname":"class","name":"eui.Config","autodetected":{"aliases":true,"alternateClassNames":true,"extends":true,"mixins":true,"requires":true,"uses":true,"members":true,"code_type":true,"singleton":true},"files":[{"filename":"Config.js","href":"Config.html#eui-Config"}],"aliases":{},"alternateClassNames":["Config"],"extends":"Ext.Base","mixins":[],"requires":[],"uses":[],"members":[{"name":"data","tagname":"property","owner":"eui.Config","id":"property-data","meta":{"private":true}},{"name":"defaultDateFormat","tagname":"property","owner":"eui.Config","id":"property-defaultDateFormat","meta":{"private":true}},{"name":"defaultDateTimeFormat","tagname":"property","owner":"eui.Config","id":"property-defaultDateTimeFormat","meta":{"private":true}},{"name":"localeCode","tagname":"property","owner":"eui.Config","id":"property-localeCode","meta":{"private":true}},{"name":"localeDisplayField","tagname":"property","owner":"eui.Config","id":"property-localeDisplayField","meta":{"private":true}},{"name":"localeUrl","tagname":"property","owner":"eui.Config","id":"property-localeUrl","meta":{}},{"name":"localeValueField","tagname":"property","owner":"eui.Config","id":"property-localeValueField","meta":{"private":true}},{"name":"initLocaleMessage","tagname":"method","owner":"eui.Config","id":"method-initLocaleMessage","meta":{}},{"name":"mergeMessageData","tagname":"method","owner":"eui.Config","id":"method-mergeMessageData","meta":{}}],"code_type":"ext_define","singleton":true,"id":"class-eui.Config","component":false,"superclasses":["Ext.Base"],"subclasses":[],"mixedInto":[],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Alternate names</h4><div class='alternate-class-name'>Config</div><h4>Hierarchy</h4><div class='subclass first-child'>Ext.Base<div class='subclass '><strong>eui.Config</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/Config.html#eui-Config' target='_blank'>Config.js</a></div></pre><div class='doc-contents'><p>App전역 변수 설정.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-data' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-property-data' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-property-data' class='name expandable'>data</a> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>{message: [{&quot;MSG_ID&quot;: &quot;행추가&quot;, &quot;MSG_LABEL&quot;: &quot;레코드추가&quot;}, {&quot;MSG_ID&quot;: &quot;행추가아이콘&quot;, &quot;MSG_LABEL&quot;: &quot;x-fa fa-plus-square&quot;}, {&quot;MSG_ID&quot;: &quot;행삭제&quot;, &quot;MSG_LABEL&quot;: &quot;레코드삭제&quot;}, {&quot;MSG_ID&quot;: &quot;행삭제아이콘&quot;, &quot;MSG_LABEL&quot;: &quot;x-fa fa-minus-square&quot;}, {&quot;MSG_ID&quot;: &quot;등록&quot;, &quot;MSG_LABEL&quot;: &quot;등록&quot;}, {&quot;MSG_ID&quot;: &quot;등록아이콘&quot;, &quot;MSG_LABEL&quot;: &quot;x-fa fa-table&quot;}, {&quot;MSG_ID&quot;: &quot;수정&quot;, &quot;MSG_LABEL&quot;: &quot;수정&quot;}, {&quot;MSG_ID&quot;: &quot;수정아이콘&quot;, &quot;MSG_LABEL&quot;: &quot;x-fa fa-th&quot;}, {&quot;MSG_ID&quot;: &quot;저장&quot;, &quot;MSG_LABEL&quot;: &quot;저장&quot;}, {&quot;MSG_ID&quot;: &quot;저장아이콘&quot;, &quot;MSG_LABEL&quot;: &quot;x-fa fa-save&quot;}, {&quot;MSG_ID&quot;: &quot;CONFIRM&quot;, &quot;MSG_LABEL&quot;: &quot;확인&quot;}, {&quot;MSG_ID&quot;: &quot;RECORD_DIRTY&quot;, &quot;MSG_LABEL&quot;: &quot;레코드가 수정중 입니다&quot;}, {&quot;MSG_ID&quot;: &quot;RECORD_DELETE&quot;, &quot;MSG_LABEL&quot;: &quot;레코드를 삭제하시겠습니까.?&quot;}, {&quot;MSG_ID&quot;: &quot;RECORD_DELETED&quot;, &quot;MSG_LABEL&quot;: &quot;레코드가 삭제되었습니다&quot;}]}</code></p></div></div></div><div id='property-defaultDateFormat' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-property-defaultDateFormat' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-property-defaultDateFormat' class='name expandable'>defaultDateFormat</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;Y.m.d&#39;</code></p></div></div></div><div id='property-defaultDateTimeFormat' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-property-defaultDateTimeFormat' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-property-defaultDateTimeFormat' class='name expandable'>defaultDateTimeFormat</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;Y.m.d H:i:s&#39;</code></p></div></div></div><div id='property-localeCode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-property-localeCode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-property-localeCode' class='name expandable'>localeCode</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;kr&#39;</code></p></div></div></div><div id='property-localeDisplayField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-property-localeDisplayField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-property-localeDisplayField' class='name expandable'>localeDisplayField</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;MSG_LABEL&#39;</code></p></div></div></div><div id='property-localeUrl' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-property-localeUrl' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-property-localeUrl' class='name expandable'>localeUrl</a> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"></span></div><div class='description'><div class='short'>메시지 제공용 서버사이드 주소. ...</div><div class='long'><p>메시지 제공용 서버사이드 주소.</p>\n\n<p>\"data\": [\n     {\"MSG_ID\": \"F000000119\", \"MSG_LABEL\": \"삭제할 데이터를 선택해 주세요.\"},\n     {\"MSG_ID\": \"F000000122\", \"MSG_LABEL\": \"신청일자를 입력해 주세요.\"},\n     {\"MSG_ID\": \"F000000129\", \"MSG_LABEL\": \"시간은 0~23 사이만 입력 가능합니다.\"},\n     {\"MSG_ID\": \"F000000130\", \"MSG_LABEL\": \"성명을 입력해 주시기 바랍니다.\"},\n]</p>\n</div></div></div><div id='property-localeValueField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-property-localeValueField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-property-localeValueField' class='name expandable'>localeValueField</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;MSG_ID&#39;</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-initLocaleMessage' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-method-initLocaleMessage' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-method-initLocaleMessage' class='name expandable'>initLocaleMessage</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>eui-core에 필요한 텍스트 레이블 정보. ...</div><div class='long'><p>eui-core에 필요한 텍스트 레이블 정보.</p>\n</div></div></div><div id='method-mergeMessageData' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.Config'>eui.Config</span><br/><a href='source/Config.html#eui-Config-method-mergeMessageData' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.Config-method-mergeMessageData' class='name expandable'>mergeMessageData</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>사용자가 data.message의 일부를 교체할 경우사용된다. ...</div><div class='long'><p>사용자가 data.message의 일부를 교체할 경우사용된다.\neui-core를 사용하는 app에서 override할 경우.\nExt.define('Override.eui.Config', {\n     override: '<a href=\"#!/api/eui.Config\" rel=\"eui.Config\" class=\"docClass\">eui.Config</a>',\n     message: [\n         {\"MSG_ID\": \"행추가\", \"MSG_LABEL\": \"로우추가\"}\n     ]\n});</p>\n</div></div></div></div></div></div></div>","meta":{}});