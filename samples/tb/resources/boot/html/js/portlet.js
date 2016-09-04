$(document).ready(function(){
        
    if($(".sortableContent").length > 0){
        var scid = 'sc-'+$(".sortableContent").attr('id');
                
        var sCdata = portlet_get_data(scid);          

        if(null != sCdata){            
            for(row=0;row<Object.size(sCdata); row++){                
                for(column=0;column<Object.size(sCdata[row]);column++){                    
                    for(block=0;block<Object.size(sCdata[row][column]);block++){                        
                        $("#"+sCdata[row][column][block]).appendTo(".sortableContent .scRow:eq("+row+") .scCol:eq("+column+")");                        
                    }
                }               
            }            
        }                    
       
        $(".sortableContent .scCol").sortable({
            connectWith: ".sortableContent .scCol",
            items: "> .block",
            handle: ".header",
            placeholder: "scPlaceholder",
            start: function(event,ui){
                $(".scPlaceholder").height(ui.item.height());
            },
            stop: function(event, ui){                                
                
                var sorted = {};
                var row = 0;
                $(".sortableContent .scRow").each(function(){                    
                    sorted[row] = {};
                    $(this).find(".scCol").each(function(){
                        var column = $(this).index();                        
                        sorted[row][column] = {};

                        $(this).find('.block').each(function(){
                            sorted[row][column][$(this).index()] = $(this).attr('id');
                        });
                    });
                    row++;
                });
                portlet_save_data(scid,JSON.stringify(sorted));                
            }
        }).disableSelection();
        
        $(".sc-set-default").on("click",function(){
            portlet_delete_data(scid);
            location.reload();
        });
        
    }        
    
    
});

function portlet_get_data(portlet_id){
    if(typeof(Storage)!=="undefined"){
        if(sessionStorage[portlet_id] != '') return $.parseJSON(sessionStorage[portlet_id]);
    }
}

function portlet_save_data(portlet_id, portlet_data){
    if(typeof(Storage)!=="undefined"){        
        sessionStorage[portlet_id] = portlet_data;
    }else{
        return false;
    }
}

function portlet_delete_data(portlet_id){
    if(typeof(Storage)!=="undefined"){
        if(sessionStorage[portlet_id] != '') sessionStorage.removeItem(portlet_id);
    }
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};