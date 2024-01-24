function chatOnWhatsapp() {
    let name         = $("#name").val();
    let checkindate  = $("#checkindate").val();
    let checkoutdate = $("#checkoutdate").val();
    let adultsnumber = $("#adultsnumber").val();

    if (!name) {
        alert("Name is required"); return;
    }
    if (!checkindate) {
        alert("check-in date is required"); return;
    }
    if (!checkoutdate) {
        alert("Check-out date is required"); return;
    }
    if (!adultsnumber) {
        alert("Adults count is required"); return;
    }

    let dateObject = new Date(checkindate);
    let options = { day: '2-digit', month: 'short'};

    checkindate = dateObject.toLocaleString('en-gb', options);

    dateObject = new Date(checkoutdate);
    checkoutdate = dateObject.toLocaleString('en-gb', options);

    let content      = "Hi, I am " + name + "!, and I am reaching out to explore room availability for " + adultsnumber + " members from " + checkindate + " to " + checkoutdate + ". Could you kindly share information on the availability and rates?";
    let whatsapp_url = "https://wa.me/918075418509?text=" + encodeURI(content);

    window.open(whatsapp_url, `_blank`);
}

// $(document).ready(function() {
//     var dateInput = document.getElementById('checkoutdate');
//     dateInput.value = 'This is the placeholder';
//     dateInput.addEventListener('input', function() {
//         if (!dateInput.value || dateInput.value === 'mm/dd/yyyy') {
//             dateInput.value = 'This is the placeholder';
//         }
//     });
// })

$(window).scroll(function() {
    $(".mainheader").css("backdrop-filter", "blur(15px)");
    $(".mainheader").css("background-color", "rgba(175,175,175,0.25)");
    var bgm = document.getElementById("bgm");
    bgm.play();
});

window.onscroll = function(){
    var B = document.body;
    var D = document.documentElement;
    D = (D.clientHeight)? D: B;
    if (D.scrollTop == 0){
        $(".mainheader").css("backdrop-filter", "blur(0px)");
        $(".mainheader").css("background-color", "transparent");
    }        
};
