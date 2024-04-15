"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionHomePage = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var jQuery = require("jquery");
var template_html_1 = require("./template.html");
var ds_1 = require("./ds");
require("./styles.scss");
/**
 * Command Inspections Home Page
 */
var InspectionHomePage = /** @class */ (function () {
    // constructor
    function InspectionHomePage(el) {
        this._el = null;
        this._el = el;
        // Render the dashboard
        this.render();
    }
    InspectionHomePage.prototype.render = function () {
        // render html template
        this._el.innerHTML = template_html_1.default;
        // render header
        this.renderHeader();
        // render icon links
        this.renderIconLinks();
        // render contacts
        this.renderContacts();
        // render command sites
        this.renderE3Sites();
    };
    // render the header portion
    InspectionHomePage.prototype.renderHeader = function () {
        var elArr = document.querySelectorAll(".siteTitle");
        elArr.forEach(function (element) {
            element.innerHTML = gd_sprest_bs_1.ContextInfo.webTitle;
        });
    };
    // render the links for each icon
    InspectionHomePage.prototype.renderIconLinks = function () {
        var links = ds_1.DataSource.Links;
        if (links.length > 0) {
            // if there is a link, loop thru and format
            jQuery.each(links, function (i, item) {
                // remove spaces from title in order to get the element ID
                var title = item.Title.split(" ").join("");
                // find element and set onclick for items with a url defined
                if (item.url) {
                    jQuery("#".concat(title, " .icon")).attr("onclick", "window.open('".concat(item.url, "');"));
                }
            });
        }
    };
    // render the contacts portion
    InspectionHomePage.prototype.renderContacts = function () {
        var el = this._el.querySelector("#USFFIGContactsContent");
        var items = ds_1.DataSource.ContactItems;
        if (items.length > 0) {
            // if there is a contact, loop thru and format
            jQuery.each(items, function (i, item) {
                var elem = document.createElement('p');
                elem.innerHTML = "<span class=\"contact-title\">".concat(item.Title, "</span><br/><a href=\"mailto:").concat(item.inspector.EMail, "\">").concat(item.inspector.Title, "</a>, ").concat(item.inspector.WorkPhone ? item.inspector.WorkPhone : 'no phone');
                el.appendChild(elem);
            });
        }
        else
            el.innerHTML = "No contacts exist.  Click the icon to create new contacts.";
    };
    // render the E3 Sites portion
    InspectionHomePage.prototype.renderE3Sites = function () {
        // Get the target element
        var el = this._el.querySelector("#CommandSitesContent");
        var items = ds_1.DataSource.Commands;
        if (items.length > 0) {
            // if there is a command, loop thru and format
            jQuery.each(items, function (i, item) {
                var elem = document.createElement('div');
                // if command is active and has a link
                if (item.active && item.url.Url) {
                    var link = document.createElement("a");
                    link.innerHTML = item.Title;
                    link.href = "#";
                    link.addEventListener("click", function () {
                        // Open in a new tab
                        window.open(item.url.Url, "_blank");
                    });
                    elem.appendChild(link);
                    //elem.innerHTML = `<a href="${item.url.Url}" target="_blank">${item.Title}</a>`;
                }
                else
                    elem.innerHTML = item.Title;
                el.appendChild(elem);
            });
        }
        else
            el.innerHTML = "No commands exist. Open the Master Checklist to mannage commands.";
    };
    return InspectionHomePage;
}());
exports.InspectionHomePage = InspectionHomePage;
