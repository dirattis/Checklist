
$(document).ready(function(){
    $("[data-action='minifyMenu']").click(function(){

        $("body").toggleClass("minified");
        var seta = $(".arrow-mini-menu i");

        if($(seta).hasClass("fa-arrow-circle-left")){
            $(seta).removeClass("fa-arrow-circle-left");
            $(seta).addClass("fa-arrow-circle-right");
        }
        else{
            $(seta).removeClass("fa-arrow-circle-right");
            $(seta).addClass("fa-arrow-circle-left");
            
        }
    });  

});


