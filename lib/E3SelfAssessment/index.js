"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfAssessmentApp = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var arrowClockwise_1 = require("gd-sprest-bs/build/icons/svgs/arrowClockwise");
var pencilSquare_1 = require("gd-sprest-bs/build/icons/svgs/pencilSquare");
var jQuery = require("jquery");
var moment = require("moment");
var ds_1 = require("./ds");
var ds_2 = require("../E3SelfAssessmentOverview/ds");
var export_1 = require("./export");
var form_1 = require("./form");
var form_2 = require("../E3SelfAssessmentOverview/form");
var security_1 = require("../security");
var strings_1 = require("../strings");
require("./styles.scss");
/**
 * Self-Assessment Application (Subweb)
 */
var SelfAssessmentApp = /** @class */ (function () {
    // Constructor
    function SelfAssessmentApp() {
        var _this = this;
        this._currentFilter = null;
        this._dashboard = null;
        this._selectedProgram = null;
        this._overviewItem = null;
        // Show the loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading the Data");
        dattatable_1.LoadingDialog.setBody("This will close after the data is loaded...");
        dattatable_1.LoadingDialog.show();
        // Load the data
        ds_1.DataSource.init().then(function () {
            // load the self assessment data
            ds_2.DataSource.init().then(function () {
                // Hide the dialog
                dattatable_1.LoadingDialog.hide();
                // Render the dashboard
                _this.render();
            });
        });
    }
    // Selects a program
    SelfAssessmentApp.prototype.selectProgram = function (program) {
        // Set the selected program
        this._selectedProgram = program;
        // Parse the related Self Assessemnt Overview items list and look for a match
        this._overviewItem = ds_2.DataSource.getItemByProgram(program.text);
        // Refresh the datatable
        this.render();
    };
    // Renders the modal
    SelfAssessmentApp.prototype.render = function () {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the properties
        dattatable_1.Modal.setType(gd_sprest_bs_1.Components.ModalTypes.Full);
        // TODO: Note - other FULL modal types not rendering correctly
        // Set the header
        dattatable_1.Modal.setHeader("".concat(gd_sprest_bs_1.ContextInfo.webTitle, " Self Assessment"));
        // Render the body
        this.renderDashboard(dattatable_1.Modal.BodyElement);
        // Set the footer
        gd_sprest_bs_1.Components.TooltipGroup({
            el: dattatable_1.Modal.FooterElement,
            tooltips: [
                {
                    content: "Closes the modal",
                    btnProps: {
                        text: "Close",
                        type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                        onClick: function () {
                            // Close the modal
                            dattatable_1.Modal.hide();
                        }
                    }
                }
            ]
        });
        // Show the modal
        dattatable_1.Modal.show();
    };
    // Renders the dashboard
    SelfAssessmentApp.prototype.renderDashboard = function (el) {
        var _this = this;
        // Parse the program items
        var programItems = ds_1.DataSource.Programs;
        for (var i = 0; i < programItems.length; i++) {
            // Set the click event
            programItems[i].onClick = function (item) {
                // Select the program
                _this.selectProgram(item);
            };
        }
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading Data");
        dattatable_1.LoadingDialog.setBody("Loading the data for the selected program");
        dattatable_1.LoadingDialog.show();
        // Load the checklist data for the selected program (if one is selected)
        var items = this._selectedProgram ? ds_1.DataSource.getItemsByProgram(this._selectedProgram.text) : [];
        // Generate the columns
        var columns = this.generateColumns();
        // Hide the dialog
        dattatable_1.LoadingDialog.hide();
        // Create the dashboard
        var btnOverview = null;
        this._dashboard = new dattatable_1.Dashboard({
            el: el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: "Self Assessment Checklist " + (this._selectedProgram ? " > " + this._selectedProgram.text : ""),
            },
            subNavigation: {
                items: [
                    {
                        className: "btn-outline-dark",
                        text: "Select a Program",
                        isButton: true,
                        items: programItems
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Export Current",
                        isButton: true,
                        isDisabled: this._selectedProgram && items.length > 0 ? false : true,
                        onClick: function () {
                            // Export the data
                            export_1.Export.generateCSV(items);
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Export All",
                        isButton: true,
                        isDisabled: ds_1.DataSource.Items.length > 0 ? false : true,
                        onClick: function () {
                            // Export the data
                            export_1.Export.generateCSV(ds_1.DataSource.Items);
                        }
                    },
                    {
                        className: "btn-overview " + (this._overviewItem ? "ms-2 btn-outline-primary" : "ms-2 btn-primary"),
                        text: this._overviewItem ? "View Self Assessment Overview" : "Create Self Assessment Overview",
                        isButton: true,
                        isDisabled: this._selectedProgram ? false : true,
                        onClick: function () {
                            // open or create the self assessment overview form
                            if (_this._overviewItem) {
                                form_2.SelfAssessmentOverviewForms.view(_this._overviewItem);
                            }
                            else {
                                form_2.SelfAssessmentOverviewForms.create(_this._selectedProgram.text, function () {
                                    // Refresh the dashboard
                                    _this.refresh();
                                });
                            }
                        }
                    }
                ],
                itemsEnd: [
                    {
                        text: "User Role: " + security_1.Security.UserRoleDisplay,
                        className: "btn text-dark",
                        isButton: false
                    },
                    {
                        className: "ms-2 btn-outline-dark",
                        text: "Refresh",
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: arrowClockwise_1.arrowClockwise,
                        isButton: true,
                        onClick: function () {
                            // Refresh the dashboard
                            _this.refresh();
                        }
                    }
                ]
            },
            filters: {
                items: [
                    {
                        header: "Filter by Applicability",
                        items: [
                            {
                                label: "Not Applicable",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Applicable",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: function (item) {
                            // See if an item is selected
                            if (item) {
                                // Set the filter
                                _this._currentFilter = item == "Not Applicable" ? "Yes" : "No";
                                // Apply the filter
                                _this._dashboard.filter(7, _this._currentFilter);
                            }
                            else {
                                // Set the filter
                                _this._currentFilter = "";
                                // Clear the filter
                                _this._dashboard.filter(7, "");
                            }
                        }
                    }
                ]
            },
            footer: {
                itemsEnd: [
                    {
                        text: "v" + strings_1.default.Version
                    }
                ]
            },
            table: {
                columns: columns,
                rows: items,
                dtProps: {
                    dom: 'rt<"row"<"col-sm-4"l><"col-sm-4"i><"col-sm-4"p>>',
                    pageLength: 100,
                    // Note - If you change the columns you will need to update this
                    columnDefs: [
                        {
                            "targets": 0,
                            "orderable": false,
                            "searchable": false
                        }
                    ],
                    language: {
                        emptyTable: this._selectedProgram ? "No questions exist for this program." : "Please select a program."
                    },
                    createdRow: function (row, data, index) {
                        jQuery('td', row).addClass('align-middle');
                    },
                    drawCallback: function (settings) {
                        var api = new jQuery.fn.dataTable.Api(settings);
                        jQuery(api.context[0].nTable).removeClass('no-footer');
                        jQuery(api.context[0].nTable).addClass('tbl-footer');
                        jQuery(api.context[0].nTable).addClass('table-striped');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_info').addClass('text-center');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_length').addClass('pt-2');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_paginate').addClass('pt-03');
                    },
                    headerCallback: function (thead, data, start, end, display) {
                        jQuery('th', thead).addClass('align-middle');
                    },
                    // Order by the 1st column by default; ascending
                    order: [[0, "asc"]]
                },
                onRendered: function (el, dt) {
                    // See if a filter is set
                    if (_this._currentFilter) {
                        // Apply the filter
                        _this._dashboard.filter(7, _this._currentFilter);
                    }
                }
            }
        });
    };
    // Generates the columns
    SelfAssessmentApp.prototype.generateColumns = function () {
        var _this = this;
        // Set the default columns
        var columns = [
            {
                name: "ActionButtons",
                title: "",
                isHidden: true,
                onRenderCell: function (el, column, item) {
                    gd_sprest_bs_1.Components.ButtonGroup({
                        el: el,
                        isSmall: false,
                        buttons: [
                            {
                                text: "",
                                title: "Click to edit this record",
                                iconSize: 20,
                                iconType: pencilSquare_1.pencilSquare,
                                type: gd_sprest_bs_1.Components.ButtonTypes.Primary,
                                onClick: function () {
                                    // Edit the item
                                    form_1.E3SelfAssessmentForms.edit(item, function () {
                                        // Refresh the dashboard
                                        _this.refresh();
                                    });
                                }
                            }
                        ]
                    });
                }
            },
            {
                name: "QuestionNumber",
                title: "No."
            },
            {
                name: "Question",
                title: "Question"
            },
            {
                name: "ResponseChoice",
                title: "ResponseChoice"
            },
            {
                name: "Response",
                title: "Response Text"
            },
            {
                name: "Reference",
                title: "Reference"
            },
            {
                name: "ReferenceDate",
                title: "Reference Date",
                onRenderCell: function (el, column, item) {
                    // Format the date
                    el.innerHTML = item.ReferenceDate ? moment(item.ReferenceDate).format("MM/DD/yyyy") : "";
                }
            },
            {
                name: "ReferenceData",
                title: "Reference Data"
            }
        ];
        // See if this is the inspector
        if (security_1.Security.IsInspector) {
            // Add the NA column
            columns.push({
                name: "",
                title: "N/A",
                onRenderCell: function (el, column, item) {
                    // render as checkbox
                    gd_sprest_bs_1.Components.CheckboxGroup({
                        el: el,
                        items: [{
                                label: "",
                                isSelected: item.na,
                                onChange: function (val) {
                                    item.update({
                                        na: val ? true : false
                                    }).execute();
                                }
                            }]
                    });
                    // Set the filter/sort values
                    el.setAttribute("data-filter", item.na ? "Yes" : "No");
                    el.setAttribute("data-sort", item.na ? "Yes" : "No");
                }
            });
            // Add the Recommendation column
            columns.push({
                name: "",
                title: "Recommendation?",
                onRenderCell: function (el, column, item) {
                    // render as checkbox
                    gd_sprest_bs_1.Components.CheckboxGroup({
                        el: el,
                        items: [{
                                label: "",
                                isSelected: item.IsRecommendation,
                                onChange: function (val) {
                                    item.update({
                                        IsRecommendation: val ? true : false
                                    }).execute();
                                }
                            }]
                    });
                }
            });
            // Add the Deficiency column
            columns.push({
                name: "",
                title: "Deficiency?",
                onRenderCell: function (el, column, item) {
                    // render as checkbox
                    gd_sprest_bs_1.Components.CheckboxGroup({
                        el: el,
                        items: [{
                                label: "",
                                isSelected: item.IsDeficiency,
                                onChange: function (val) {
                                    item.update({
                                        IsDeficiency: val ? true : false
                                    }).execute();
                                }
                            }]
                    });
                }
            });
            // Add the inspector comments
            columns.push({
                name: "InspectorComments",
                title: "Inspector Comments"
            });
        }
        // Return the columns
        return columns;
    };
    // Refreshes the dashboard
    SelfAssessmentApp.prototype.refresh = function () {
        var _this = this;
        // Refresh the self assessment data
        ds_1.DataSource.refresh().then(function () {
            // Then refresh the SA Overview data
            ds_2.DataSource.refresh().then(function () {
                // Then parse the related Self Assessemnt Overview items list again and look for a match
                _this._overviewItem = ds_2.DataSource.getItemByProgram(_this._selectedProgram.text);
                // Get the overview button and see if we need to update it
                var elButton = dattatable_1.Modal.BodyElement.querySelector(".btn-overview");
                if (elButton && elButton.classList.contains("btn-primary")) {
                    // Set the text
                    elButton.innerHTML = "View Self Assessment Overview";
                    // Update the class
                    elButton.classList.remove("btn-primary");
                    elButton.classList.add("btn-outline-primary");
                }
                // Then finaly refresh the dashboard
                _this._dashboard.refresh(_this._selectedProgram ? ds_1.DataSource.getItemsByProgram(_this._selectedProgram.text) : []);
            });
        });
    };
    return SelfAssessmentApp;
}());
exports.SelfAssessmentApp = SelfAssessmentApp;
