$(document).ready(function(){

    /* bootstrap tooltip */    
        $(".tip").tooltip({placement: 'top'});    
        $(".tipb").tooltip({placement: 'bottom'});    
        $(".tipl").tooltip({placement: 'left'});        
        $(".tipr").tooltip({placement: 'right'});     
    /* eof bootstrap tooltip */
            
    /* scroll */
    if($("#layout_scroll").length > 0)
        $("#layout_scroll").height($(window).height() - 80);    
    
    if($(".scroll").length > 0) $(".scroll").mCustomScrollbar({advanced: {autoScrollOnFocus: false}});
    
        $(".modal").on('shown.bs.modal',function(){
            $(this).find('.scroll').mCustomScrollbar('update');
        });        

    if($(".scroll-mail").length > 0){                
        $(".scroll-mail").height($(window).height() - 185).mCustomScrollbar({advanced: {autoScrollOnFocus: false}});
    }    
    /* eof scroll */
    
    //Bootstrap file input    
    if($("input.fileinput").length > 0)
        $("input.fileinput").bootstrapFileInput();    
    //END Bootstrap file input    
    
    /* Accordion */
    if($(".accordion").length > 0){
       $(".accordion").accordion({heightStyle: "content"});
       $(".accordion .ui-accordion-header:last").css('border-bottom','0px');
    }    
    /* EOF Accordion */    
    
    /* uniform */
    if($("input[type=checkbox]").length > 0 || $("input[type=radio]").length > 0)
       $("input[type=checkbox], input[type=radio]").not('.skip').uniform();
    /* eof uniform */
    
    /* select2 */
    if($(".select2").length > 0) $(".select2").select2();
    /* eof select2 */
    
    /* tagsinput */
    if($(".tags").length > 0) $(".tags").tagsInput({width: '100%',height:'auto'});
    if($(".mail_tags").length > 0) $(".mail_tags").tagsInput({width: '100%',height:'auto','defaultText':'add email'});    
    /* eof tagsinput */
        
    /* jQuery UI Datepicker */
    if($(".datepicker").length > 0) $(".datepicker").datepicker({nextText: "", prevText: ""});
    if($(".mdatepicker").length > 0) $(".mdatepicker").datepicker({numberOfMonths: 3,nextText: "", prevText: ""});   
    /* EOF jQuery UI Datepicker */
    
    /* Timepicker */
    if($(".timepicker").length > 0) $(".timepicker").timepicker();
    /* EOF Timepicker */
    
    /* Datetimepicker */
    if($(".datetimepicker").length > 0) $(".datetimepicker").datetimepicker({nextText: "", prevText: ""});
    /* EOF Datetimepicker */    
    
    /* Datatables */
    if($("table.sortable_simple").length > 0)
        $("table.sortable_simple").dataTable({"iDisplayLength": 5,"bLengthChange": false,"bFilter": false,"bInfo": false,"bPaginate": true});
    
    if($("table.sortable_default").length > 0)
        $("table.sortable_default").dataTable({"iDisplayLength": 5, "sPaginationType": "full_numbers","bLengthChange": false,"bFilter": false,"bInfo": false,"bPaginate": true, "aoColumns": [ { "bSortable": false }, null, null, null, null]});
    
    if($("table.sortable").length > 0)
        $("table.sortable").dataTable({"iDisplayLength": 5, "aLengthMenu": [5,10,25,50,100], "sPaginationType": "full_numbers", "aoColumns": [ { "bSortable": false }, null, null, null, null]});    
    /* eof Datatables */

    /* knob plugin */
    if($(".knob").length > 0) $(".knob input").knob();
    /* eof knob plugin */
    
    /* sparkline */
    if($(".sparkline").length > 0)
       $('.sparkline span').sparkline('html', { enableTagOptions: true });
    /* eof sparkline */
    
    /* CLEditor */
    if($(".cle").length > 0)
        cE = $(".cle").cleditor({width:"100%",height: 230});        
    
    if($(".cleditor").length > 0)
        cEdit = $(".cleditor").cleditor({width:"100%",height: 450});     
    
    if($(".scle").length > 0)
        cEC = $(".scle").cleditor({width:"100%",height: 230,controls: "bold italic underline strikethrough link unlink"})[0].focus();
        
    $('#modal_mail').on('shown.bs.modal', function () {
        cEC.refresh();
    });          
    /* eof CLEditor */
    
    /* draggable modal */
    if($(".modal-draggable").length > 0){
        $(".modal-draggable").draggable();
    }
    /* eof draggable modal */
    
    /* Tinymce */
        if($("textarea.tmce").length > 0){
            tinymce.init({
                selector: "textarea.tmce",
                height : 400
            });
        }
        if($("textarea.stmce").length > 0){
            tinymce.init({
                selector: "textarea.stmce",
                toolbar: "bold italic | alignleft aligncenter alignright alignjustify | undo redo",                
                menu: [],                
                height : 200
            });
        }        
    /* eof tinymce */
    
    /* ValidationEngine */    
    if($("#validate").length > 0 || $("#validate_custom").length > 0)
        $("#validate, #validate_custom").validationEngine('attach',{promptPosition : "topLeft"});    
    /* EOF ValidationEngine */    
    
    /* Stepy*/
    if($("#wizard").length > 0) $('#wizard').stepy();
    
    if($("#wizard_validate").length > 0){        
        $("#wizard_validate").validationEngine('attach',{promptPosition : "topLeft"});        
        $('#wizard_validate').stepy({
            back: function(index) {                                                                
                //if(!$("#wizard_validate").validationEngine('validate')) return false; //uncomment if u need to validate on back click                
            }, 
            next: function(index) {                
                if(!$("#wizard_validate").validationEngine('validate')) return false;                
            }, 
            finish: function(index) {                
                if(!$("#wizard_validate").validationEngine('validate')) return false;
            }            
        });
    }    
    /* EOF Stepy */    

    /* Masked Input */
    if($("input[class^='mask_']").length > 0){
        $("input.mask_tin").mask('99-9999999');
        $("input.mask_ssn").mask('999-99-9999');        
        $("input.mask_date").mask('9999-99-99');
        $("input.mask_product").mask('a*-999-a999');
        $("input.mask_phone").mask('99 (999) 999-99-99');
        $("input.mask_phone_ext").mask('99 (999) 999-9999? x99999');
        $("input.mask_credit").mask('9999-9999-9999-9999');        
        $("input.mask_percent").mask('99%');
    }    
    /* EOF Masked Input */
    
    /* Syntax Highlight */
    if($("pre[class^=brush]").length > 0){
        SyntaxHighlighter.defaults['toolbar'] = false;
        SyntaxHighlighter.all();   
    }
    /* EOF Syntax Highlight */    
    
    /* Fancybox */
    if($(".fancybox").length > 0)
       $(".fancybox").fancybox({padding: 10});
    /* EOF Fancybox */
    
    /* carousel */
    if($('.carousel').length > 0) $('.carousel').carousel();
    /* eof carousel */
    
    /* fullcalendar (demo) */
    
    if($("#calendar").length > 0){

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        
        
        $('#external-events .external-event').each(function() {
                var eventObject = {title: $.trim($(this).text())};

                $(this).data('eventObject', eventObject);
                $(this).draggable({
                        zIndex: 999,
                        revert: true,
                        revertDuration: 0
                });
        });        
        
        var calendar = $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            editable: true,
            events: [{title: 'All Day Event',start: new Date(y, m, 1)},
                     {title: 'Long Event',start: new Date(y, m, d-5),end: new Date(y, m, d-2)},
                     {id: 999,title: 'Repeating Event',start: new Date(y, m, d-3, 16, 0),allDay: false},
                     {id: 999,title: 'Repeating Event',start: new Date(y, m, d+4, 16, 0),allDay: false},
                     {title: 'Meeting',start: new Date(y, m, d, 10, 30),allDay: false},
                     {title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
                     {title: 'Birthday Party',start: new Date(y, m, d+1, 19, 0),end: new Date(y, m, d+1, 22, 30),allDay: false},
                     {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}],
            droppable: true,
            selectable: true,
            selectHelper: true,
            select: function(start, end, allDay) {
                var title = prompt('Event Title:');
                if (title) {
                    calendar.fullCalendar('renderEvent',
                    {
                        title: title,
                        start: start,
                        end: end,
                        allDay: allDay
                    },
                    true
                    );
                }
                calendar.fullCalendar('unselect');
            },
            drop: function(date, allDay) {

                var originalEventObject = $(this).data('eventObject');

                var copiedEventObject = $.extend({}, originalEventObject);

                copiedEventObject.start = date;
                copiedEventObject.allDay = allDay;

                $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);


                if ($('#drop-remove').is(':checked')) {
                    $(this).remove();
                }

            }
        });        
        
        
    }
    
    /* eof fullcalendar (demo) */    
    
    /* popover (demo) */
    $("[data-toggle=popover]").popover();
    /* eof popover (demo) */
    
    /* slider example(demo) */
    $(".slider_example").slider({range: "min", min: 0, max: 100, value: 50});
    $(".slider_example2").slider({range: true,min: 0,max: 500,values: [ 150, 350 ]});
    $(".slider_example3").slider({orientation: "vertical",range: "min",min: 0,max: 100,value: 50});
    $(".slider_example4").slider({orientation: "vertical",min: 0,max: 500,range: true,values: [ 150, 350 ]});
    
    
    if($("#price_rage").length > 0){
        $("#price_rage").slider({range: true,min: 0,max: 3000,values: [ 1000, 2000 ],
                                slide: function(event,ui){
                                    $("#price_amount").html( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
                                }});
        $("#price_amount").html("$"+$("#price_rage").slider("values",0)+" - $"+$("#price_rage").slider("values",1));                         
    }
    /* eof slider example(demo) */
            
    /* slider example(demo) */
    $("#spinner").spinner();
    $("#spinner2").spinner({step: 0.1});
    $("#spinner3").spinner({min: 0,max: 2500,step: 25.15,numberFormat: "C"});
    /* eof slider example(demo) */        
    
    /* button state(demo)*/
    $('#fat-btn').click(function () {
        var btn = $(this)
        btn.button('loading')
        setTimeout(function () {
          btn.button('reset')
        }, 3000);
    });  
    /* eof button state(demo)*/    

    /* sortable (demo)*/
    if($("#sortable_example_1").length > 0){
        $("#sortable_example_1").sortable({items: ".list-group-item"});
        $("#sortable_example_1").disableSelection();
    }
    /* eof sortable (demo)*/
    
    /* selectable (demo)*/
    if($( "#selectable_example_1" ).length > 0){
        $( "#selectable_example_1" ).selectable();    
    }
    /* eof selectable (demo)*/    
});

$(window).resize(function(){
    
    if($("#layout_scroll").length > 0)
        $("#layout_scroll").height($(window).height() - 80).mCustomScrollbar('update');

    if($(".scroll-mail").length > 0)
        $(".scroll-mail").height($(window).height() - 205).mCustomScrollbar('update');    
        
});