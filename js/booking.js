var LevelMsg = "";
LevelMsg += "<b>Please read this important Terms and Conditions for the Internet Booking</b>";
LevelMsg += "<br />";
LevelMsg += "<br />";
LevelMsg += "<b><span style='color:red;'>1. Tickets have to be collected {{hours}} before the show time, else the seats would be allotted to other customers automatically.</b></span>";
LevelMsg += "<br />";
LevelMsg += "<b><span style='color:red;'>2. Charges collected are towards the convenience charge only, it does not include the ticket cost.</b></span>";
LevelMsg += "<br />";
LevelMsg += "<b>3. Ticket cost has to be paid at the counter after producing the confirmation number.</b>";
LevelMsg += "<br />";
LevelMsg += "<b>4. TicketNew does not have any information on the ticket cost.</b>";
LevelMsg += "<br />";
LevelMsg += "<b>5. Convenience charge would not be refunded if the tickets are not collected on-time at the counter.</b>";
var sbireturnval, sbiintervaltime;
function checkCookie(value) {
    var MyCkieVal = $.cookie("pageVisit");
    if (MyCkieVal != null && MyCkieVal != "") {
        var CookieLen = MyCkieVal.split(",");
        if (CookieLen.length < 20) setCookie("pageVisit", value);
    } else {
        setCookie("pageVisit", value);
    }
}
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    else {
        if (verOTP.length == 0) {
            $("#btnVerify").prop('disabled', false);
            $("#btnVerify").css('background', '#FF9800');
        }
    }

    return true;
}

function otpisNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    var verOTP = $("#txtpaytmOTP").val();

    if (charCode > 31 && (charCode < 48 || charCode > 57)) { // non numeric
        return false;
    }
    else {
        if (verOTP.length == 0) {
            $("#btnVerify").prop('disabled', false);
            $("#btnVerify").css('background', '#FF9800');
        }
    }

    return true;
}
function setCookie(c_name, value) {
    var existingValue = $.cookie(c_name);
    if (existingValue != null) {
        if (RemoveCookie(existingValue, value) == null) $.cookie(c_name, value + "," + existingValue, {
            expires: 365
        });
        else $.cookie(c_name, value + "," + RemoveCookie(existingValue, value), {
            expires: 365
        });
    } else {
        $.cookie(c_name, value, {
            expires: 365
        });
    }
}


// takes the form field value and returns true on valid number
function valid_credit_card(value) {
    // accept only digits, dashes or spaces
    if (/[^0-9-\s]+/.test(value)) return false;

    // The Luhn Algorithm. It's so pretty.
    var nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
			  nDigit = parseInt(cDigit, 10);

        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }

        nCheck += nDigit;
        bEven = !bEven;
    }

    return (nCheck !== 0) && (nCheck % 10) == 0
}

function RemoveCookie(array, to_remove) {
    var values = array.split(",");
    for (var i = 0; i < values.length; i++) {
        if (values[i] == to_remove) {
            values.splice(i, 1);
            return values.join(",");
        }
    }
}

var sbiUPITimer = null;
function detectOrderExpiresbiupi() {

    var _lockSecond, _lockSeatTime, _countdown;

    _lockSecond = 300;
    _lockSeatTime = +new Date();

    _countdown = function () {


        var _diffNowSecond = (+new Date() - _lockSeatTime) / 1000 | 0,
            _leftSecond = _lockSecond - _diffNowSecond,

            _min = _leftSecond / 60 | 0,
            _sec = _leftSecond - _min * 60;
        if (_min <= 0) {
            _min = 0;
        }
        if (_sec <= 0) {
            _sec = 0;
        }
        // format
        _min = _min < 10 ? '0' + _min : _min;
        _sec = _sec < 10 ? '0' + _sec : _sec;
        $("#sbiexpirytime").html("Collect request  expires in " + _min + ":" + _sec);

        // timer is end
        if (_leftSecond <= 0) {
            clearInterval(sbiUPITimer);
            $("#sbiexpirytime").text("Expired 00:00");
            $('#sbiupiprogress').hide();
        }

        return _leftSecond;
    };

    if (_countdown() > 0) {
        sbiUPITimer = setInterval(function () {
            _countdown();
        }, 1000);
    }
}
function sbiprocess(pgidsbip, vpavalp, iReqidp) {
    var purl = 'OnlineTheatre/PG/PGSelection.aspx/SBIprocess';
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        accept: 'application/json; charset=utf-8',
        url: purl,
        data: "{'pid':'" + pgidsbip + "','vpa':'" + vpavalp + "','amount':'" + document.getElementById('hdnAmount').value + "','iReqid':'" + iReqidp + "','transidsbi':'" + document.getElementById('hdntransid').value + "'}",
        success: function (result) {
            var res = result.d.split(",");
            TKTNEW.Misc.loader(false);
            if (res[1] == "S") {

                //collect req initiated
                TKTNEW.Misc.alert({
                    message: res[0],
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'

                        }
                    }
                });
                // wait for user respond sbi upi
                $('#sbiupiprogress').show();
                detectOrderExpiresbiupi();
                SBIprocessresponse(sbiintervaltime);

            }
            else {
                TKTNEW.Misc.alert({ message: res[0], buttons: { ok: { text: 'Ok', btnClass: 'tn-green' } } });

            }
        }
    });
}



function SBIprocessresponse(sbiinterval) {


    var mess;
    // var purlresp = 'OnlineTheatre/Theatre/BoxOfficeCalls.asmx/SBIprocessresponse';
    var purlresp = "OnlineTheatre/PG/PGSelection.aspx/SBIprocessresponse";
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'application/json; charset=utf-8',
        accept: 'application/json; charset=utf-8',
        url: purlresp,
        data: "{'sbiReqId':'" + document.getElementById('hdnreqid').value + "','StatusChkSecsbi':'" + sbiinterval + "'}",
        success: function (resultr) {
            if (resultr.d != undefined) {

                if (sbiUPITimer) clearInterval(sbiUPITimer); $('#sbiupiprogress').hide();
                mess = resultr.d;
                TKTNEW.Misc.alert({
                    message: resultr.d,
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green',
                            action: function () { __doPostBack("MakePayment", sbireturnval); }
                        }
                    }
                });
                // user response complete

                return true;

            }
        },
        error: function () { alert('Error in process request !! retry again ..'); },
        complete: function () {
            if (mess == '') {
                TKTNEW.Misc.alert({
                    message: 'Transaction fail:Collect request expired',
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green',
                            action: function () { __doPostBack("MakePayment", sbireturnval); }
                        }
                    }
                });

            }




        }
    });
}


function resendpaytmotp(tok, ridval) {

    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        url: 'OnlineTheatre/PG/PGSelection.aspx/resendotppaytm',
        data: "{'txnToken':'" + tok + "','reqid':'" + ridval + "','uphone':'" + document.getElementById('hdnmobile').value + "'}",
        accept: 'application/json; charset=utf-8',
        success: function (result) {
            if (result.d != null) {
                TKTNEW.Misc.alert({
                    message: result.d.toString(),
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });

            }

        },
        error: function () {
            TKTNEW.Misc.alert({
                message: "Error in Resending OTP !! Retry again ..",
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
        }
    });

}


function paytmNetbprocesstransaction(tokenval, ridval, tidval, pmode, pinfo) {
    AjaxCalls.setLoader(true);
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        url: 'OnlineTheatre/PG/PGSelection.aspx/paytmNetbprocesstransaction',
        data: "{'txnToken':'" + tokenval + "','reqid':'" + ridval + "','transid':'" + tidval + "','paymode':'" + pmode + "','payinfo':'" + pinfo + "'}",
        accept: 'application/json; charset=utf-8',
        success: function (result) {
            if (result.d != "") {
                AjaxCalls.setLoader(true);
                // postback to pgselection
                if (result.d != "") {

                    __doPostBack("MakePayment", result.d);

                }

            }
            else {
                TKTNEW.Misc.alert({
                    message: "Error in Process Transaction..Retry!",
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });
                AjaxCalls.setLoader(false);
                return false;
            }

        },
        error: function () {
            TKTNEW.Misc.alert({
                message: "Error in processing transaction..Retry !!",
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            AjaxCalls.setLoader(false);
            return false;
        }
    });



}

function validatevpa(tokenval, ridval, pmode, pinfo) {

   // alert('d');
    AjaxCalls.setLoader(true);
    var error = 0;
  //  if (pmode == "UPI")
    {
        debugger;
        TKTNEW.Misc.ajax({
            type: 'POST',
            datatype: 'json',
            contenttype: 'string',
            async: false,
                 url: 'OnlineTheatre/PG/PGSelection.aspx/paytmValidateVPAAPI',
          // url: 'TicketNewWebsite_New/OnlineTheatre/PG/PGSelection.aspx/paytmValidateVPAAPI',
            data: "{'txnToken':'" + tokenval + "','reqid':'" + ridval + "','payinfo':'" + pinfo + "'}",
            accept: 'application/json; charset=utf-8',
            success: function (result) {
                if (result.d != "") {
                   // debugger;
                    // postback to pgselection
                    if (result.d != "") {
                        var upiRespoo = JSON.parse(result.d);
                        if (upiRespoo.body.resultInfo.resultStatus == "F") {
                           // debugger;
                            error++;
                            TKTNEW.Misc.alert({
                                message: upiRespoo.body.resultInfo.resultMsg,
                                buttons: {
                                    ok: {
                                        text: 'Ok',
                                        btnClass: 'tn-green'
                                    }
                                }
                            });
                            AjaxCalls.setLoader(false);
                            return false;
                        }
                        else {
                            paytmFinalprocesstransaction(tokenval, ridval, pmode, pinfo);

                        }

                    }

                }
                else {
                    TKTNEW.Misc.alert({
                        message: "Error in Process Transaction..Retry!",
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    AjaxCalls.setLoader(false);
                    return false;
                }

            },
            error: function () {
                TKTNEW.Misc.alert({
                    message: "Error in processing transaction..Retry !!",
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });
                AjaxCalls.setLoader(false);
                return false;
            }
        });

    }
}

function paytmFinalprocesstransaction(tokenval, ridval, pmode, pinfo) {
  
    

    AjaxCalls.setLoader(true);
  //  debugger;
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        url: 'OnlineTheatre/PG/PGSelection.aspx/paytmFinalprocesstransaction',
     //   url: 'TicketNewWebsite_New/OnlineTheatre/PG/PGSelection.aspx/paytmFinalprocesstransaction',
        data: "{'txnToken':'" + tokenval + "','reqid':'" + ridval + "','paymode':'" + pmode + "','payinfo':'" + pinfo + "','savecard':'" + document.getElementById('hdnpaytmsavecardflag').value + "'}",
        accept: 'application/json; charset=utf-8',
        success: function (result) {
            if (result.d != "") {
                AjaxCalls.setLoader(true);
                // postback to pgselection
                if (result.d != "") {
                 //   debugger;
                    __doPostBack("MakePayment", result.d);

                }

            }
            else {
                TKTNEW.Misc.alert({
                    message: "Error in Process Transaction..Retry!",
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });
                AjaxCalls.setLoader(false);
                return false;
            }

        },
        error: function () {
            TKTNEW.Misc.alert({
                message: "Error in processing transaction..Retry !!",
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            AjaxCalls.setLoader(false);
            return false;
        }
    });



}
function paytmWalletcheckbalance(token, rid, modeval) {
    AjaxCalls.setLoader(true);
    var pgsel = "Paytm Wallet";
    if (modeval == "BALANCE") {
        pgsel = "Paytm Wallet";
    }
    else {
        pgsel = "Paytm PostPaid";
    }
    document.getElementById('hdnaddnpayflag').value = "0";
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        url: 'OnlineTheatre/PG/PGSelection.aspx/paytmxpressbalancecheck',
        data: "{'txnToken':'" + token + "','reqid':'" + rid + "','useramount':'" + document.getElementById('hdnAmount').value + "','optionmode':'" + modeval + "'}",
        accept: 'application/json; charset=utf-8',
        success: function (result) {
            if (result.d.toLowerCase() == "s") {
                // process transaction
                AjaxCalls.setLoader(true);

                TKTNEW.Misc.alert({
                    message: "Do you wish to proceed for payment using " + pgsel + " !",
                    buttons: {
                        cancel: {
                            text: 'Cancel',
                            btnClass: 'tn-red',
                            action: function () {
                                TKTNEW.Misc.alert({
                                    message: "Transaction cancelled ! ",
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                                AjaxCalls.setLoader(false);
                            }
                        },
                        accept: {
                            text: 'Procees to pay',
                            btnClass: 'tn-green',
                            action: function () {
                                AjaxCalls.setLoader(true);
                                paytmFinalprocesstransaction(token, rid, modeval, "");
                            }
                        }
                    }
                });


            }
            else {
                if (modeval == "BALANCE" && (document.getElementById('hdndcmode').value) == "48") {

                    AjaxCalls.setLoader(false);

                    TKTNEW.Misc.alert({
                        message: result.d,
                        buttons: {
                            cancel: {
                                text: 'Cancel',
                                btnClass: 'tn-red'
                            },
                            accept: {
                                text: 'Add Money in wallet',
                                btnClass: 'tn-green',
                                action: function () {
                                    // debit card flow - no money in wallet
                                    TKTNEW.Misc.alert({
                                        message: "Do you wish to book your tickets through Debit card ? ",
                                        buttons: {
                                            cancel: {
                                                text: 'Cancel',
                                                btnClass: 'tn-red'
                                            },
                                            accept: {
                                                text: 'Pay',
                                                btnClass: 'tn-green',
                                                action: function () {
                                                    // show the debit card detail box 
                                                    var $walletrad = $("[aria-hidden='false'], .tn-last-offer-pg-area").find(".tn-radio-button-block input[type='radio']:checked");

                                                    var $wallletobj = $("[tit='Paytm Wallet']");
                                                    $wallletobj.removeClass('selected');
                                                    $walletrad.attr('checked', false);
                                                    $walletrad.prop('checked', 'unchecked');
                                                    if (document.getElementById("hdnOfferAllowedpgs").value == "47,48") {
                                                        $("#payment_modes_1").tabs({ active: 1 });
                                                    }
                                                    else {
                                                        $("#payment_modes_1").tabs({ active: 0 });
                                                    }

                                                    document.getElementById('hdnaddnpayflag').value = "1";

                                                }
                                            }
                                        }
                                    });

                                }
                            }
                        }
                    });

                }
                else {
                    TKTNEW.Misc.alert({
                        message: result.d,
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    AjaxCalls.setLoader(false);
                }
            }
            AjaxCalls.setLoader(false);

        },
        error: function () {
            TKTNEW.Misc.alert({
                message: "Error in checking balance ..",
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            AjaxCalls.setLoader(false);
        }
    });

    AjaxCalls.setLoader(true);


}
function paytmfetchBindetail(token, rid, paytmcard) {


    AjaxCalls.setLoader(true);
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        url: 'OnlineTheatre/PG/PGSelection.aspx/paytmfetchBindetail',
        data: "{'txnToken':'" + token + "','binnum':'" + document.getElementById('cardinfopaytm').value + "','reqid':'" + rid + "','useramount':'" + document.getElementById('hdnAmount').value + "'}",
        accept: 'application/json; charset=utf-8',
        success: function (result) {
            if (result.d.toLowerCase() == "s") {
                // process transaction

                AjaxCalls.setLoader(true);
                setTimeout(function () {
                    paytmFinalprocesstransaction(token, rid, paytmcard, document.getElementById('cardinfopaytm').value);
                }, 100);


            }
            else {
                AjaxCalls.setLoader(false);
                TKTNEW.Misc.alert({
                    message: result.d,
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });
            }
            AjaxCalls.setLoader(false);

        },
        error: function () {
            TKTNEW.Misc.alert({
                message: "Error in checking balance ..",
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            AjaxCalls.setLoader(false);
            return false;
        }
    });

    AjaxCalls.setLoader(true);


}



function paytmOTPprocess(token, rid, callcountfetch, paymodeval) {
   //  var purl = 'TicketNewWebsite_New/OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess';
   var purl = 'OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess';
    var callcnt;
    var otpverified = 0;
    callcnt = callcountfetch;
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        accept: 'application/json; charset=utf-8',
        url: purl,
        data: "{'txnToken':'" + token + "','reqid':'" + rid + "','amount':'" + document.getElementById('hdnAmount').value + "','callcount':'" + callcnt + "','uphone':'" + document.getElementById('hdnmobile').value + "','paymode':'" + paymodeval + "'}",
        success: function (result) {
            var res = result.d;
            // show pop up for otp
            if (result.d == "success") {

                callcnt = "2";
                var modalpaytm = document.getElementById('paytmotpModal');
                AjaxCalls.setLoader(false);
                modalpaytm.style.display = "block";
                document.getElementById("txtpaytmOTP").value = "";
                $("#spnOTPHeading").html("One Time Password(OTP) has been sent to your mobile , please enter the same here to continue");
                $("#btnVerify").prop('disabled', true);
                $("#btnVerify").css('background', '#9E9E9E');
            }
            else {
                TKTNEW.Misc.alert({
                    message: result.d,
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });

                AjaxCalls.setLoader(false);
            }

            //verify

            var btnVerify = document.getElementById("btnVerify");
            btnVerify.onclick = function () {

                var verOTP = $("#txtpaytmOTP").val();

                if (verOTP.length > 0) {
                    //Get OTP
                    TKTNEW.Misc.ajax({
                        type: 'POST',
                        datatype: 'json',
                        contenttype: 'string',
                        url: 'OnlineTheatre/PG/PGSelection.aspx/btnpaytmOTPVerify',
                        data: "{'txnToken':'" + token + "','reqid':'" + rid + "','otpval':'" + verOTP + "'}",
                        accept: 'application/json; charset=utf-8',
                        success: function (result) {
                            if (result.d == 'S') {
                                modalpaytm.style.display = "none";
                                otpverified = 1; // set flag for otp verified ..
                                AjaxCalls.setLoader(true);
                                TKTNEW.Misc.alert({
                                    message: "Your OTP Verified !",
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green',
                                            action: function () {
                                                AjaxCalls.setLoader(true);
                                                if (otpverified != 0) {
                                                    // call fetch payment again
                                                    TKTNEW.Misc.ajax({
                                                        type: 'POST',
                                                        datatype: 'json',
                                                        contenttype: 'string',
                                                        accept: 'application/json; charset=utf-8',
                                                       //   url: 'TicketNewWebsite_New/OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess',
                                                      url: 'OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess',

                                                        data: "{'txnToken':'" + token + "','reqid':'" + rid + "','amount':'" + document.getElementById('hdnAmount').value + "','callcount':'2','uphone':'" + document.getElementById('hdnmobile').value + "','paymode':'" + paymodeval + "'}",
                                                        success: function (result) {
                                                            var res = result.d;
                                                            // show pop up for otp
                                                            if (result.d == "BALANCE" || result.d == "PAYTM_DIGITAL_CREDIT") {
                                                                AjaxCalls.setLoader(true);
                                                                if (result.d.includes('PAYTM_DIGITAL_CREDIT')) {   // postpaid logic

                                                                    mode = "PAYTM_DIGITAL_CREDIT";
                                                                    // balance check
                                                                    paytmWalletcheckbalance(token, rid, mode);

                                                                }
                                                                else {
                                                                    mode = "BALANCE";
                                                                    // balance check
                                                                    paytmWalletcheckbalance(token, rid, mode);
                                                                }

                                                            }
                                                            else {
                                                                TKTNEW.Misc.alert({
                                                                    message: result.d,
                                                                    buttons: {
                                                                        ok: {
                                                                            text: 'Ok',
                                                                            btnClass: 'tn-green'
                                                                        }
                                                                    }
                                                                });

                                                                AjaxCalls.setLoader(false);
                                                            }

                                                        },
                                                        error: function () {
                                                            TKTNEW.Misc.alert({
                                                                message: 'Error in process call to balance check!',
                                                                buttons: {
                                                                    ok: {
                                                                        text: 'Ok',
                                                                        btnClass: 'tn-green'
                                                                    }
                                                                }
                                                            });

                                                            AjaxCalls.setLoader(false);
                                                        }

                                                    });


                                                }
                                            }
                                        }
                                    }
                                });

                            }
                            else {
                                TKTNEW.Misc.alert({
                                    message: result.d,
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });

                                AjaxCalls.setLoader(false);
                            }


                        }
                    });
                }
                else {
                    $("#btnVerify").prop('disabled', true);
                    $("#btnVerify").css('background', '#9E9E9E');
                    // if otp box is empty
                    TKTNEW.Misc.alert({
                        message: 'Please enter OTP !',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });

                    AjaxCalls.setLoader(false);
                }

                //


            }

            var btnresendpaytm = document.getElementById("btnResendpaytmOTP");
            btnresendpaytm.onclick = function () {
                resendpaytmotp(token, rid);
            }



        }
    });

}
function paytmDcorCcprocess(token, rid, callcountfetch, paytmcardtype) {
  var purl = 'OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess';
   //   var purl = 'TicketNewWebsite_New/OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess';
    AjaxCalls.setLoader(true);
    callcnt = "2";
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        accept: 'application/json; charset=utf-8',
        url: purl,
        data: "{'txnToken':'" + token + "','reqid':'" + rid + "','amount':'" + document.getElementById('hdnAmount').value + "','callcount':'" + callcnt + "','uphone':'" + document.getElementById('hdnmobile').value + "','paymode':'" + paytmcardtype + "'}",
        success: function (result) {
            var res = result.d;
            // show pop up for otp
            if (result.d == paytmcardtype) {
                if (document.getElementById('hdnsavedcardpay').value == 0) {
                    paytmfetchBindetail(token, rid, paytmcardtype);
                }
                else {
                    setTimeout(function () {
                        paytmFinalprocesstransaction(token, rid, "DEBIT_CARD", document.getElementById('cardinfopaytm').value);
                    }, 100);

                }
            }
            else {
                TKTNEW.Misc.alert({
                    message: result.d,
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });

                AjaxCalls.setLoader(false);
            }

        }

    });

}
function paytmUpiprocess(token, rid, callcountfetch) {
   var purl = 'OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess';
    // var purl = 'TicketNewWebsite_New/OnlineTheatre/PG/PGSelection.aspx/PAytmXpressfetchprocess';
    var callcnt;
    var otpverified = 0;
    // callcnt = callcountfetch;
    callcnt = "2";
    TKTNEW.Misc.ajax({
        type: 'POST',
        datatype: 'json',
        contenttype: 'string',
        accept: 'application/json; charset=utf-8',
        url: purl,
        data: "{'txnToken':'" + token + "','reqid':'" + rid + "','amount':'" + document.getElementById('hdnAmount').value + "','callcount':'" + callcnt + "','uphone':'" + document.getElementById('hdnmobile').value + "','paymode':'UPI'}",
        success: function (result) {
            var res = result.d;
            // show pop up for otp
            //  if (result.d == "success") {

            if (result.d == "UPI") {
           //     debugger;
                // check UPI info                                                              
                AjaxCalls.setLoader(true);
                validatevpa(token, rid, "UPI", document.getElementById('cardinfopaytm').value);
               

            }
            else {
                TKTNEW.Misc.alert({
                    message: result.d,
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });

                AjaxCalls.setLoader(false);
            }



        }
    });

}

function GAAddtoCart(sid, sns) {

    var gaval = '';

    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {

            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date(); a = s.createElement(o),

        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)

    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    var item;
    var gavals;
    gavals = sessionStorage.getItem("GAseatdetail");
    item = gavals.split("-");
    var typename = '';
    var GAvalue = '';
    if (sessionStorage.getItem("GAtype") != '') {
        GAvalue = sessionStorage.getItem("GAtype");
    }
    ga('create', 'UA-3232605-1', 'auto');  // Replace with your property ID.
    ga('require', 'ec');



    ga('ec:addProduct', {
        'id': item[0],
        'name': item[1],
        'seatids': sid,
        'seatNamess': sns,
        'price': item[3]
    });
    sessionStorage.setItem("GAseatdetail", item[0] + "-" + item[1] + "-" + item[2] + "-" + item[3] + "-" + item[4] + "-" + sid.split(",").length);

    ga('ec:setAction', 'add', {       // click action.
        'list': GAvalue            // Product list (string).
    });

    ga('send', 'pageview');

}

function GAAddtoCartAuto(qt) {


    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {

            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date(); a = s.createElement(o),

        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)

    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    var item;
    var gavals;
    gavals = sessionStorage.getItem("GAseatdetail");
    item = gavals.split("-");
    var typename = '';
    var GAvalue = '';
    if (sessionStorage.getItem("GAtype") != '') {
        GAvalue = sessionStorage.getItem("GAtype");
    }
    ga('create', 'UA-3232605-1', 'auto');  // Replace with your property ID.
    ga('require', 'ec');

    ga('ec:addProduct', {
        'id': item[0],
        'name': item[1],
        'Mode': 'Auto Seat Select',
        'price': item[3]
    });

    ga('ec:setAction', 'add', {       // click action.
        'list': GAvalue            // Product list (string).
    });
    sessionStorage.setItem("GAseatdetail", item[0] + "-" + item[1] + "-" + item[2] + "-" + item[3] + "-" + item[4] + "-" + qt);

    ga('send', 'pageview');

}


var AjaxCalls = {
    isLoading: false,
    async: "",
    init: function () {
        isLoading = false;
    },

    setLoader: function (display) {
        TKTNEW.Misc.loader(display);
        this.isLoading = display;
    },

    resetLoader: function () {
        AjaxCalls.setLoader(false);
    },

    ajaxFailure: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr);
        AjaxCalls.resetLoader();
        TKTNEW.Misc.alert({
            message: 'Sorry something went wrong. Please try again !',
            buttons: {
                ok: {
                    text: 'Ok',
                    btnClass: 'tn-green'
                }
            }
        });
    },

    getAsync: function () {

        if (this.isLoading != false) {
            return;
        }
        this.setLoader(true);

        TKTNEW.Misc.ajax({
            type: 'POST',
            datatype: 'json',
            url: "moviepage/GetAsyncServiceURL",
          //  url: "TicketNewWebsite_New/moviepage/GetAsyncServiceURL",
            contenttype: 'string',
            accept: 'application/json; charset=utf-8',
            data: "{}",
            success: function (response) {
                AjaxCalls.async = response.d;
            }, complete: this.resetLoader
        });

        return false;

    },

    getOnGoing: function () {

        // Create a new Deferred.
        var deferred = new $.Deferred();

        TKTNEW.Misc.ajax({
            type: 'POST',
            datatype: 'json',
            contenttype: 'string',
            accept: 'application/json; charset=utf-8',
            url: "calls/GetOngoingTrans",
            data: "{}",
            success: function (response) {
                console.log(response);

                //AjaxCalls.resetLoader();

                // When we're done animating
                // we'll resolve our Deferred.
                // This will call any done() callbacks
                // attached to either our Deferred or
                // one of its promises.
                deferred.resolve(response.d);

            }, error: function (xhr, ajaxOptions, thrownError) {
                //AjaxCalls.resetLoader();
                deferred.resolve("0");
            }
        });

        return deferred.promise();
    },

    expireTrans: function (transId) {

        // Create a new Deferred.
        var deferred = new $.Deferred();

        TKTNEW.Misc.ajax({
            type: 'POST',
            datatype: 'json',
            contenttype: 'string',
            accept: 'application/json; charset=utf-8',
            url: "calls/ExpiresOngoingTrans",
            data: "{'TransID':'" + transId + "'}",
            success: function (response) {
                console.log(response.d);
                //AjaxCalls.resetLoader();
                deferred.resolve();
            }, error: function (xhr, ajaxOptions, thrownError) {
                //AjaxCalls.resetLoader();
                deferred.resolve();
            }
        });

        return deferred.promise();
    },

    checkTickets: function (el) {
        $this = $(el);

        if ($this.data('censor') == "A") {
            TKTNEW.Misc.alert({
                message: 'The movie is Rated as "A".\n Persons below the Age of 18 will Not Be Allowed \n Do u Wish To Continue ?',
                buttons: {
                    cancel: {
                        text: 'Cancel',
                        btnClass: 'tn-red'
                    },
                    accept: {
                        text: 'I Accept',
                        btnClass: 'tn-green',
                        action: function () {
                            if ($this.data('msg') == 1) {
                                var message = TKTNEW.Misc.templateByHtml(LevelMsg, {
                                    hours: $this.data('time') + " hrs"
                                });

                                TKTNEW.Misc.alert({
                                    message: '<div class="tn-alert-lvlmsg">' + message + '</div>',
                                    buttons: {
                                        cancel: {
                                            text: 'Cancel',
                                            btnClass: 'tn-red'
                                        },
                                        accept: {
                                            text: 'I Accept',
                                            btnClass: 'tn-green',
                                            action: function () {
                                                AjaxCalls.loadtickets(el, false);
                                            }
                                        }
                                    }
                                });

                                return;
                            } else {
                                AjaxCalls.loadtickets(el, false);
                            }
                        }
                    }
                }
            });
            return;
        }

        if ($this.data('msg') == 1) {
            var message = TKTNEW.Misc.templateByHtml(LevelMsg, {
                hours: $this.data('time') + " hrs"
            });

            TKTNEW.Misc.alert({
                message: '<div class="tn-alert-lvlmsg">' + message + '</div>',
                buttons: {
                    cancel: {
                        text: 'Cancel',
                        btnClass: 'tn-red'
                    },
                    accept: {
                        text: 'I Accept',
                        btnClass: 'tn-green',
                        action: function () {
                            AjaxCalls.loadtickets(el, false);
                        }
                    }
                }
            });

            return;
        }

        AjaxCalls.loadtickets(el, false);
        return false;
    },

    loadtickets: function (el, isajax) {
        $this = $(el);

        if ($this.data('allseat') == "True") {

            this.encodeUrl($this.data('venue'), $this.data('event'), $this.data('date'), 0, "BOTH", 10);

        } else {

            if (!isajax) {

                var levels = $this.data('tkts');
                var tkTypetTemplate = $("#tktTypeTemplate");
                var tktTypeItemTemplate = $("#tktTypeItemTemplate");
                var tktTypeQtyTemplate = $("#tktTypeQtyTemplate");

                var tktList = "";
                var maxTkts = 0;

                //tkTypetTemplate.find('#tktTypeInfo').html('Select Seat Class - ' + $this.data('venuen') + ', ' + $this.data('screenn') + ' | ' + $this.html());

                $.each(levels, function (i, level) {

                    var v_statusText;
                    var v_statusColor;
                    var AllSeats = level.Total;
                    var AvailableSeats = level.Avail;
                    var rate = 1.0;
                    if (AllSeats > 0) {
                        rate = (AvailableSeats) / AllSeats;
                    }
                    statusText = "Available";
                    statusColor = "tn-green";

                    if (AvailableSeats <= 0) {
                        statusColor = "tn-red";
                        statusText = "Sold out";
                    }
                    else if (rate > 0.3)
                        statusColor = "tn-green";
                    else if (AvailableSeats <= 5)
                        statusColor = "tn-red";
                    else if (rate <= 0.3)
                        statusColor = "tn-yellow";


                    maxTkts = level.Max;

                    tktList += TKTNEW.Misc.template(tktTypeItemTemplate, {
                        levelname: level.Name,
                        price: level.Rate,
                        availabletkts: level.Avail,
                        tktstext: statusText,
                        selmode: level.Mode,
                        lvlid: level.Id,
                        max: level.Max,
                        displaytype: level.Rate == 0 ? "none" : "",
                        availdisplaytype: level.IsAvail == true ? "none" : "",
                        status: level.Avail == 0 ? "" : "tn-enabled",
                        isdisabled: level.Avail == 0 ? "disabled" : "",
                        textcolor: statusColor
                    });

                });

                var tktPopupContent = $(TKTNEW.Misc.template(tkTypetTemplate, {
                    venuename: $this.data('venuen').length > 30 ? $this.data('venuen').substring(0, 30) + "..." : $this.data('venuen'),
                    screenname: $this.data('screenn'),
                    showtime: $this.html(),
                    ticketlist: tktList
                }));

                tktPopupContent.find('#btn_tkt_type_cancel').click(function (e) {
                    $.magnificPopup.close();
                });

                tktPopupContent.find('#btn_tkt_type_continue').click(function (e) {

                    var selectedLevel = tktPopupContent.find(".tn-radio-button-container.tn-enabled input[name='seat_class']:checked");
                    if (selectedLevel.length == 0) {
                        TKTNEW.Misc.alert({
                            message: 'Please choose a class',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                    } else {
                        $.magnificPopup.close();

                        var tktQtyPopupContent = $(tktTypeQtyTemplate.html());

                        tktQtyPopupContent.find('#btn_tkt_qty_cancel').click(function (e) {
                            $.magnificPopup.close();
                        });

                        tktQtyPopupContent.find('#btn_tkt_qty_continue').click(function (e) {
                            if (sessionStorage.getItem("GAseatdetail") != '' && sessionStorage.getItem("GAseatdetail") != null && sessionStorage.getItem("GAseatdetail") != undefined) {
                                var qtauto = 1;
                                qtauto = $(".tn-seat-numbers li.selected")[0].childNodes[0].innerHTML;

                                GAAddtoCartAuto(qtauto);
                            }
                            $.magnificPopup.close();
                            AjaxCalls.encodeUrl($this.data('venue'), $this.data('event'), $this.data('date'), selectedLevel.data('level'), selectedLevel.data('selmode'), maxTkts);
                        });

                        if (selectedLevel.data('selmode') != "BOTH") {
                            $.magnificPopup.open({
                                modal: true,
                                items: [
                                    {
                                        src: tktQtyPopupContent
                                    }
                                ]
                            });

                            maxTkts = 1;
                            $(document).delegate('.tn-seat-numbers a', 'click', function (a) {
                                $(".tn-seat-numbers li").removeClass('selected');
                                $(this).parent().addClass('selected');
                                $(this).parent().data('qtyNo', $(this).html());
                                maxTkts = $(this).html();
                                qtauto = $(".tn-seat-numbers li.selected")[0].childNodes[0].innerHTML;
                                return false;
                            });

                        } else {
                            AjaxCalls.encodeUrl($this.data('venue'), $this.data('event'), $this.data('date'), selectedLevel.data('level'), selectedLevel.data('selmode'), 10);
                        }
                    }
                });


                $.magnificPopup.open({
                    modal: true,
                    items: [
                        {
                            src: tktPopupContent
                        }
                    ]
                });

            } else {
                var strServiceURL = "/GetMoviewiseSchedule_Aync?";
                strServiceURL += "VenueID=";
                strServiceURL += $this.data('venue');
                strServiceURL += "&MovieId=";
                strServiceURL += $this.data('movie');
                strServiceURL += "&ChoiceDate=";
                strServiceURL += $this.data('date');
                strServiceURL += "&format=json";

                TKTNEW.Misc.ajax({
                    datatype: 'jsonp',
                    baseUrl: AjaxCalls.async,
                    url: strServiceURL,
                    contenttype: 'json',
                    accept: 'application/json; charset=utf-8',
                    data: "{}",
                    success: function (response) {

                        var JsonSchedules = response;
                        var checkStatus = 0;
                        for (prop in JsonSchedules.status) {
                            checkStatus++;
                        }

                        if (checkStatus != 0) {
                            if (JsonSchedules.status[0].errcode == "2") {
                                TKTNEW.Misc.alert({
                                    message: '<b>Oops Unable To Connect The Theatre Server.</b>',
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                            } else {
                                TKTNEW.Misc.alert({
                                    message: 'Unable to Retrive the Information.Try After Sometime.',
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                            }
                            return false;
                        }

                        var IsRateVisible = JsonSchedules.IsRateVisible;

                        for (var j = 0; j < JsonSchedules.ScheduledTheatres.length; j++) {

                            if (JsonSchedules.ScheduledTheatres[j].TheatreId == $this.data('screen')) {

                                for (var i = 0; i < JsonSchedules.ScheduledTheatres[j].ScheduledShows.ScheduleShowItem.length; i++) {

                                    if (JsonSchedules.ScheduledTheatres[j].ScheduledShows.ScheduleShowItem[i].EventId == $this.data('event')) {

                                        console.log(JsonSchedules.ScheduledTheatres[j].ScheduledShows.ScheduleShowItem[i]);

                                    }
                                }

                            }
                            break;
                        }

                    }, complete: this.resetLoader, error: this.ajaxFailure
                });
            }
        }

        return false;
    },

    selSeats: function () {

        var count = $(".tn-class-grid").data('max');
        $("#select_seats_area").html('');
        var selArea = 0;

        var $lvls = $(".tn-class-grid-container").filter(function () {
            for (var property in $(this).data()) {
                if (property.indexOf('lvlrt') == 0) {
                    return true;
                }
            }
            return false;
        });

        $(".tn-class-grid .tn-seat.tn-seat-available").click(function (eventArgs) {
            var $selSeat = $(this);
            if (selArea != 0 && selArea != $selSeat.data('area')) {
                $(".tn-class-grid .tn-seat").removeClass('tn-seat-selected');
                $("#select_seats_area").html('');
            }

            selArea = $selSeat.data('area');
            $(".tn-button-continue").data('area', selArea);
            var seatCount = $(".tn-class-grid .tn-seat.tn-seat-selected").length;
            var $tws = $selSeat.data('tw') == "True" ? $("#seat_select_container").find("[data-seat='" + $selSeat.data('twd') + "']") : false;
            var $lvl = $($.grep($lvls, function (e) { return e.id == "divlvlrt" + selArea + ""; }));
            var curRt = $lvl.data('lvlrt' + selArea);

            if ($selSeat.hasClass('tn-seat-selected')) {
                seatCount--;
                $selSeat.removeClass('tn-seat-selected');

                if ($tws) {
                    seatCount--;
                    $tws.removeClass('tn-seat-selected');
                }

                if ($selSeat.hasClass('WheelChairFriendly')) {

                    if ($('td[data-twd="' + $selSeat.data('seat') + '"]').hasClass('tn-seat-selected')) {
                        seatCount--;
                        $('td[data-twd="' + $selSeat.data('seat') + '"]').removeClass('tn-seat-selected');
                    }


                }

            } else {

                if (seatCount < count) {
                    seatCount++;
                    $selSeat.addClass('tn-seat-selected');

                    if ($tws) {
                        if (seatCount < count && $tws.hasClass('tn-seat-available')) {
                            //!$tws.hasClass('tn-seat-selected') added for WheelChairFriendly seat selection
                            if ($tws.hasClass('WheelChairFriendly') && $tws.hasClass('tn-seat-selected')) {

                            }
                            else {
                                seatCount++;
                                $tws.addClass('tn-seat-selected');
                            }




                        } else {
                            seatCount--;
                            $selSeat.removeClass('tn-seat-selected');
                            if ($selSeat.hasClass('WheelChairCompanion')) {
                                TKTNEW.Misc.alert({
                                    message: 'Can not book this seat alone',
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                            }
                            else {
                                TKTNEW.Misc.alert({
                                    message: 'Selected Seat Count Exceeds the Requested Count',
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                            }

                            return;
                        }
                    }
                } else {
                    TKTNEW.Misc.alert({
                        message: 'Already you have selected your seats',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    return;
                }
            }

            if ($("#select_seats_area").find(".tn-green[data-seatid='" + $selSeat.data('seat') + "']").length > 0) {
                $("#select_seats_area").find(".tn-green[data-seatid='" + $selSeat.data('seat') + "']").remove();
                if ($tws)
                    $("#select_seats_area").find(".tn-green[data-seatid='" + $tws.data('seat') + "']").remove();
                if ($selSeat.hasClass('WheelChairFriendly')) {
                    if ($("#select_seats_area").find(".tn-green[data-seatid='" + $('td[data-twd="' + $selSeat.data('seat') + '"]').data('seat') + "']").length > 0) {
                        $("#select_seats_area").find(".tn-green[data-seatid='" + $('td[data-twd="' + $selSeat.data('seat') + '"]').data('seat') + "']").remove();
                    }

                }
            } else {
                $("#select_seats_area").append('<li class="tn-green" data-seatid=' + $selSeat.data('seat') + '>' + $selSeat.data('seatname').replace("singlequot", "'") + '</li>');
                if ($tws) {
                    if ($tws.hasClass('WheelChairFriendly')) {
                        if ($("#select_seats_area").find(".tn-green[data-seatid='" + $tws.data('seat') + "']").length == 0) {
                            $("#select_seats_area").append('<li class="tn-green" data-seatid=' + $tws.data('seat') + '>' + $tws.data('seatname').replace("singlequot", "'") + '</li>');

                        }
                    }
                    else {
                        $("#select_seats_area").append('<li class="tn-green" data-seatid=' + $tws.data('seat') + '>' + $tws.data('seatname').replace("singlequot", "'") + '</li>');
                    }
                }
            }

            $("#select_seat_count").html(seatCount + " Seat(s)");
            $("#select_seat_price").html((curRt * seatCount).toFixed(2));

            $("#select_seats_area .tn-green").each(function (ind, curseat) {
                $curseat = $(curseat);
                $curseat.unbind('click');

                $curseat.click(function () {

                    var $clickedSeat = $(this);
                    var $selSeat = $(".tn-class-grid").find(".tn-seat.tn-seat-selected[data-seat='" + $clickedSeat.data('seatid') + "']");
                    var $tws = $selSeat.data('tw') == "True" ? $("#seat_select_container").find("[data-seat='" + $selSeat.data('twd') + "']") : false;

                    $selSeat.removeClass('tn-seat-selected');
                    if ($tws)
                        $tws.removeClass('tn-seat-selected');

                    debugger;
                    $("#select_seats_area").find(".tn-green[data-seatid='" + $selSeat.data('seat') + "']").remove();
                    if ($tws)
                        $("#select_seats_area").find(".tn-green[data-seatid='" + $tws.data('seat') + "']").remove();

                    if ($selSeat.hasClass('WheelChairFriendly')) {
                        if ($("#select_seats_area").find(".tn-green[data-seatid='" + $('td[data-twd="' + $selSeat.data('seat') + '"]').data('seat') + "']").length > 0) {
                            $("#select_seats_area").find(".tn-green[data-seatid='" + $('td[data-twd="' + $selSeat.data('seat') + '"]').data('seat') + "']").remove();
                            $(".tn-class-grid").find(".tn-seat.tn-seat-selected[data-twd='" + $selSeat.data('seat') + "']").removeClass('tn-seat-selected');

                        }

                    }


                    var seatCount = $(".tn-class-grid .tn-seat.tn-seat-selected").length;
                    $("#select_seat_count").html(seatCount + " Seats");
                    $("#select_seat_price").html((curRt * seatCount).toFixed(2));
                });


            });


        });

    },

    bookSeats: function (el, type) {

        $this = $(el);

        var count = $(".tn-class-grid").data('max');
        var area = $this.data('area');
        var seats = $("#divlvlrt" + area).find(".tn-seat.tn-seat-selected");
        var seatCount = seats.length;
        var msg = $("#divlvlrt" + area).data('msg');
        var areaname = $("#divlvlrt" + area).data('areaname');
        var fb = $("#divlvlrt" + area).data('fb');

        if (seatCount <= 0 || area <= 0) {
            TKTNEW.Misc.alert({
                message: 'Please choose atleast 1 ticket.',
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            return;
        }

        if (type == 1 && count != seatCount) {
            TKTNEW.Misc.alert({
                message: 'Please choose ' + count + ' ticket(s)',
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            return;
        }

        if (seatCount > count) {
            TKTNEW.Misc.alert({
                message: 'Oops, something went wrong. Please try again.',
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green',
                        action: function () {
                            window.location.href = location.href;
                        }
                    }
                }
            });
            return;
        }

        if (msg.length > 0) {

            TKTNEW.Misc.alert({
                message: '<div class="tn-alert-lvlmsg">' + msg + '</div>',
                buttons: {
                    cancel: {
                        text: 'Cancel',
                        btnClass: 'tn-red'
                    },
                    accept: {
                        text: 'I Accept',
                        btnClass: 'tn-green',
                        action: function () {
                            _proceed();
                        }
                    }
                }
            });
            return;
        }

        _proceed();

        function _proceed() {

            if (AjaxCalls.isLoading != false) {
                return;
            }
            AjaxCalls.setLoader(true);

            var seatIds = [];
            var seatNs = [];
            seats.each(function (index, item) {
                var curSeat = $(this);
                seatIds.push(curSeat.data('seat'));
                seatNs.push(curSeat.data('seatname'));
            });

            if (type == 0) {
                if (sessionStorage.getItem("GAseatdetail") != '' && sessionStorage.getItem("GAseatdetail") != null && sessionStorage.getItem("GAseatdetail") != undefined) {
                    GAAddtoCart(seatIds.toString(), seatNs.toString());
                }
            }

            if (type == 1) {
                $("#hidLevelDescription").val(areaname);
                $("#hidFB").val(fb);
                $("#hidseatname").val(seatNs.toString());
                $("#hidLvlId").val(area);
                __doPostBack("BookSeats", seatIds.toString());
            } else {
                AjaxCalls.getOnGoing().done(function (data) {

                    if (data == "0") {
                        $("#hidLevelDescription").val(areaname);
                        $("#hidFB").val(fb);
                        $("#hidseatname").val(seatNs.toString());
                        $("#hidLvlId").val(area);
                        __doPostBack("BookSeats", seatIds.toString());
                    } else {

                        AjaxCalls.resetLoader();

                        TKTNEW.Misc.alert({
                            title: '&nbsp;',
                            message: 'Already you have an ongoing transaction.would you like to cancel that transaction?',
                            buttons: {
                                cancel: {
                                    text: 'Cancel',
                                    btnClass: 'tn-red'
                                },
                                accept: {
                                    text: 'Ok',
                                    btnClass: 'tn-green',
                                    action: function () {

                                        AjaxCalls.setLoader(true);

                                        AjaxCalls.expireTrans(data).done(function () {
                                            $("#hidLevelDescription").val(areaname);
                                            $("#hidFB").val(fb);
                                            $("#hidseatname").val(seatNs.toString());
                                            $("#hidLvlId").val(area);
                                            __doPostBack("BookSeats", seatIds.toString());
                                        });
                                    }
                                }
                            }
                        });
                    }

                });
            }
        }
    },

    rebookSeats: function (el) {

        $this = $(el);

        var seats = $(".tn-seat.tn-seat-selected");
        var seatCount = seats.length;
        var area = $this.data('area');

        if (seatCount <= 0 || area <= 0) {
            TKTNEW.Misc.alert({
                message: 'Please choose atleast 1 ticket.',
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            return;
        }

        AjaxCalls.setLoader(true);
        __doPostBack("BookSeats", area + "^" + seatIds.toString() + "^" + seatNs.toString());
    },

    initfbtrans: function () {

        var qty = 0;

        var fbprds = [];
        var totalQty = 0;
        $.each(bkSt.fb, function (i, item) {
            totalQty += item.qty;
            if (item.qty > 0) {
                fbprds.push(item.id + "&" + item.qty);
            }

        });

        if (totalQty < qty && qty != 0) {

            //alert for mandatory quantity

            return;
        }

        if (AjaxCalls.isLoading != false) {
            return;
        }
        AjaxCalls.setLoader(true);

        //if (totalQty == 0)
        //  __doPostBack('Redirect', '');
        //else
        __doPostBack('lnkpay', fbprds.toString());

        return false;
    },


    applyOffer: function () {
        $("form[name='form1']").removeData('validator');
        $('.tn-input-container *').removeClass('error');
        $('.tn-input-container .tn-error-icon').html('');
        $('.tn-input-container label').remove();

        $("form[name='form1']").validate({
            // Specify validation rules
            rules: {
                txtemail: {
                    required: true,
                    email: true
                },
                txtmobile: {
                    required: true,
                    minlength: 10,
                    maxlength: 10,
                    digits: true
                },
                txtCode: {
                    required: true,
                    minlength: 2
                }
            },
            // Specify validation error messages
            messages: {
                txtemail: {
                    required: "Please provide a email",
                    email: "Please enter a valid email"
                },
                txtmobile: {
                    required: "Please provide a mobile number",
                    minlength: "Please enter a valid mobile number",
                    maxlength: "Please enter a valid mobile number"
                },
                txtCode: {
                    required: "Please provide a promotion code",
                    minlength: "Must be at least 2 characters long"
                }
            }
        });

        if ($("#form1").valid()) {

            if (AjaxCalls.isLoading != false) {
                return;
            }



            AjaxCalls.setLoader(true);

            var offer = new Object();
            offer.TransId = $("#hdnTrans").val();
            offer.Email = $("#txtemail").val();
            offer.Mobile = $("#txtmobile").val();
            offer.CouponNumber = $("#txtCode").val();

            TKTNEW.Misc.ajax({
                type: 'POST',
                datatype: 'json',
                contenttype: 'string',
                url: "calls/VerifyOffer",
                data: '{"request":' + JSON.stringify(offer) + '}',
                accept: 'application/json; charset=utf-8',
                success: function (response) {

                    var offerResp = eval("(" + response.d + ")");

                    if (offerResp.ResponseCode == 1) {
                        $("#divPromoText").hide();
                        $("#divOfferDesc").html(offerResp.PromotionMsg);
                        $("#spnGtot").html(parseFloat(($("#hdnGAmt").val()) - parseFloat(offerResp.DeductAmount)).toFixed(2));
                        $("#hdnGAmt").val(parseFloat(($("#hdnGAmt").val()) - parseFloat(offerResp.DeductAmount)).toFixed(2));
                        $("#hdnpromoresp").val(offerResp.CouponNumber);

                        CommonCalls.updateOrderTotal();

                        if ($("#applyOTPdiscount").hasClass('applyOTPdiscount')) {
                            document.getElementById("spanDiscount").innerHTML = "₹ " + offerResp.DeductAmount + "";
                        }
                        else {
                            $("#tn_ticket_summary_details .tn-table").append("<tr> <td id='applyOTPdiscount' class='applyOTPdiscount'> <p >Discount(-).</p></td><td class='tn-align-right'><h5 class='tn-green' ><span id='spanDiscount'>₹ " + offerResp.DeductAmount + "</span></h5> </td></tr>");

                        }

                        //Send & Verify OTP
                        var modal = document.getElementById('myModal');

                        var verifyOTP = new Object();
                        verifyOTP.Email = "";// $("#txtemail").val();
                        verifyOTP.Mobile = $("#txtmobile").val();

                        TKTNEW.Misc.ajax({
                            type: 'POST',
                            datatype: 'json',
                            contenttype: 'string',
                            url: "calls/SendVerifyCode",
                            data: '{"request":' + JSON.stringify(verifyOTP) + '}',
                            accept: 'application/json; charset=utf-8',
                            success: function (result) {
                                AjaxCalls.setLoader(false);
                                if (result.d.toString().length > 6) {
                                    TKTNEW.Misc.alert({
                                        message: " OTP - " + result.d.toString(),
                                        buttons: {
                                            ok: {
                                                text: 'Ok',
                                                btnClass: 'tn-green'
                                            }
                                        }
                                    });

                                    $("#divPromoText").show();
                                    $("#divOfferDesc").html("");
                                    $("#spnGtot").html(parseFloat($("#hdnGAmt").val()) + parseFloat(offerResp.DeductAmount));
                                    $("#hdnGAmt").val(parseFloat($("#hdnGAmt").val()) + parseFloat(offerResp.DeductAmount));
                                    CommonCalls.updateOrderTotal();
                                }
                                else {
                                    AjaxCalls.setLoader(false);
                                    modal.style.display = "block";
                                    document.getElementById("txtOTP").value = "";
                                    $("#spnOTPHeading").html("One Time Password(OTP) has been sent to your mobile ******" + offer.Mobile.toString().substr(6, 4) + ", please enter the same here to continue");

                                }
                            },
                        });

                        var span = document.getElementsByClassName("close")[0];
                        span.onclick = function () {
                            modal.style.display = "none";
                            $("#divPromoText").show();
                            $("#divOfferDesc").html("");
                            $("#spnGtot").html(parseFloat($("#hdnGAmt").val()) + parseFloat(offerResp.DeductAmount));
                            $("#hdnGAmt").val(parseFloat($("#hdnGAmt").val()) + parseFloat(offerResp.DeductAmount));

                            document.getElementById("txtOTP").value = "";
                            document.getElementById("spanDiscount").innerHTML = "₹ 0";
                            CommonCalls.updateOrderTotal();
                        }

                        var btnVerify = document.getElementById("btnVerify");
                        btnVerify.onclick = function () {

                            var verOTP = new Object();
                            verOTP.VerifyCode = $("#txtOTP").val();
                            verOTP.Email = "";// $("#txtemail").val();
                            verOTP.Mobile = $("#txtmobile").val();
                            //Get OTP
                            TKTNEW.Misc.ajax({
                                type: 'POST',
                                datatype: 'json',
                                contenttype: 'string',
                                url: "calls/GetOTP",
                                data: '{"request":' + JSON.stringify(verOTP) + '}',
                                accept: 'application/json; charset=utf-8',
                                success: function (result) {
                                    if (result.d == '1') {
                                        TKTNEW.Misc.alert({
                                            message: "Your OTP Verified",
                                            buttons: {
                                                ok: {
                                                    text: 'Ok',
                                                    btnClass: 'tn-green'
                                                }
                                            }
                                        });
                                        $("#hdnOfferApplied").val("1");
                                        modal.style.display = "none";
                                    }
                                    else if (result.d == '0') {
                                        TKTNEW.Misc.alert({
                                            message: "OTP entered is expired. Please generate a new OTP and try again.",
                                            buttons: {
                                                ok: {
                                                    text: 'Ok',
                                                    btnClass: 'tn-green'
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        TKTNEW.Misc.alert({
                                            message: "Wrong OTP Entered. Please Check!",
                                            buttons: {
                                                ok: {
                                                    text: 'Ok',
                                                    btnClass: 'tn-green'
                                                }
                                            }
                                        });
                                    }

                                },
                            });
                            //
                        }
                        //var btnResend = document.getElementsByClassName("tn-green")[0];
                        var btnResend = document.getElementById('btnResendOTP');
                        btnResend.onclick = function () {
                            var ResendOTP = new Object();
                            ResendOTP.Email = "";// $("#txtemail").val();
                            ResendOTP.Mobile = $("#txtmobile").val();
                            TKTNEW.Misc.ajax({
                                type: 'POST',
                                datatype: 'json',
                                contenttype: 'string',
                                url: "calls/SendVerifyCode",
                                data: '{"request":' + JSON.stringify(ResendOTP) + '}',
                                accept: 'application/json; charset=utf-8',
                                success: function (result) {
                                    if (result.d.toString().length > 6) {
                                        TKTNEW.Misc.alert({
                                            message: result.d.toString(),
                                            buttons: {
                                                ok: {
                                                    text: 'Ok',
                                                    btnClass: 'tn-green'
                                                }
                                            }
                                        });

                                    }
                                    else {
                                        TKTNEW.Misc.alert({
                                            message: "One Time Password(OTP) has been sent to your mobile.",
                                            buttons: {
                                                ok: {
                                                    text: 'Ok',
                                                    btnClass: 'tn-green'
                                                }
                                            }
                                        });
                                    }
                                },
                            });
                        }

                        //End Send & Verify OTP
                    }
                    else {
                        AjaxCalls.setLoader(false);
                        TKTNEW.Misc.alert({
                            message: offerResp.PromotionMsg,
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                    }
                }, error: this.ajaxFailure
            });


        }
        return false;
    },

    initOrderInfo: function () {

        $("form[name='form1']").removeData('validator');
        $('.tn-input-container *').removeClass('error');
        $('.tn-input-container .tn-error-icon').html('');
        $('.tn-input-container label').remove();

        $("form[name='form1']").validate({
            // Specify validation rules
            rules: {
                txtemail: {
                    required: true,
                    // Specify that email should be validated
                    // by the built-in "email" rule
                    email: true
                },
                txtmobile: {
                    required: true,
                    minlength: 10,
                    maxlength: 10,
                    digits: true
                }
            },
            // Specify validation error messages
            messages: {
                txtemail: {
                    required: "Please provide a email",
                    email: "Please enter a valid email"
                },
                txtmobile: {
                    required: "Please provide a mobile number",
                    minlength: "Please enter a valid mobile number",
                    maxlength: "Please enter a valid mobile number"
                }
            }
        });

        if ($("#form1").valid()) {

            if (AjaxCalls.isLoading != false) {
                return;
            }
            AjaxCalls.setLoader(true);

            TKTNEW.Misc.ajax({
                type: 'POST',
                datatype: 'json',
                contenttype: 'string',
                // url: "TicketNewWebsite_New/calls/GetPendingTransaction_PG",
               url: "calls/GetPendingTransaction_PG",
                data: "{'UserEmail':'" + $("#txtemail").val() + "'}",
                accept: 'application/json; charset=utf-8',
                success: function (response) {

                    TransMsg = eval("(" + response.d + ")");
                    if (TransMsg.status == "1") {
                        AjaxCalls.resetLoader();
                        TKTNEW.Misc.alert({
                            message: 'Your last transaction is Incomplete with payment deducted successfully. Click OK to confirm your last transaction.',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green',
                                    action: function () {
                                        AjaxCalls.setLoader(true);
                                        setTimeout(function () {
                                            window.location.href = _baseUrl + "/onlinetheatre/Theatre/orderstatus.aspx?UserEmail=" + TransMsg.Email;
                                        }, 200);
                                    }
                                }
                            }
                        });
                    } else {
                        AjaxCalls.setLoader(true);
                        GaCheckout();
                        __doPostBack('UpdateOrder', '');
                    }

                }, error: this.ajaxFailure
            });
        }

        return false;

    },

    encodeUrl: function (venue, event, date, level, selMode, seats) {

        if (this.isLoading != false) {
            return;
        }
        this.setLoader(true);

        TKTNEW.Misc.ajax({
            type: 'POST',
            datatype: 'json',
            accept: 'application/json; charset=utf-8',
            url: "moviepage/EncodeUrl",
        //   url: "TicketNewWebsite_New/moviepage/EncodeUrl",
            data: {
                Venue_ID: venue,
                Event_Id: event,
                Event_Date: date,
                Level_Id: level,
                Req_Seats: seats,
                Sel_Mode: selMode,
                Cancel_Url: window.location.href
            },
            success: function (response) {

                JsonSchedules = eval("(" + response.d + ")");
                checkCookie(venue);
                var URL = _baseUrl + "onlinetheatre/Theatre/" + JsonSchedules + "";

                AjaxCalls.resetLoader();
                AjaxCalls.setLoader(true);
                setTimeout(function () {
                    window.location.href = URL;
                }, 200);

            }, error: this.ajaxFailure
        });

        return false;
    },

    initEventtrans: function () {

        var qty = 0;

        var fbprds = [];
        var totalQty = 0;
        $.each(bkSt.fb, function (i, item) {
            totalQty += item.qty;
            fbprds.push(item.id + "&" + item.qty + "|" + item.time);
        });

        if (totalQty < qty && qty != 0) {

            //alert for mandatory quantity

            return;
        }

        //if (totalQty == 0)
        //  __doPostBack('Redirect', '');
        //else
        if (fbprds.length > 0) {
            __doPostBack('lnkpay', fbprds.toString());
        }
        else {
            TKTNEW.Misc.alert({
                message: 'Please select some tickets',
                buttons: {
                    ok: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            return false;
        }

    }
};


var CommonCalls = {

    fbProd: function (type, id, el) {

        var ele = $(el);
        var itemObject = $("#fb_item_" + id);
        var isItmExist = false;

        if (bkSt.fb.length > 0) {
            $.each(bkSt.fb, function (i, item) {

                if (item.id == id) {

                    if (type == 'add') {
                        if (item.qty >= 0) {
                            item.qty += 1;
                        }
                    } else if (type == 'remove') {
                        if (item.qty > 0) {
                            item.qty -= 1;
                        }
                    }

                    ele.parent().find('.fbcnt').val(item.qty);
                    itemObject.find('input').val(item.qty);

                    isItmExist = true;

                    return;
                }

            });
        }

        if (!isItmExist) {

            if (($("#hdniszhowbiz").val() == "1" && bkSt.fb.length > 9 && type == 'add')) {
                return false;
            }
            else {
                if (type == 'add') {

                    var imageUrl = itemObject.find('.fb-poster').css('background-image');
                    imageUrl = imageUrl.replace('url(', '').replace(')', '').replace(/\"/gi, "");

                    var fbitem = {};
                    fbitem.id = id;
                    fbitem.desc = ele.data('desc');
                    fbitem.price = ele.data('price');
                    fbitem.qty = 1;
                    fbitem.imageUrl = imageUrl;

                    bkSt.fb.push(fbitem);

                    ele.parent().find('.fbcnt').val(fbitem.qty);
                    itemObject.find('input').val(fbitem.qty);
                }
            }
        }

        var orderfbheader = $(".tn-fandb-selected");
        var orderfbfooter = $(".tn-items-count-and-price");
        var orderFBItems = $(".tn-fandb-items");
        var fbItemTemp = $("#orderfbitem");
        var fbTotItem = $("#orderfbTotItem");
        var grdtot = 0;
        var totalItems = 0;

        orderFBItems.html('');
        orderfbheader.hide();
        orderfbfooter.hide();

        $.each(bkSt.fb, function (i, item) {
            if (item.qty > 0) {
                orderFBItems.append(TKTNEW.Misc.templateById(fbItemTemp, {
                    image: item.imageUrl,
                    id: item.id,
                    name: item.desc,
                    qty: item.qty,
                    price: (item.qty * item.price).toFixed(2)
                }));

                grdtot += (item.qty * item.price);
                totalItems += item.qty;

                orderfbheader.show();
                orderfbfooter.show();
            }
        });
        grdtot = grdtot.toFixed(2);
        $(".tn-items-count-and-price").html(TKTNEW.Misc.templateById(fbTotItem, {
            qty: totalItems,
            total: grdtot
        }));
    },

    clearfb: function () {
        bkSt.fb = [];
        $(".tn-fandb-selected").hide();
        $(".tn-items-count-and-price").hide();
        $(".tn-fandb-items").html('');
        $(".tn-items-count-and-price").html('');
        $(".tn-item-select .fbcnt").val(0);
    },

    donationChange: function () {

        var grdtothtml = "0";
        if ($("#chkdonation").is(":checked")) {
            grdtothtml = parseFloat($("#hdnGAmt").val());
        } else {
            grdtothtml = parseFloat($("#hdnGAmt").val()) - parseFloat($("#chkdonationAmt").text());
        }

        $("#spnGtot").html(grdtothtml);
    },

    eventTicket: function (type, id, fullid, el) {

        var ele = $(el);
        var itemObject = $("#eventLevelItem_" + fullid);
        var isItmExist = false;

        if (bkSt.fb.length > 0) {
            $.each(bkSt.fb, function (i, item) {

                if (item.id == id) {

                    if (type == 'add') {
                        if (item.qty >= 0 && item.qty < 10) {
                            item.qty += 1;
                        }
                    } else if (type == 'remove') {
                        if (item.qty > 0) {
                            item.qty -= 1;
                            if (item.qty == 0) {
                                bkSt.fb.splice(i, 1);
                            }
                        }
                    }

                    ele.parent().find('.fbcnt').val(item.qty);
                    itemObject.find('input').val(item.qty);

                    isItmExist = true;

                    return;
                }

            });
        }

        if (!isItmExist) {

            if (type == 'add') {

                //  var imageUrl ="";
                //imageUrl = imageUrl.replace('url(', '').replace(')', '').replace(/\"/gi, "");

                var eventitem = {};
                eventitem.id = ele.data('levelid');
                eventitem.desc = ele.data('desc');
                eventitem.price = ele.data('price');
                eventitem.qty = 1;
                eventitem.time = ele.data('time');
                $("#hdEventTimeDisplay").val(ele.data('timedisplay'));
                bkSt.fb.push(eventitem);

                ele.parent().find('.fbcnt').val(eventitem.qty);
                itemObject.find('input').val(eventitem.qty);
            }
        }

        var orderFBItems = $("#eventItems");
        var fbItemTemp = $("#ordereventitem");
        var fbTotItem = $("#ordereventTotItem");
        var grdtot = 0;
        var totalItems = 0;

        orderFBItems.html('');

        $.each(bkSt.fb, function (i, item) {
            if (item.qty > 0) {
                orderFBItems.append(TKTNEW.Misc.templateById(fbItemTemp, {
                    time: item.time,
                    id: item.id,
                    name: item.desc,
                    qty: item.qty,
                    singlePrice: item.price,
                    price: (item.qty * item.price)
                }));

                grdtot += (item.qty * item.price);
                totalItems += item.qty;

                //    orderfbheader.show();
                //   orderfbfooter.show();
            }
        });

        $(".tn-items-count-and-price").html(TKTNEW.Misc.templateById(fbTotItem, {
            qty: totalItems,
            total: grdtot
        }));
    },

    doPay: function () {

        var $terms = $("input[name='accept_terms']:checked");
        var $sel = $("[aria-hidden='false'], .tn-last-offer-pg-area").find(".tn-radio-button-block input[type='radio']:checked");
        if (($sel.data('pggrid') == 34 && $sel.data('pgid') == 48) && $sel.length == 1) {
            document.getElementById('hdnsavedcardpay').value = 1;
        }
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find(".tn-select-bank option:selected");
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find("#citrusgid");
        if ($sel.length == 0) {
            $sel = $("[aria-hidden='false']").find("#dccc");

            if ($sel.length == 1)
                document.getElementById('hdnsavedcardpay').value = 0;
            else
                document.getElementById('hdnsavedcardpay').value = 1;


        }
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find("#txtVPA");
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find("#txtOTP");
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find("#txteEmail");



        if ($terms.length == 0) {
            TKTNEW.Misc.alert({
                message: 'To do payment, please accept the terms and conditions',
                buttons: {
                    cancel: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            return
        }



        //
        var $varlater = $("[aria-hidden='false'], .tn-last-offer-pg-area").find(".tn-radio-button-block input[type='radio']");
        var $sel1 = $("[aria-hidden='false'], .tn-last-offer-pg-area").find(".tn-radio-button-block input[type='radio']:checked");
        if ($varlater.data('pggrid') == 30) {

            if ($sel1.length == 0) {
                TKTNEW.Misc.alert({
                    message: 'Please select any option',
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });
                return false;
            }
            if ($sel1.data('pgid') == 35) {

                if ($('#txtOTP').val() == '') {
                    TKTNEW.Misc.alert({
                        message: 'Please enter the OTP.',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    return false;
                }
                else {
                    if ($sel1.data('pgid') == 35) {
                        TKTNEW.Misc.alert({
                            message: "You will have to pay Rs " + $("#divGrandTotal").html() + "  to LazyPay by " + $("#spanlazytext").html() + "",
                            buttons: {
                                cancel: {
                                    text: 'Cancel',
                                    btnClass: 'tn-red'
                                },
                                ok: {
                                    text: 'Agree',
                                    btnClass: 'tn-green',
                                    action: function () {
                                        _proceed();
                                    }
                                }
                            }
                        });

                    }

                }
            }

                //

            else if ($sel.data('pgid') == 43) {
                var email = document.getElementById("txteEmail").value;
                var phone = document.getElementById("txteMobile").value;
                var atpos = email.indexOf("@");
                var dotpos = email.lastIndexOf(".");
                if (email == '') {
                    TKTNEW.Misc.alert({
                        message: 'Please provide a email',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    return false;
                }
                else if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
                    TKTNEW.Misc.alert({
                        message: 'Please enter a valid email',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    return false;
                }
                if (phone == '') {
                    TKTNEW.Misc.alert({
                        message: 'Please provide a mobile number.',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    return false;
                }
                else if (phone.length != 10) {
                    TKTNEW.Misc.alert({
                        message: 'Please enter a valid mobile number',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                    return false;
                }
                var pgs = document.getElementById("hdnOfferAllowedpgs").value;
                //alert(pgs.split(",").indexOf("47"));

                if (document.getElementById("Enablepaytmpromocode").value == "0") {
                    if (pgs.split(",").length < 5 && pgs.split(",").indexOf("47") > -1) {

                        var offercode = document.getElementById("hdnoffercode").value;
                        var _message = "";
                        //     if (offercode.toUpperCase() == "TICKET150" || offercode.toUpperCase() == "MOVIE200" || offercode.toUpperCase() == "TICKET100" || offercode.toUpperCase() == "FILM100" || offercode.toUpperCase() == "FLAT75" || offercode.toUpperCase() == "CINEMA50" || offercode.toUpperCase() == "CINEMA150" || offercode.toUpperCase() == "PADMA" || offercode.toUpperCase() == "PRASADS" || offercode.toUpperCase() == "MOVIEMADNESS" || offercode.toUpperCase() == "ZEON200" || offercode.toUpperCase() == "WEEKDAY" || offercode.toUpperCase() == "XMAS50" || offercode.toUpperCase() == "GAIN50" || offercode.toUpperCase() == "TICKETNEW") {
                        _message += "Cashback will be credited within 72 hours from the time of booking to your Paytm wallet.</br>"
                        _message += "please visite offer section for detailed offer Terms & Conditions."

                        TKTNEW.Misc.alert({
                            message: _message,
                            buttons: {
                                cancel: {
                                    text: 'Ok',
                                    btnClass: 'tn-green',
                                    action: function () {
                                        _proceed();
                                    }
                                }
                            }
                        });
                        //  }
                    }
                    else {
                        _proceed();
                    }
                }
                else {
                    _proceed();
                }

            }
        }
        else {
            var pgs = document.getElementById("hdnOfferAllowedpgs").value;
            //alert(pgs.split(",").indexOf("47"));
            if (document.getElementById("Enablepaytmpromocode").value == "0") {
                if (pgs.split(",").length < 5 && pgs.split(",").indexOf("47") > -1) {

                    var offercode = document.getElementById("hdnoffercode").value;
                    var _message = "";
                    //    if (offercode.toUpperCase() == "TICKET150" || offercode.toUpperCase() == "MOVIE200" || offercode.toUpperCase() == "TICKET100" || offercode.toUpperCase() == "FILM100" || offercode.toUpperCase() == "FLAT75" || offercode.toUpperCase() == "CINEMA50" || offercode.toUpperCase() == "CINEMA150" || offercode.toUpperCase() == "PADMA" || offercode.toUpperCase() == "PRASADS" || offercode.toUpperCase() == "MOVIEMADNESS" || offercode.toUpperCase() == "ZEON200" || offercode.toUpperCase() == "WEEKDAY" || offercode.toUpperCase() == "XMAS50" || offercode.toUpperCase() == "GAIN50" || offercode.toUpperCase() == "TICKETNEW") {
                    _message += "Cashback will be credited within 72 hours from the time of booking to your Paytm wallet.</br>"
                    _message += "please visite offer section for detailed offer Terms & Conditions."


                    TKTNEW.Misc.alert({
                        message: _message,
                        buttons: {
                            cancel: {
                                text: 'Ok',
                                btnClass: 'tn-green',
                                action: function () {
                                    _proceed();
                                }
                            }
                        }
                    });
                    //  }
                }
                else {
                    _proceed();
                }
            }
            else {
                _proceed();
            }
        }


        function _proceed() {

            if ($sel.length > 0 && $sel.data('pggrid') !== undefined) {
                if ($sel.data('pggrid') == 3) {
                    document.getElementById('HdPaymentId').value = $sel.data('pggrid');

                    document.getElementById("hdnbankName").value = $sel.data('pgname');
                    document.getElementById("hdnpgid").value = $sel.data('pgid');//param3;
                    document.getElementById("hdnbank").value = $sel.data('pgcode');//param1;

                    var altLink = $("a[bnkcode='" + $sel.data('pgcode') + "']");
                    document.getElementById("Althdnpgid").value = $sel.data('apgid');
                    document.getElementById("Althdnbank").value = $sel.data('apgcode');

                    if (document.getElementById("hdnbankName").value == "" ||
                        document.getElementById("hdnpgid").value == "" ||
                        document.getElementById("hdnbank").value == "") {
                        TKTNEW.Misc.alert({
                            message: 'Please select a bank',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                        return false;
                    }
                } else if ($sel.data('pggrid') == 16) {

                    var vpaRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+$/;

                    if ($('#txtVPA').val() == '') {
                        TKTNEW.Misc.alert({
                            message: 'Enter VPA !',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                        return false;
                    }
                    if ($('#txtVPA').val().length > 255) {
                        TKTNEW.Misc.alert({
                            message: 'You can not enter  VPA more than 255 characters !',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                        return false;
                    }
                    if (vpaRegex.test($('#txtVPA').val()) == '') {
                        TKTNEW.Misc.alert({
                            message: 'Invalid VPA, ex. examble@upi,examble@hdfcbank,examble@axisbank',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                        return false;
                    }

                    document.getElementById('HdPaymentId').value = $sel.data('pgid');
                    document.getElementById("hdnVPA").value = document.getElementById("txtVPA").value;

                }
                else if ($sel.data('pgid') == 35) {

                    var alertMgs = "";
                    var RefNo_Mode = document.getElementById("hdnRefNo").value;
                    var OTP = document.getElementById("txtOTP").value;
                    var tktNewTransid = document.getElementById("hdntransid").value;
                    TKTNEW.Misc.ajax({
                        type: 'POST',
                        async: false,
                        datatype: 'json',
                        contenttype: "json",
                        url: "calls/ValidateConfirm",
                        accept: 'application/json; charset=utf-8',
                        data: "{'OTP':'" + OTP + "','RefNo_Mode':'" + RefNo_Mode + "'}",
                        success: function (result) {
                            var vresult = result.d;
                            if (vresult.length > 50) {
                                $('#hdnLazyQuery').val(result.d);
                                alertMgs = vresult;
                            }
                            else {
                                alertMgs = vresult;
                            }
                        }
                    });
                    if (alertMgs.length < 50) {
                        TKTNEW.Misc.alert({
                            message: 'Please verify the OTP.',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                        return false;
                    }

                    document.getElementById('HdPaymentId').value = "35";

                }
                else if ($sel.data('pgid') == 43) {

                    var transAmt = $("#hdnAmount").val();
                    if (transAmt < 500) {
                        if ($('#txtOTP').val() == '') {
                            TKTNEW.Misc.alert({
                                message: 'Please enter the OTP.',
                                buttons: {
                                    ok: {
                                        text: 'Ok',
                                        btnClass: 'tn-green'
                                    }
                                }
                            });
                            return false;
                        }
                        else {
                            var vresult = "";
                            var RefNo_Mode = document.getElementById("hdnRefNo").value;
                            var OTP = document.getElementById("txtOTP").value;
                            var tktNewTransid = document.getElementById("hdntransid").value;
                            TKTNEW.Misc.ajax({
                                type: 'POST',
                                async: false,
                                datatype: 'json',
                                contenttype: "json",
                                url: "calls/ePayVerifyOTP",
                                accept: 'application/json; charset=utf-8',
                                data: "{'OTP':'" + OTP + "','RefNo_Mode':'" + RefNo_Mode + "'}",
                                success: function (result) {
                                    vresult = result.d;
                                    if (vresult.indexOf("APICall") > -1) {
                                        $('#hdnLazyQuery').val(result.d);
                                    }
                                    else {
                                        alert(vresult);
                                    }
                                }
                            });



                            if (vresult.indexOf("APICall") < 0) {
                                document.getElementById("txtOTP").value = "";
                                document.getElementById("txtOTP").focus();
                                TKTNEW.Misc.alert({
                                    message: vresult,
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                                return false;
                            }

                        }
                    }
                    document.getElementById('HdPaymentId').value = "43";
                }
                else if ($sel.data('pggrid') == 17 && $sel.data('pgid') == 32) {

                    if (document.getElementById('hdnaddnpayflag').value != "1") {
                        var Transid = document.getElementById("hdntransid").value;
                        var offerallowedepgs = document.getElementById("hdnOfferAllowedpgs").value;
                        var offercode = document.getElementById("hdnoffercode").value;


                        TKTNEW.Misc.loader(true);

                        try {
                            TKTNEW.Misc.ajax({
                                type: 'POST',
                                datatype: 'json',
                                contenttype: "json",
                                url: "calls/setPaymentLog",
                                accept: 'application/json; charset=utf-8',
                                data: "{'TransId':'" + Transid + "','bankName':'citrusjs','pgid':'" + 17 + "'}",
                                success: function (result) {
                                }
                            });
                        } catch (e) {

                        }
                        TKTNEW.Misc.ajax({
                            type: 'POST',
                            datatype: 'json',
                            contenttype: 'string',
                            url: "calls/GetCitrusPayDetails",
                            accept: 'application/json; charset=utf-8',
                            data: "{'TransId':'" + Transid + "','Offerallowedepgs':'" + offerallowedepgs + "','Offercode':'" + offercode + "'}",

                            success: function (result) {

                                var Transdetail = eval("(" + result.d + ")");
                                var Len = Transdetail.PGCitrusDTOItems.length;

                                $('#citrusFirstName').val(Transdetail.PGCitrusDTOItems[0].citrusFirstName);

                                $('#citrusLastName').val(Transdetail.PGCitrusDTOItems[0].citrusLastName);
                                $('#citrusEmail').val(Transdetail.PGCitrusDTOItems[0].citrususerid);
                                $('#citrusAmount').val(Transdetail.PGCitrusDTOItems[0].citrusAmount);
                                $('#citrusMobile').val("9999999999");
                                $('#citrusMerchantTxnId').val(Transdetail.PGCitrusDTOItems[0].citrusMerchantTxnId);
                                $('#citrusSignature').val(Transdetail.PGCitrusDTOItems[0].citrusSignature);
                                $('#citrusReturnUrl').val(Transdetail.PGCitrusDTOItems[0].citrusReturnUrl);
                                $('#citrusNotifyUrl').val(Transdetail.PGCitrusDTOItems[0].citrusNotifyUrl);

                                $('#citrusRuleName').val(Transdetail.PGCitrusDTOItems[0].citrusRuleName);
                                $('#citrusAlteredAmount').val(Transdetail.PGCitrusDTOItems[0].citrusAlteredAmount);
                                $('#citrusDpSignature').val(Transdetail.PGCitrusDTOItems[0].citrusDpSignature);
                                //$('#citrusOfferToken').val(Transdetail.PGCitrusDTOItems[0].citrusOfferToken);


                                TKTNEW.Misc.loader(false);

                                citrusmakePayment();

                            }, error: function (xhr, ajaxOptions, thrownError) {
                                TKTNEW.Misc.loader(false);
                                TKTNEW.Misc.alert({
                                    message: 'Unable to retrive the information. Please try after sometime.',
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green',
                                            action: function () {
                                                window.location.href = location.href;
                                            }
                                        }
                                    }
                                });
                            }
                        });

                        return;
                    }
                    else {
                        // paytm dc -add and pay flow

                        //validate card info 

                        var isvalidatep = 1;
                        var carderror = '';
                        var cardnum = '';
                        cardnum = document.getElementById('citrusNumber').value.replace(/ /g, '');
                        if (document.getElementById('citrusCvv').value == '') {
                            isvalidatep = 0;
                            carderror = "Provide Cvv number !!";
                        }

                        if (document.getElementById('citrusyearddl').value == '') {
                            isvalidatep = 0;
                            carderror = "Select Expiry year !!";
                        }


                        if (document.getElementById('citrusmonth').value == '') {
                            isvalidatep = 0;
                            carderror = "Select Expiry month !!";
                        }

                        if (cardnum != '') {
                            //call paytm js validation 
                            if (!valid_credit_card(cardnum)) {
                                isvalidatep = 0;
                                carderror = "Incorrect card number !!";
                                //

                            }
                        }
                        else {
                            isvalidatep = 0;
                            carderror = "Incorrect card number !!";
                        }


                        if (isvalidatep == 0) {
                            TKTNEW.Misc.alert({
                                message: carderror,
                                buttons: {
                                    ok: {
                                        text: 'Ok',
                                        btnClass: 'tn-green'
                                    }
                                }
                            });
                            carderror = '';
                            isvalidatep = 1;
                            return false;
                        }
                        document.getElementById('cardinfopaytm').value = '|' + cardnum + '|' + document.getElementById('citrusCvv').value + '|' + document.getElementById('citrusmonth').value + document.getElementById('citrusyearddl').value;

                        //
                        document.getElementById('hdnaddnpayflag').value == "0";
                        paytmFinalprocesstransaction(document.getElementById('hdnpaytmtoken').value, document.getElementById('hdnreqid').value, "ADDANDPAY", document.getElementById('cardinfopaytm').value);


                        //
                    }

                }


                else {

                    document.getElementById('HdPaymentId').value = $sel.data('pgid');
                    document.getElementById("hdnbankName").value == "PG";

                }

                if ($sel.data('pggrid') == 34 || $sel.data('pggrid') == 35 || $sel.data('pggrid') == 31 || ($sel.data('pggrid') == 17 && $sel.data('pgid') == 48) || ($sel.data('pggrid') == 16 && $sel.data('pgid') == 50)) {



                    if ($sel.data('pgid') == 51) {
                        AjaxCalls.setLoader(true);
                        //net bank -continue
                        var x = document.getElementById("drpnetbanks");
                        if (x.value != '0') {
                            paytmNetbprocesstransaction(document.getElementById('hdnpaytmtoken').value, document.getElementById("hdnreqid").value, document.getElementById('hdntransid').value, "NET_BANKING", x.value);
                        }
                        else {
                            TKTNEW.Misc.alert({
                                message: 'Select Bank !',
                                buttons: {
                                    ok: {
                                        text: 'Ok',
                                        btnClass: 'tn-green'
                                    }
                                }
                            });
                            AjaxCalls.setLoader(false);
                            return false;
                        }

                        //
                    }
                    else {
                        //Validate input 
                        var isvalidatep = 1;
                        var carderror = '';
                        var pgname = "";
                        document.getElementById('HdPaymentId').value = $sel.data('pgid');
                        if ($sel.data('pgid') == 47 || $sel.data('pgid') == 55) {
                            //card info validate
                            if ($sel.data('pgid') == 47) {
                                pgname = "wallet";
                                if (document.getElementById('txtpaytmmno').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Enter paytm registered mobile number !!";
                                }
                                else {


                                    var numericReg = /^[0-9]*$/;
                                    if (!numericReg.test(document.getElementById('txtpaytmmno').value)) {
                                        isvalidatep = 0;
                                        carderror = "Invalid mobile number !!";
                                    }
                                    else if (document.getElementById('txtpaytmmno').value.length != 10) {
                                        isvalidatep = 0;
                                        carderror = "Invalid mobile number !!";
                                    }
                                    else if (document.getElementById('txtpaytmmno').value.indexOf(" ") != -1) {
                                        isvalidatep = 0;
                                        carderror = "Invalid mobile number !!";
                                    }
                                    else {
                                        document.getElementById('hdnmobile').value = document.getElementById('txtpaytmmno').value;
                                        isvalidatep = 1;
                                    }
                                }

                            }
                            else {
                                pgname = "PostPaid";
                                if (document.getElementById('txtpaytmpostpaidmno').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Enter paytm registered mobile number !!";
                                }
                                else {


                                    var numericReg = /^[0-9]*$/;
                                    if (!numericReg.test(document.getElementById('txtpaytmpostpaidmno').value)) {
                                        isvalidatep = 0;
                                        carderror = "Invalid mobile number !!";
                                    }
                                    else if (document.getElementById('txtpaytmpostpaidmno').value.length != 10) {
                                        isvalidatep = 0;
                                        carderror = "Invalid mobile number !!";
                                    }
                                    else if (document.getElementById('txtpaytmpostpaidmno').value.indexOf(" ") != -1) {
                                        isvalidatep = 0;
                                        carderror = "Invalid mobile number !!";
                                    }
                                    else {
                                        document.getElementById('hdnmobile').value = document.getElementById('txtpaytmpostpaidmno').value;
                                        isvalidatep = 1;
                                    }
                                }

                            }



                            if (isvalidatep == 0) {
                                TKTNEW.Misc.alert({
                                    message: carderror,
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                                carderror = '';
                                isvalidatep = 1;
                                return false;
                            }
                        }


                        if ($sel.data('pgid') == 48 || $sel.data('pgid') == 49) {
                            var numericReg = /^[0-9]*$/;
                            //card info validate
                            if ($sel.data('pgid') == 48)
                                pgname = "DC";
                            else if ($sel.data('pgid') == 49)
                                pgname = "CC";


                            if (document.getElementById('hdnsavedcardpay').value == 1) {
                                // saved card seleted

                                //$sel.data('sid')
                                if (document.getElementById('Scvv_' + $sel.data('sid') + '').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Provide Cvv number !!";
                                }

                                if (isvalidatep == 0) {
                                    TKTNEW.Misc.alert({
                                        message: carderror,
                                        buttons: {
                                            ok: {
                                                text: 'Ok',
                                                btnClass: 'tn-green'
                                            }
                                        }
                                    });
                                    carderror = '';
                                    isvalidatep = 1;
                                    return false;
                                }

                            }
                            else {

                                // normal card validation -----
                                if (document.getElementById('paytmCvv').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Provide Cvv number !!";
                                }

                                if (document.getElementById('paytmyearddl').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Select Expiry year !!";
                                }
                                if (document.getElementById('paytmmonth').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Select Expiry month !!";
                                }

                                if (document.getElementById('txtcardinfop').value != '') {
                                    //call paytm js validation 
                                    if (!valid_credit_card(document.getElementById('txtcardinfop').value)) {
                                        isvalidatep = 0;
                                        carderror = "Provide correct card number !!";
                                        //

                                    }
                                }
                                else {
                                    isvalidatep = 0;
                                    carderror = "Empty card number !!";
                                }

                                if (isvalidatep == 0) {
                                    TKTNEW.Misc.alert({
                                        message: carderror,
                                        buttons: {
                                            ok: {
                                                text: 'Ok',
                                                btnClass: 'tn-green'
                                            }
                                        }
                                    });
                                    carderror = '';
                                    isvalidatep = 1;
                                    return false;
                                }
                            }

                            if (document.getElementById('hdnsavedcardpay').value == 1) {

                                //cardInfo: 123456||123|
                                document.getElementById('cardinfopaytm').value = $sel.data('sid') + '||' + document.getElementById('Scvv_' + $sel.data('sid') + '').value + '|';

                            }
                            else {
                                document.getElementById('cardinfopaytm').value = '|' + document.getElementById('txtcardinfop').value + '|' + document.getElementById('paytmCvv').value + '|' + document.getElementById('paytmmonth').value + document.getElementById('paytmyearddl').value;
                                var $savecard = $("input[name='chkboxsavecard']:checked");
                                if ($savecard.length == 1) {
                                    document.getElementById('hdnpaytmsavecardflag').value = 1;

                                }
                                else {
                                    document.getElementById('hdnpaytmsavecardflag').value = 0;
                                }
                            }



                        }
                        else if ($sel.data('pgid') == 50) {
                            pgname = "UPI";
                            if ($sel.data('pggrid') == 31) {

                                if (document.getElementById('txtpaytmUPIid').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Invalid VPA !!";

                                }
                                var vpaRegexp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+$/;
                                if (vpaRegexp.test(document.getElementById('txtpaytmUPIid').value) == '') {
                                    isvalidatep = 0;
                                    carderror = "Invalid VPA !!";

                                }
                                else {
                                    document.getElementById('cardinfopaytm').value = document.getElementById('txtpaytmUPIid').value;
                                }

                            }
                            else if ($sel.data('pggrid') == 16) {
                                if (document.getElementById('txtVPA').value == '') {
                                    isvalidatep = 0;
                                    carderror = "Invalid VPA !!!";

                                }
                                var vpaRegexp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+$/;
                                if (vpaRegexp.test(document.getElementById('txtVPA').value) == '') {
                                    isvalidatep = 0;
                                    carderror = "Invalid VPA !!!";

                                }
                                else {
                                    document.getElementById('cardinfopaytm').value = document.getElementById('txtVPA').value;
                                }
                            }
                            if (isvalidatep == 0) {
                                TKTNEW.Misc.alert({
                                    message: carderror,
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                                carderror = '';
                                isvalidatep = 1;
                                return false;
                            }


                        }

                        //
                        AjaxCalls.setLoader(true);
                        if (document.getElementById('hdnaddnpayflag').value == "1" && $sel.data('pgid') == "48" && document.getElementById('cardinfopaytm').value.length > 1) {
                            //$sel.data('pgid').val("47");
                            document.getElementById('hdnaddnpayflag').value == "0";

                            paytmFinalprocesstransaction(document.getElementById('hdnpaytmtoken').value, document.getElementById('hdnreqid').value, "ADDANDPAY", document.getElementById('cardinfopaytm').value);

                        }
                        else {
                            // Paytm Xpress
                            //1.initiate transcation 
                           var piurl = 'OnlineTheatre/PG/PGSelection.aspx/PAytmXpressprocess';
                           //  var piurl = 'TicketNewWebsite_New/OnlineTheatre/PG/PGSelection.aspx/PAytmXpressprocess';
                            var paytmtoken, requestidpaytm;
                            var setpromo = '';
                            if (document.getElementById("Enablepaytmpromocode").value == "1") {
                                setpromo = document.getElementById('hdnoffercode').value;
                            }

                            TKTNEW.Misc.ajax({
                                type: 'POST',
                                datatype: 'json',
                                contenttype: 'string',
                                accept: 'application/json; charset=utf-8',
                                url: piurl,
                                data: "{'pid':'" + $sel.data('pgid') + "','amount':'" + document.getElementById('hdnAmount').value + "','uphone':'" + document.getElementById('hdnmobile').value + "','ptransid':'" + document.getElementById('hdntransid').value + "','puseremail':'" + document.getElementById('hdnemail').value + "','pgnames':'" + pgname + "','promocode':'" + setpromo + "'}",
                                success: function (result) {

                                    document.getElementById('hdnreqid').value = result.d[0];
                                    requestidpaytm = result.d[0];
                                    if (result.d[1] != null && result.d[1] != '') {
                                        paytmtoken = result.d[1];
                                        document.getElementById('hdnpaytmtoken').value = paytmtoken;
                                        document.getElementById("hdnreqid").value = requestidpaytm;
                                        document.getElementById('hdnAmount').value = result.d[2];

                                        // show dialog user to confirm promo code if applied is success or not
                                        if (document.getElementById("Enablepaytmpromocode").value == "1") {
                                            if (document.getElementById('hdnoffercode').value != '') {   // if promo code applied only

                                                if (result.d[3] == 'success') {
                                                    TKTNEW.Misc.alert({
                                                        message: 'Congratulation ! PROMO CODE - " ' + document.getElementById('hdncouponcode').value + ' " has applied successfully ! Cashback will be credited to your paytm wallet after successful order ..',
                                                        buttons: {
                                                            ok: {
                                                                text: 'Ok',
                                                                btnClass: 'tn-green'
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    TKTNEW.Misc.alert({
                                                        message: 'Oops ! PROMO CODE - " ' + document.getElementById('hdnoffercode').value + ' " has NOT eligible for cashback ! Please contact customer support for assistance !',
                                                        buttons: {
                                                            ok: {
                                                                text: 'Ok',
                                                                btnClass: 'tn-green'
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                        // ---

                                        switch ($sel.data('pgid')) {
                                            case 47:
                                                paytmOTPprocess(paytmtoken, requestidpaytm, "1", "BALANCE");
                                                break;
                                            case 48:
                                                // dc                                    
                                                paytmDcorCcprocess(paytmtoken, requestidpaytm, "1", "DEBIT_CARD");

                                                break;
                                            case 49:
                                                //cc
                                                paytmDcorCcprocess(paytmtoken, requestidpaytm, "1", "CREDIT_CARD");
                                                break;
                                            case 50:
                                                //upi
                                                paytmUpiprocess(paytmtoken, requestidpaytm, "1");
                                                break;
                                            case 55:
                                                paytmOTPprocess(paytmtoken, requestidpaytm, "1", "PAYTM_DIGITAL_CREDIT");
                                                break;


                                        }


                                    }
                                    else {
                                        TKTNEW.Misc.alert({
                                            message: 'Failed in initiate transaction process..Please select different pay option!!',
                                            buttons: {
                                                ok: {
                                                    text: 'Ok',
                                                    btnClass: 'tn-green'
                                                }
                                            }
                                        });
                                    }

                                }, error: function (xhr, ajaxOptions, thrownError) {
                                    AjaxCalls.setLoader(false);
                                    TKTNEW.Misc.alert({
                                        message: 'Technical error in initiating  request ..Cannot process Paytm payment..Please select different pay option!!',
                                        buttons: {
                                            ok: {
                                                text: 'Ok',
                                                btnClass: 'tn-green'
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }

                } else if ($sel.data('pggrid') == 16) {
                    var pgidsbi = $sel.data('pgid');

                    if (pgidsbi == 37) {
                        TKTNEW.Misc.loader(true);
                        var topPos = (window.innerHeight / 2) - ($('#timersbi').width() / 2);
                        var leftPos = (window.innerWidth / 2) - ($('#timersbi').width() / 2);

                        $('.upiContainer').css({
                            top: 370,
                            left: leftPos,
                            position: 'relative'
                        });


                        //sbi 
                        var piurl = 'OnlineTheatre/PG/PGSelection.aspx/SBIprocessinitiate';
                        var vpaval = document.getElementById("txtVPA").value;
                        var requestid;

                        TKTNEW.Misc.ajax({
                            type: 'POST',
                            datatype: 'json',
                            contenttype: 'string',
                            accept: 'application/json; charset=utf-8',
                            url: piurl,
                            data: "{'pid':'" + pgidsbi + "','vpa':'" + vpaval + "','amount':'" + document.getElementById('hdnAmount').value + "','transidsbi':'" + document.getElementById('hdntransid').value + "'}",
                            success: function (result) {
                                document.getElementById('hdnreqid').value = result.d[0];
                                requestid = result.d[0];
                                sbireturnval = result.d[2];
                                sbiintervaltime = result.d[1];
                                document.getElementById('hdnAmount').value = result.d[3];
                                sbiprocess($sel.data('pgid'), document.getElementById("txtVPA").value, document.getElementById('hdnreqid').value);

                            }, error: function (xhr, ajaxOptions, thrownError) {
                                TKTNEW.Misc.alert({
                                    message: 'Technical error in initiating request ..Cannot process SBI payment!!',
                                    buttons: {
                                        ok: {
                                            text: 'Ok',
                                            btnClass: 'tn-green'
                                        }
                                    }
                                });
                                return false;
                            }
                        });

                    }
                    else {

                        var topPos = (window.innerHeight / 2) - ($('#timer').width() / 2);
                        var leftPos = (window.innerWidth / 2) - ($('#timer').width() / 2);

                        $('.upiContainer').css({
                            top: topPos,
                            left: leftPos,
                            position: 'relative'
                        });

                        $('#upiprogress').show();
                        // hdfc
                        __doPostBack("MakePayment", "");

                    }
                } else if ($sel.data('pggrid') != 4) {
                    AjaxCalls.setLoader(true);
                    __doPostBack("MakePayment", "");
                }

            }
            else if (document.getElementById('HdPaymentId').value == "13") {
                AjaxCalls.setLoader(true);
                __doPostBack("MakePayment", "");
            }
                //
            else if (document.getElementById("hdnpgid").value == "46") {
                if ($('#divGiftCardTotal').val() == "") {
                    TKTNEW.Misc.alert({
                        message: 'No input found (or) No option selected to proceed payment !',
                        buttons: {
                            ok: {
                                text: 'Ok',
                                btnClass: 'tn-green'
                            }
                        }
                    });
                }
            }
                //
            else {
                TKTNEW.Misc.alert({
                    message: 'Please select a bank',
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });
                return false;
            }
        }
    },

    confirm: function (el) {
        var strParam = $(el).data('tid') + "," + $(el).data('code');
        AjaxCalls.setLoader(true);
        __doPostBack("PostForm", strParam);
    },

    cancel: function (el) {
        var strParam = $(el).data('tid') + "," + $(el).data('vid');

        TKTNEW.Misc.alert({
            message: 'Are you sure do you want to process the refund for this transaction?',
            buttons: {
                cancel: {
                    text: 'Cancel',
                    btnClass: 'tn-red'
                },
                ok: {
                    text: 'Refund',
                    btnClass: 'tn-green',
                    action: function () {
                        AjaxCalls.setLoader(true);
                        __doPostBack("PostForm_Abort", strParam);
                    }
                }
            }
        });
    },

    abort: function () {
        TKTNEW.Misc.alert({
            message: 'Are you sure do you want to abort this transaction?',
            buttons: {
                cancel: {
                    text: 'Cancel',
                    btnClass: 'tn-red'
                },
                ok: {
                    text: 'Abort',
                    btnClass: 'tn-green',
                    action: function () {
                        AjaxCalls.setLoader(true);
                        setTimeout(function () {
                            __doPostBack("Redirect", "");
                        }, 200);
                    }
                }
            }
        });
    },

    filterCinema: function () {

        setTimeout(function () {

            var selectedFilters = {};

            var amiFltr = $("#ddlAmenities option:selected"),
                expFltr = $("#ddlExperience option:selected"),
                searchString = $("#txtShowtimeSearch").val().toLowerCase();

            if (amiFltr.length > 0 && amiFltr.val() != "default") {
                var amiFiltrName = "amiFiltr";
                if (!selectedFilters.hasOwnProperty(amiFiltrName)) {
                    selectedFilters[amiFiltrName] = [];
                }
                selectedFilters[amiFiltrName].push(amiFltr.val());
            }

            if (expFltr.length > 0 && expFltr.val() != "default") {
                var expFiltrName = "expFiltr";
                if (!selectedFilters.hasOwnProperty(expFiltrName)) {
                    selectedFilters[expFiltrName] = [];
                }
                selectedFilters[expFiltrName].push(expFltr.val());
            }

            // create a collection containing all of the filterable elements
            var $resultElements = $('.tn-entity-and-timing-details');
            var $filteredResults = $resultElements;

            if (!$.isEmptyObject(selectedFilters)) {
                // loop over the selected filter name -> (array) values pairs
                $.each(selectedFilters, function (name, filterValues) {
                    // filter each .list-item element
                    $filteredResults = $filteredResults.filter(function () {

                        var matched = false,
                            currentFilterableElement = $(this),
                            currentFilterValues = $(this).data('filter').split('|');

                        // loop over each filter value in the current .list-item's data-filter
                        $.each(currentFilterValues, function (_, currentFilterValue) {

                            // if the current value exists in the selected filters array
                            // set matched to true, and stop looping. as we're ORing in each
                            // set of filters, we only need to match once
                            if ($.inArray(currentFilterValue, filterValues) != -1) {
                                matched = true;
                                return false;
                            }
                        });

                        return matched;

                    });
                });
            }

            $resultElements.hide().filter($filteredResults).fadeIn('slow');

            var $visibleElements = $('.tn-entity-and-timing-details:not(:hidden)');
            $visibleElements.each(function () {
                var searchFilterValues = $(this).data('sfilter');
                $(this).find('.tn-entity-details h5').html(searchFilterValues);

                if (searchString.length > 0 && searchFilterValues.toLowerCase().indexOf(searchString) >= 0) {

                    var text = searchString;
                    var query = new RegExp("(" + text + ")", "gi");
                    var e = $(this).find('.tn-entity-details h5').html();
                    text = text.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");
                    e = e.replace(query, "<span class='tn-red'>$1</span>");
                    e = e.replace(/(<span>[^<>]*)((<[^>]+>)+)([^<>]*<\/span>)/, "$1</span>$2<span>$4");

                    $(this).find('.tn-entity-details h5').html(e);

                    $(this).show();
                } else if (searchString.length > 0) {
                    $(this).hide();
                }
            });

        }, 200);
    },

    loadTrailer: function (el) {
        var $el = $(el);
        if ($el.data('trailer') !== undefined) {
            var trailerLink = "//www.youtube.com/watch?v=" + $el.data('trailer');

            $.magnificPopup.open({
                disableOn: 700,
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false,
                items: {
                    src: trailerLink,
                    type: 'iframe'
                }
            });
        }
    },

    parkingChange: function () {
        if ($("#chkparking").is(":checked")) {
            $("#ddlParking").prop('disabled', false);
        } else {
            $('#ddlParking option[value=1]').attr('selected', 'selected');
            $("#ddlParking").prop('disabled', 'disabled');
        }

        CommonCalls.updateOrderTotal();
    },

    updateOrderTotal: function () {

        var grdtothtml = parseFloat(0),
            amt = parseFloat($("#hdnGAmt").val());

        if ($("#chkdonation").is(":checked"))
            grdtothtml = amt;
        else {
            if ($("#chkdonationAmt").text() == "")
                grdtothtml = amt;
            else
                grdtothtml = amt - parseFloat($("#chkdonationAmt").text());

        }

        if ($("#chkparking").is(":checked"))
            grdtothtml += (parseFloat($("#ddlParking").data('rate')) * parseFloat($("#ddlParking option:selected").val()));

        $("#spnGtot").html((grdtothtml).toFixed(2));
    },

    PreBookingdoPay: function () {

        var $terms = $("input[name='accept_terms']:checked");
        var $sel = $("[aria-hidden='false'], .tn-last-offer-pg-area").find(".tn-radio-button-block input[type='radio']:checked");
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find(".tn-select-bank option:selected");
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find("#citrusgid");
        if ($sel.length == 0)
            $sel = $("[aria-hidden='false']").find("#txteEmail");

        if ($terms.length == 0) {
            TKTNEW.Misc.alert({
                message: 'To do payment, please accept the terms and conditions',
                buttons: {
                    cancel: {
                        text: 'Ok',
                        btnClass: 'tn-green'
                    }
                }
            });
            return
        }

        _Preproceed();


        function _Preproceed() {

            if ($sel.length > 0 && $sel.data('pggrid') !== undefined) {
                if ($sel.data('pggrid') == 3) {
                    document.getElementById('HdPaymentId').value = $sel.data('pggrid');

                    document.getElementById("hdnbankName").value = $sel.data('pgname');
                    document.getElementById("hdnpgid").value = $sel.data('pgid');//param3;
                    document.getElementById("hdnbank").value = $sel.data('pgcode');//param1;

                    var altLink = $("a[bnkcode='" + $sel.data('pgcode') + "']");
                    document.getElementById("Althdnpgid").value = $sel.data('apgid');
                    document.getElementById("Althdnbank").value = $sel.data('apgcode');

                    if (document.getElementById("hdnbankName").value == "" ||
                        document.getElementById("hdnpgid").value == "" ||
                        document.getElementById("hdnbank").value == "") {
                        TKTNEW.Misc.alert({
                            message: 'Please select a bank',
                            buttons: {
                                ok: {
                                    text: 'Ok',
                                    btnClass: 'tn-green'
                                }
                            }
                        });
                        return false;
                    }
                }
                else if ($sel.data('pggrid') == 17) {
                    var Transid = document.getElementById("hdntransid").value;
                    var offerallowedepgs = document.getElementById("hdnOfferAllowedpgs").value;
                    var offercode = document.getElementById("hdnoffercode").value;


                    TKTNEW.Misc.loader(true);

                    try {
                        TKTNEW.Misc.ajax({
                            type: 'POST',
                            datatype: 'json',
                            contenttype: "json",
                            url: "calls/setPreBookingPaymentLog",
                            accept: 'application/json; charset=utf-8',
                            data: "{'TransId':'" + Transid + "','bankName':'citrusjs','pgid':'" + 17 + "'}",
                            success: function (result) {
                            }
                        });
                    } catch (e) {

                    }
                    TKTNEW.Misc.ajax({
                        type: 'POST',
                        datatype: 'json',
                        contenttype: 'string',
                        url: "calls/GetPreBookingCitrusPayDetails",
                        accept: 'application/json; charset=utf-8',
                        data: "{'TransId':'" + Transid + "','Offerallowedepgs':'" + offerallowedepgs + "','Offercode':'" + offercode + "'}",

                        success: function (result) {

                            var Transdetail = eval("(" + result.d + ")");
                            var Len = Transdetail.PGCitrusDTOItems.length;

                            $('#citrusFirstName').val(Transdetail.PGCitrusDTOItems[0].citrusFirstName);

                            $('#citrusLastName').val(Transdetail.PGCitrusDTOItems[0].citrusLastName);
                            $('#citrusEmail').val(Transdetail.PGCitrusDTOItems[0].citrususerid);
                            $('#citrusAmount').val(Transdetail.PGCitrusDTOItems[0].citrusAmount);
                            $('#citrusMobile').val("9999999999");
                            $('#citrusMerchantTxnId').val(Transdetail.PGCitrusDTOItems[0].citrusMerchantTxnId);
                            $('#citrusSignature').val(Transdetail.PGCitrusDTOItems[0].citrusSignature);
                            $('#citrusReturnUrl').val(Transdetail.PGCitrusDTOItems[0].citrusReturnUrl);
                            $('#citrusNotifyUrl').val(Transdetail.PGCitrusDTOItems[0].citrusNotifyUrl);

                            $('#citrusRuleName').val(Transdetail.PGCitrusDTOItems[0].citrusRuleName);
                            $('#citrusAlteredAmount').val(Transdetail.PGCitrusDTOItems[0].citrusAlteredAmount);
                            $('#citrusDpSignature').val(Transdetail.PGCitrusDTOItems[0].citrusDpSignature);
                            //$('#citrusOfferToken').val(Transdetail.PGCitrusDTOItems[0].citrusOfferToken);


                            TKTNEW.Misc.loader(false);

                            citrusmakePayment();

                        }, error: function (xhr, ajaxOptions, thrownError) {
                            TKTNEW.Misc.loader(false);
                            TKTNEW.Misc.alert({
                                message: 'Unable to retrive the information. Please try after sometime.',
                                buttons: {
                                    ok: {
                                        text: 'Ok',
                                        btnClass: 'tn-green',
                                        action: function () {
                                            window.location.href = location.href;
                                        }
                                    }
                                }
                            });
                        }
                    });

                    return;

                }


                else {
                    document.getElementById('HdPaymentId').value = $sel.data('pgid');
                    document.getElementById("hdnbankName").value == "PG";
                }
                if ($sel.data('pggrid') == 16) {

                    var topPos = (window.innerHeight / 2) - ($('#timer').width() / 2);
                    var leftPos = (window.innerWidth / 2) - ($('#timer').width() / 2);

                    $('.upiContainer').css({
                        top: topPos,
                        left: leftPos,
                        position: 'relative'
                    });

                    $('#upiProgress').show();

                    $('#timer').pietimer({
                        timerSeconds: 305,
                        color: '#234',
                        fill: false,
                        showPercentage: true,
                        callback: function () {
                            $('#timer').pietimer('reset');
                        }
                    });

                    __doPostBack("MakePayment", "");
                } else if ($sel.data('pggrid') != 4) {
                    AjaxCalls.setLoader(true);
                    __doPostBack("MakePayment", "");
                }

            } else {
                TKTNEW.Misc.alert({
                    message: 'Please select a bank',
                    buttons: {
                        ok: {
                            text: 'Ok',
                            btnClass: 'tn-green'
                        }
                    }
                });
                return false;
            }
        }
    }

};

