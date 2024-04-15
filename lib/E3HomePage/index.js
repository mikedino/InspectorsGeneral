"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.E3HomePage = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var moment = require("moment");
var pencilSquare_1 = require("gd-sprest-bs/build/icons/svgs/pencilSquare");
var trash3_1 = require("gd-sprest-bs/build/icons/svgs/trash3");
var E3InspectionReports_1 = require("../E3InspectionReports");
var E3SelfAssessment_1 = require("../E3SelfAssessment");
var E3StatusReport_1 = require("../E3StatusReport");
var ds_1 = require("../E3Schedule/ds");
var form_1 = require("../E3Schedule/form");
var template_html_1 = require("./template.html");
require("./styles.scss");
/**
 * Echelon III Home Page
 */
var E3HomePage = /** @class */ (function () {
    // constructor
    function E3HomePage(el) {
        var _this = this;
        this._el = null;
        this._schedule = null;
        this._el = el;
        // Load the schedule data
        ds_1.DataSource.init().then(function () {
            // Render the dashboard
            _this.render();
        });
    }
    E3HomePage.prototype.render = function () {
        // render html template
        this._el.innerHTML = template_html_1.default;
        // render header
        this.renderHeader();
        // render links
        this.renderLinks();
        // render cards
        this.getOrgChart();
        // render inspection schedule
        this.renderSchedule();
        // Configure the events
        this.configureEvents();
    };
    // Sets the click events for the page
    E3HomePage.prototype.configureEvents = function () {
        // Set the inspection results click event
        var el = this._el.querySelector("#inspectionResults .clickBox");
        if (el) {
            // Set the click event
            el.addEventListener("click", function (ev) {
                // Display the inspection reports
                new E3InspectionReports_1.InspectionReportsApp();
            });
        }
        // Set the self assessment click event
        el = this._el.querySelector("#selfAssessment .clickBox");
        if (el) {
            // Set the click event
            el.addEventListener("click", function (ev) {
                // Display the self assessments
                new E3SelfAssessment_1.SelfAssessmentApp();
            });
        }
        // Set the ISR click event
        el = this._el.querySelector("#isr .clickBox");
        if (el) {
            // Set the click event
            el.addEventListener("click", function (ev) {
                // Display the ISR's
                new E3StatusReport_1.ISRApp();
            });
        }
    };
    E3HomePage.prototype.renderLinks = function () {
        // set the Org Chart click event
        var el = this._el.querySelector("#orgChartLink");
        if (el) {
            el.addEventListener("click", function () {
                // Open in a new tab
                window.open(gd_sprest_bs_1.ContextInfo.webAbsoluteUrl + "/OrgChart");
            });
        }
        // set the Program Identification click event
        el = this._el.querySelector("#programIdLink");
        if (el) {
            el.addEventListener("click", function () {
                // Open in a new tab
                window.open(gd_sprest_bs_1.ContextInfo.webAbsoluteUrl + "/Lists/CIProgramIdentification");
            });
        }
        // set the Shared Documents click event
        el = this._el.querySelector("#documentSharingLink");
        if (el) {
            el.addEventListener("click", function () {
                // Open in a new tab
                window.open(gd_sprest_bs_1.ContextInfo.webAbsoluteUrl + "/Shared%20Documents");
            });
        }
        // set the Schedule click event
        el = this._el.querySelector("#scheduleLink");
        if (el) {
            el.addEventListener("click", function () {
                // Open in a new tab
                window.open(gd_sprest_bs_1.ContextInfo.webAbsoluteUrl + "/Lists/InspectionSchedule");
            });
        }
    };
    // render the header portion
    E3HomePage.prototype.renderHeader = function () {
        var elArr = document.querySelectorAll(".siteTitle");
        elArr.forEach(function (element) {
            element.innerHTML = gd_sprest_bs_1.ContextInfo.webTitle;
        });
    };
    // find Org Chart link
    E3HomePage.prototype.getOrgChart = function () {
        var el = document.querySelector("#orgChartContent");
        //get org chart list items - last updated
        (0, gd_sprest_bs_1.Web)().Lists("OrgChart").RootFolder().Files().query({ Top: 1 }).execute(function (files) {
            // if org chart exists, append link
            if (files.results.length > 0) {
                var link = document.createElement("a");
                el.appendChild(link);
                link.href = files.results[0].ServerRelativeUrl;
                link.innerHTML = "View Org Chart";
            }
            else
                el.innerHTML = "Org Chart not posted";
        }, function () {
            // error 
            console.error("[E3HomePage] Error retrieving Org Chart.");
        });
    };
    // render the footer portion
    E3HomePage.prototype.renderSchedule = function () {
        var _this = this;
        var el = this._el.querySelector("#scheduleContent");
        var elNew = this._el.querySelector("#scheduleNewItem");
        while (el.firstElementChild) {
            el.removeChild(el.firstElementChild);
        }
        gd_sprest_bs_1.Components.Card({
            el: el,
            className: "px-5 border-light",
            body: [{
                    onRender: function (el) {
                        _this._schedule = gd_sprest_bs_1.Components.Table({
                            el: el,
                            rows: ds_1.DataSource.Items ? ds_1.DataSource.Items : [{ "Title": "There are no events to display" }],
                            columns: [
                                {
                                    //name: "edit",
                                    name: "",
                                    title: "",
                                    onRenderCell: function (el, col, item) {
                                        // render a button group
                                        gd_sprest_bs_1.Components.ButtonGroup({
                                            el: el,
                                            isSmall: true,
                                            buttons: [
                                                {
                                                    text: "",
                                                    title: "Click to edit this record",
                                                    iconSize: 14,
                                                    iconType: pencilSquare_1.pencilSquare,
                                                    type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                                                    onClick: function () {
                                                        // Display the edit form
                                                        form_1.InspectionScheduleForms.edit(item, function () {
                                                            // Refresh the datatable
                                                            _this.refreshSchedule();
                                                        });
                                                    }
                                                },
                                                {
                                                    text: "",
                                                    title: "Click to delete this record",
                                                    className: "ms-1",
                                                    iconSize: 14,
                                                    iconType: trash3_1.trash3,
                                                    type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                                                    onClick: function () {
                                                        // Delete the item
                                                        form_1.InspectionScheduleForms.delete(item, function () {
                                                            // Refresh the schedule datasource
                                                            _this.refreshSchedule();
                                                        });
                                                    }
                                                },
                                            ]
                                        });
                                    }
                                },
                                {
                                    name: "Title",
                                    title: "Event Name",
                                    className: "pointer",
                                    onClickCell: function (el, col, item) {
                                        // view the event
                                        form_1.InspectionScheduleForms.view(item.Id);
                                    },
                                },
                                {
                                    name: "",
                                    title: "Start Date",
                                    className: "text-center",
                                    onRenderHeader: function (el, col) {
                                        el.className = "text-center";
                                    },
                                    onRenderCell: function (el, col, item) {
                                        el.innerHTML = moment(item.EventDate).format("MM/DD/yyyy hh:mm");
                                    }
                                },
                                {
                                    name: "",
                                    title: "End Date",
                                    className: "text-center",
                                    onRenderHeader: function (el) {
                                        el.className = "text-center";
                                    },
                                    onRenderCell: function (el, col, item) {
                                        el.innerHTML = moment(item.EndDate).format("MM/DD/yyyy hh:mm");
                                    }
                                }
                            ]
                        });
                    }
                }],
            footer: {
                onRender: function (el) {
                    gd_sprest_bs_1.Components.Tooltip({
                        el: el,
                        content: "Click to create a new event.",
                        placement: 1,
                        btnProps: {
                            text: "New Event",
                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                            isSmall: true,
                            onClick: function () {
                                // Show the item form
                                form_1.InspectionScheduleForms.create(function () {
                                    // Refresh the dashboard
                                    _this.refreshSchedule();
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    // Refreshes the schedule
    E3HomePage.prototype.refreshSchedule = function () {
        var _this = this;
        // Refresh the data
        ds_1.DataSource.init().then(function () {
            // Refresh (regenerate) the table
            _this.renderSchedule();
        });
    };
    return E3HomePage;
}());
exports.E3HomePage = E3HomePage;
