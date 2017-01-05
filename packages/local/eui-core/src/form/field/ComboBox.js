/***
 *
 * ## Summary
 *
 * Ext.form.field.ComboBox를 확장한다.
 *
 * ## ProxyUrl
 * store를 별도로 정의하지 않을 경우 주소를 설정한다
 *
 * ## groupCode
 * 콤보 값이 groupCode라는 키값으로 데이터 로드시 전달된다.
 *
 *
 * ## 사용예
 *
 *      {
 *          fieldLabel: '콤보박스 TYPE2',
 *          xtype: 'euicombo',
 *          proxyUrl : 'resources/data/companys.json',  // store를 정의하지 않을 경우
 *          displayField: 'name',
 *          valueField: 'code',
 *          groupCode: 'A001',
 *          bind: '{RECORD.COMBOBOX02}'
 *      }
 *
 *      // resources/data/companys.json data
 *      {
 *          "success":true,
 *          "data":[
 *              {
 *                  "name":"마이크로소프트",
 *                  "code":"MICROSOFT"
 *              },
 *              {
 *                  "name":"B회사",
 *                  "code":"BCMP"
 *              },
 *              {
 *                  "name":"C회사",
 *                  "code":"CCMP"
 *              },
 *              {
 *                  "name":"D회사",
 *                  "code":"DCMP"
 *              }
 *          ],
 *          "message":""
 *      }
 *
 * # Sample
 *
 * Ext.form.field.Checkbox를 확장했다. 기존 클래스가 true, false, 1, on을 사용한다면
 * 이 클래스는 Y와 N 두가지를 사용한다.
 *
 *     @example
 *
 *      Ext.ux.ajax.SimManager.init({
 *          delay: 300,
 *          defaultSimlet: null
 *      }).register({
 *          'Numbers': {
 *              data: [[123,'One Hundred Twenty Three'],
 *                  ['1', 'One'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['5', 'Five'],
 *                  ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight'], ['9', 'Nine']],
 *              stype: 'json'
 *         }
 *      });
 *      Ext.define('ComboBox', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          title: '체크박스',
 *          items: [
 *             {
 *                  fieldLabel: '콤보박스 TYPE2',
 *                  xtype: 'euicombo',
 *                  proxyUrl : 'resources/data/companys.json',
 *                  displayField: 'name',
 *                  valueField: 'code',
 *                  groupCode: 'A001',
 *                  bind: '{RECORD.COMBOBOX01}'
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  COMBOBOX01 : 'MICROSOFT'
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          checkboxHandler: function(button){
 *              this.down('#checkbox1').setValue('Y');
 *              //this.down('#checkbox1').setValue(true);
 *          },
 *
 *          unCheckboxHandler: function(button){
 *              this.down('#checkbox1').setValue('N');
 *              this.down('#checkbox1').setValue(false);
 *          }
 *      });
 *
 *      Ext.create('ComboBox',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/


Ext.define('eui.form.field.ComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.euicombo',

    requires: [
        'Util',
        "eui.form.field.ComboBoxController"
    ],
    controller: 'spcombo',
    /***
     * 요구 정의.
     * 1. groupCode를 설정해 해당 코드를 가져온다.
     * 2. 폼필드와 연계되어 해당 폼필드의 변경사항이 있을 경우
     *      재로드한다.
     * 3. queryMode : 'local'을 지정할 경우 내부 필터링된다.
     *      이경우에도 연계된 폼필드가 있고 변경사항이 있다면
     *      재로드해야한다.
     */
    /// 기본 설정.
    minChars: 1,
    editable: false,
    emptyText: '선택하세요',
    cellCls: 'fo-table-row-td',
    displayField: 'NM',
    valueField: 'CD',
    autoLoadOnValue: true,
    width: '100%',
//    proxyParams : {},
    config: {

        nextBindComboExpand: true,
        /***
         * @cfg {string} proxyUrl
         * 데이터를 얻기 위한 서버사이드 주소
         */
        proxyUrl: {},
        /***
         * @cfg {string} defaultParam
         * 콤보가 데이터를 얻기 위한 기본 파라메터이다.
         * 코드성 데이터를 얻기 위해서는 코드집합의 구분자가 필요하다.
         * 기본값은 groupCode이다.
         */
        defaultParam: 'groupCode',
        /***
         * @cfg {boolean} useLocalFilter
         * editable:true해 입력된 값을 서버로 전달하지 않고
         * 로드한 데이터를 활용한 필터를 작동시킨다.
         * true일 경우 queryMode를 'local'로 변경한다.
         */
        useLocalFilter: false,
        proxyParams: null,
        proxyType: 'ajax',
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        /***
         * @cfg {String} valueColumnDataIndex
         * 그리드 내부 에디터로 사용 할 경우로 항상 코드명을 표현하기 위한 용도로
         * 사용되며 이 설정은 에디터를 select한 이후 에디터 내부 코드에 해당하는
         * 값을 그리드 모델에 write해주기 위한 용도다.         *
         */
        valueColumnDataIndex: null,
        /***
         *  @cfg {String Array} relBindVars
         *  콤보가 데이터를 얻기 위해 참조하는 다른 뷰모델 데이터를 정의한다.
         *  일반적으로 콤보는 폼패널 내부의 폼필드 값을 참조하거나 동적으로 변경되는
         *  값을 콤보를 클릭할 때마다 불러와 서버사이드에 전달하도록 하기 위함이다.
         *  이 설정을 이용하면 뷰모델과 상관없이 특정 이름으로 정해진 값을 전달할 수도 있다.
         *  @example
         *
         *  xtype: 'euicombo',
         *  editable: true,
         *  relBindVars: ['CUSTOMER_CODE|CSCODE@2000'],
         *
         *  CUSTOMER_CODE   : 뷰모델 변수명(존재하지 않는 경우는 값이 null로 전달되므로 이 경우는 뷰모델과 상관없이 서버사이드에 원하는 값을 지정해 전달할 목적으로 사용한다.)
         *  |               : 서버사이드에 전송될 이름을 변경할 경우 구분자를 사용해 이후 정의한다.
         *  CSCODE          : 뷰모델 변수명 대신 CSCODE라는 이름으로 보낼수 있다.
         *  @               : 뷰모델 변수의 값을 보내지 않고 원하는 값을 지정할 경우 구분자.
         *  2000            : 뷰모델 변수의 값 대신 전달할 값.
         *
         */
        relBindVars: null
    },

    // clear button add
//    triggers: {
//        arrow: {
//            cls: 'x-form-clear-trigger',
//            handler: 'clearValue',
//            scope: 'this'
//        }
//    },

    valueNotFoundText: '검색결과가 존재하지 않습니다.',

    listeners: {
//        focus: function () {
//            var me = this;
//            if (me.nextBindComboExpand) {
//                Ext.defer(function () {
//                    Ext.get(me.getId()).select('.x-form-arrow-trigger').elements[0].click();
//                    //                Ext.get(me.getId()).select('div#' + me.getId() + '-trigger-picker').elements[0].click();
//                }, 100)
//            }
//        },
        //render: 'initCombo',
        select: 'onSelect',
        beforequery: 'beforeCheckParamValue'
    },

    initComponent: function () {
        var me = this;
        if (me.column && me.valueColumnDataIndex) {
            // tab 키로 그리드 내부에서 이동하면 select되지 않는다.
            me.column.getView().ownerGrid.getCellEditor().on('beforeedit', function (editor, context) {
                me.selectedRecord = context.record;
            });

            Ext.apply(me, {
                originalValueField: me.valueField,
                valueField: me.displayField
            });
        }

        me.callParent(arguments);
    },

    clearValue: function () {
        this.callParent(arguments);
        this.getController().clearValue();
    },

    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    },

    /***
     * value 또는 bind에 의해 값이 설정될 경우만
     * autoLoad: true 하고 나머진 false한다.
     * 값이 설정되지 않은 경우에는 데이터를 미리 가져오지
     * 않도록 한다.
     */
    checkAutoLoad: function () {

        if (this.value) {
            return true;
        }
        if (this.getBind() && this.getBind()['value'] && this.getBind().value.stub.hadValue) {
            return true;
        }
        // 값이 설정되지 않을 경우. 콤보가 로드 되지 않는 현상 해결..
        if(this.column && !this.value){
            return true;
        }
        return false;
    }

});
