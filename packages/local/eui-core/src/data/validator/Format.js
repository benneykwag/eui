/***
 *
 * ## Summary
 *
 * Ext.data.validator.Validator 확장. 한글 영문 숫자 문자에 대한 처리
 * 그리드 field정의 시 사용.
 *
 *      {
 *          name: 'USEPRSN_NM',
 *          validators: [
 *              {
 *                  type: "presence",
 *                  message :"성명은 필수 입력 필드입니다."
 *              },
 *              {
 *                  type: 'euiformat',
 *                  chkType:  'K',
 *                  message :"성명은 한글만 허용합니다"
 *              }
 *          ]
 *      },
 *      {
 *          name: 'MSG',
 *          validators: [
 *              {
 *                  type: 'euiformat',
 *                  chkType:  'C'
 *              }
 *          ]
 *      }
 *
 * # chkType
 * K : 한글만 허용.
 *
 * N : 숫자만 허용
 *
 * E : 알파벳 대문자만 허용
 *
 * Ee : 알파벳 대소문자만 허용
 *
 * # chkString
 * chkType에 맞는 정규식과 메시지 출력.
 *
 *     K: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
 *
 *     K_MSG: '한글만 허용합니다',
 *
 *     E: /^[A-Z]*$/,
 *
 *     E_MSG: '영문 대문자만 허용합니다',
 *
 *     e: /^[a-z]*$/,
 *
 *     e_MSG: '영문 소문자만 허용합니다',
 *
 *     Ee: /^[A-Za-z]*$/,
 *
 *     Ee_MSG: '영문 대소문자만 허용합니다',
 *
 *     N: /^[0-9+]*$/,
 *
 *     N_MSG: '숫자만 허용합니다',
 *
 *     C: /[A-Za-z|ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
 *
 *     C_MSG: '일반문자(한글&알파벳)만 허용합니다'
 *
 *
 *
 * # Sample
 *
 *     @example
 *
 *      Ext.define('Panel', {
 *          extend: 'eui.grid.Panel',
 *          defaultListenerScope: true,
 *          title: '체크박스그룹',
 *          plugins: {
 *              ptype: 'cellediting',   // 셀에디터를 추가.
 *              clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
 *          },
 *          store: {
 *              fields: [
 *                  {
 *                      name: 'USEPRSN_NM',
 *                      validators: [
 *                          {
 *                              type: 'euiformat',
 *                              chkType: 'K',
 *                              message: "성명은 한글만 허용합니다"
 *                          }
 *                      ]
 *                  },
 *                  {
 *                      name: 'MSG',
 *                      validators: [
 *                          {
 *                              type: 'euiformat',
 *                              chkType: 'Ee',
 *                              message: "메시지는 영문대소문자만 허용합니다"
 *                          }
 *                      ]
 *                  }
 *              ],
 *              data: [
 *                  {
 *                      USEPRSN_NM : '홍길동',
 *                      MSG : 'Error Message'
 *                  }
 *              ]
 *          },
 *
 *          columns: [
 *              {
 *                  text: '이름',
 *                  dataIndex: 'USEPRSN_NM',
 *                  editor: {
 *                      xtype: 'textfield'
 *                  }
 *              },
 *              {
 *                  text: '메시지',
 *                  dataIndex: 'MSG',
 *                  editor: {
 *                      xtype: 'textfield'
 *                  }
 *              }
 *          ],
 *
 *          bbar: [
 *              {
 *                  text: '저장',
 *                  xtype: 'button',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         onSaveMember: function () {
 *              var grid = this;
 *              if (!grid.store.recordsValidationCheck()) {
 *                  return;
 *              }
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: Util.getDatasetParam(grid.store),
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          }
 *      });
 *
 *      Ext.create('Panel',{
 *          width: 400,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.data.validator.Format', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.euiformat',

    type: 'euiformat',

    config: {
        chkType: null,

        /***
         * @cfg {Object} chkString
         *
         * chkType에 따른 정규식 및 메시지 설정
         */
        chkString: {
            K: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
            K_MSG: '한글만 허용합니다',
            E: /^[A-Z]*$/,
            E_MSG: '영문 대문자만 허용합니다',
            e: /^[a-z]*$/,
            e_MSG: '영문 소문자만 허용합니다',
            Ee: /^[A-Za-z]*$/,
            Ee_MSG: '영문 대소문자만 허용합니다',
            N: /^[0-9+]*$/,
            N_MSG: '숫자만 허용합니다',
            C: /[A-Za-z|ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
            C_MSG: '일반문자(한글&알파벳)만 허용합니다'
        },
        /**
         * @cfg {String} message
         * The error message to return when the value does not match the format.
         */
        message: null,

        /**
         * @cfg {RegExp} matcher (required) The matcher regex to test against the value.
         */
        matcher: undefined
    },

    //<debug>
    constructor: function () {
        this.callParent(arguments);
        if (!this.getChkType()) {
            Ext.raise('체크할 형식의 타입을 지정해야합니다.');
        }
    },
    //</debug>

    validate: function (value) {
        var me = this,
            matcher = this.getMatcher(),
            result = matcher && matcher.test(value),
            chkTypeString = me.getChkString()[me.getChkType()],
            chkTypeMessage = me.getChkString()[me.getChkType() + '_MSG'];
        if(value == undefined){
            return true;
        }
        if (this.getChkType()) {
            if(Ext.isNumeric(value)){
                if(me.getChkType() == 'N'){
                    return true;
                }
            }else{
                value = value.replace( /(\s*)/g, "");
            }

            for (var i = 0; i < value.length; i++) {
                result = me.getChkString()[me.getChkType()].test(value.substring(i, i + 1));
                if (!result) {
                    break;
                }
            }
        }
        return result ? result : this.getMessage() || chkTypeMessage;
    }
});