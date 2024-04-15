/*
    N01IG - Permission Utility
    Use to check if a user is in the owners group
    Developer:  Mike Landino, USFF N611
    Version: 1.0
    Date: 8/9/2021
*/

var site = "",
    currentUser = "",
    ownerGroupId = "",
    msg = "<h1>You do not have permission to view or modify this list from this view.</h1><br/<br/>" +
        "<h2>You must use the <a href='../../SitePages/Self%20Assessment.aspx'>Self Assessment page</a> or contact the <a href='../../_layouts/15/people.aspx?MembershipGroupId=69117'>USFF IG Admins</a> to grant you elevated permissions.</h2>";

function getOwnersGroup(){
    site = _spPageContextInfo.webAbsoluteUrl;
    currentUser = _spPageContextInfo.userId;
    //gets the associated site owner group dynamically
    $.ajax({
        url: site + "/_api/Web/AssociatedOwnerGroup?$select=Id",
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" }
    }).done(function(data) {
        ownerGroupId = data.d.Id;
    }).fail(function (error) {
        console.log(JSON.stringify(error));
        alert(JSON.stringify(error));
    });
}

function isMemberOf(ownerGroupId) {
    var hasPermission = false;
    var endpoint = site + "/_api/Web/SiteGroups/GetById(" + ownerGroupId + ")/Users";
    $.ajax({
        url: endpoint,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
    }).done(function (data) {
        $.each(data.d.results, function(i,val){
            if(val.Id === currentUser) 
            hasPermission = true;
        }); 
    }).then(changeDom(hasPermission)
    ).fail(function (error) {
        console.log(JSON.stringify(error));
        alert(JSON.stringify(error));
    });
}

function changeDom(hasPermission){
    if(hasPermission){
        console.log("has permission!");
    } else { 
        //does not exist in group, therefore hide the web part
        $('#MSOZoneCell_WebPartWPQ2').hide();
        $('#msg-container').html(msg); 
    }
};