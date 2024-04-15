"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionReportsApp = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var plus_1 = require("gd-sprest-bs/build/icons/svgs/plus");
var arrowClockwise_1 = require("gd-sprest-bs/build/icons/svgs/arrowClockwise");
var trash3_1 = require("gd-sprest-bs/build/icons/svgs/trash3");
var pencilSquare_1 = require("gd-sprest-bs/build/icons/svgs/pencilSquare");
var checkCircleFill_1 = require("gd-sprest-bs/build/icons/svgs/checkCircleFill");
var dashCircleFill_1 = require("gd-sprest-bs/build/icons/svgs/dashCircleFill");
var exclamationCircleFill_1 = require("gd-sprest-bs/build/icons/svgs/exclamationCircleFill");
var jQuery = require("jquery");
var moment = require("moment");
var ds_1 = require("./ds");
var ds_2 = require("../E3StatusReport/ds");
var form_1 = require("./form");
var security_1 = require("../security");
var strings_1 = require("../strings");
require("./styles.scss");
/**
 * Program Inspection Reports Application (Subweb)
 */
var InspectionReportsApp = /** @class */ (function () {
    // Constructor
    function InspectionReportsApp() {
        var _this = this;
        this._approvalFilter = null;
        this._endOfDayFilter = null;
        this._inspectorStatusFilter = null;
        this._dashboard = null;
        // Show the loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading the Data");
        dattatable_1.LoadingDialog.setBody("This will close after the data is loaded...");
        dattatable_1.LoadingDialog.show();
        // Load the inspection report data
        ds_1.DataSource.init().then(function () {
            // Load the ISR data for the lookups
            ds_2.DataSource.init().then(function () {
                // Hide the dialog
                dattatable_1.LoadingDialog.hide();
                // Render the dashboard
                _this.render();
            });
        });
    }
    // Renders the modal
    InspectionReportsApp.prototype.render = function () {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the properties
        dattatable_1.Modal.setType(gd_sprest_bs_1.Components.ModalTypes.Full);
        dattatable_1.Modal.setScrollable(true);
        // Set the header
        dattatable_1.Modal.setHeader("".concat(gd_sprest_bs_1.ContextInfo.webTitle, " Individual Program Inspection Reports"));
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
    InspectionReportsApp.prototype.renderDashboard = function (el) {
        var _this = this;
        // Generate the columns
        var columns = this.generateColumns();
        // Hide the dialog
        dattatable_1.LoadingDialog.hide();
        // Create the dashboard
        this._dashboard = new dattatable_1.Dashboard({
            el: el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: "Inspection Reports",
            },
            subNavigation: {
                items: [
                    {
                        className: "ms-2 btn-outline-primary",
                        text: "New Worksheet",
                        isDisabled: security_1.Security.IsInspector ? false : true,
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: plus_1.plus,
                        isButton: true,
                        onClick: function () {
                            // Show the item form
                            form_1.InspectionWorksheetForms.create(function () {
                                // Refresh the dashboard
                                _this.refresh();
                            });
                        }
                    }
                ],
                itemsEnd: [
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
                items: this.generateFilters()
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
                rows: security_1.Security.IsInspector ? ds_1.DataSource.Items : ds_1.DataSource.ApprovedItems,
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
                        emptyTable: "No worksheets exist for this command."
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
                    // See if inspector status filter is set
                    if (_this._inspectorStatusFilter) {
                        // Apply the filter
                        _this._dashboard.filter(8, _this._inspectorStatusFilter);
                    }
                    // See if approval filter is set
                    if (_this._approvalFilter) {
                        // Apply the filter
                        _this._dashboard.filter(9, _this._approvalFilter);
                    }
                    // See if end of day filter is set
                    if (_this._endOfDayFilter) {
                        // Apply the filter
                        _this._dashboard.filter(10, _this._endOfDayFilter);
                    }
                }
            },
            onRendered: function (el) {
                // Default the filter
                _this._dashboard.setFilterValue("Filter by Approval Status", "Approved");
            }
        });
    };
    // Generates the filters
    InspectionReportsApp.prototype.generateFilters = function () {
        var _this = this;
        // Set the filters ONLY for inspectors
        var items = [
            {
                header: "Filter by Inspector Status",
                items: [
                    {
                        label: "Working",
                        type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                    },
                    {
                        label: "Complete",
                        type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                    }
                ],
                onFilter: function (item) {
                    // Set the filter
                    _this._inspectorStatusFilter = item || "";
                    // Apply the filter
                    _this._dashboard.filter(8, _this._inspectorStatusFilter);
                }
            },
            {
                header: "Filter by Approval Status",
                items: [
                    {
                        label: "Approved",
                        type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                    },
                    {
                        label: "Pending",
                        type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                    }
                ],
                onFilter: function (item) {
                    // See if an item is selected
                    if (item) {
                        // Set the filter
                        _this._approvalFilter = item == "Approved" ? "Yes" : "No";
                    }
                    else {
                        // Set the filter
                        _this._approvalFilter = "";
                    }
                    // Apply the filter
                    _this._dashboard.filter(9, _this._approvalFilter);
                }
            },
            {
                header: "Filter by End Of Day",
                items: [
                    {
                        label: "Yes",
                        type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch,
                        isDisabled: security_1.Security.IsInspector ? false : true
                    },
                    {
                        label: "No",
                        type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch,
                        isDisabled: security_1.Security.IsInspector ? false : true
                    }
                ],
                onFilter: function (item) {
                    // Set the filter
                    _this._endOfDayFilter = item || "";
                    // Apply the filter
                    _this._dashboard.filter(10, _this._endOfDayFilter);
                }
            }
        ];
        return items;
    };
    // Generates the columns
    InspectionReportsApp.prototype.generateColumns = function () {
        var _this = this;
        // Set the default columns
        var columns = [
            {
                //name: "edit",
                name: "",
                title: "Edit",
                onRenderCell: function (el, col, item) {
                    // render a button group
                    gd_sprest_bs_1.Components.ButtonGroup({
                        el: el,
                        isSmall: true,
                        buttons: [
                            {
                                text: "",
                                title: "Click to edit this record",
                                iconSize: 16,
                                iconType: pencilSquare_1.pencilSquare,
                                type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                                onClick: function () {
                                    // See if the item is approved and not the admin
                                    if (item.approval == "Approved" && !security_1.Security.IsAdmin) {
                                        // Display the view form
                                        form_1.InspectionWorksheetForms.view(item.Id);
                                    }
                                    else {
                                        // Display the edit form
                                        form_1.InspectionWorksheetForms.edit(item, function () {
                                            // Refresh the datatable
                                            _this.refresh();
                                        });
                                    }
                                }
                            },
                            {
                                text: "",
                                isDisabled: security_1.Security.IsAdmin ? false : true,
                                title: "Click to delete this record",
                                className: "ms-1",
                                iconSize: 16,
                                iconType: trash3_1.trash3,
                                type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                                onClick: function () {
                                    // Display delete form
                                    form_1.InspectionWorksheetForms.delete(item, function () {
                                        // Refresh the dashboard
                                        _this.refresh();
                                    });
                                }
                            },
                        ]
                    });
                }
            },
            {
                name: "Title",
                title: "Program"
            },
            {
                name: "compliance",
                title: "Compliance",
                onRenderCell: function (el, col, item) {
                    // Render the indicator
                    _this.renderIndicator(el, item[col.name]);
                }
            },
            {
                name: "effectiveness",
                title: "Effectiveness",
                onRenderCell: function (el, col, item) {
                    // Render the indicator
                    _this.renderIndicator(el, item[col.name]);
                }
            },
            {
                name: "risk",
                title: "Risk",
                onRenderCell: function (el, col, item) {
                    // Render the indicator
                    _this.renderIndicator(el, item[col.name]);
                }
            },
            {
                name: "selfAssessment",
                title: "Self-Assessment",
                onRenderCell: function (el, col, item) {
                    // Render the indicator
                    _this.renderIndicator(el, item[col.name]);
                }
            },
            {
                name: "bestPractices",
                title: "Best Practices"
            },
            {
                name: "inspectorNotes",
                title: "Concerns"
            },
            {
                name: "inspectorStatus",
                title: "Inspector Status"
            },
            {
                name: "approval",
                title: "Approval",
                onRenderCell: function (el, column, item) {
                    // Set the filter/sort values
                    el.setAttribute("data-filter", item.approval == "Approved" ? "Yes" : "No");
                    el.setAttribute("data-sort", item.approval == "Approved" ? "1" : "0");
                }
            }
        ];
        // See if this is the inspector
        if (security_1.Security.IsInspector) {
            // Add the columns
            columns.push({
                name: "endOfDay",
                title: "End of Day",
                onRenderCell: function (el, column, item) {
                    // Set the filter/sort values
                    el.setAttribute("data-filter", item.endOfDay == "Yes" ? "Yes" : "No");
                    el.setAttribute("data-sort", item.endOfDay == "Yes" ? "1" : "0");
                }
            });
            columns.push({
                name: "",
                title: "Inspector",
                onRenderCell: function (el, column, item) {
                    el.innerHTML = item.inpsectorName.Title ? item.inpsectorName.Title : "";
                },
            });
            columns.push({
                name: "Modified",
                title: "Modified",
                onRenderCell: function (el, column, item) {
                    // Format the date
                    el.innerHTML = item.Modified ? moment(item.Modified).format("MM/DD/yyyy") : "";
                }
            });
        }
        // Return the columns
        return columns;
    };
    // Refreshes the dashboard
    InspectionReportsApp.prototype.refresh = function () {
        var _this = this;
        // Refresh the data
        ds_1.DataSource.refresh().then(function () {
            // Refresh the dashboard
            _this._dashboard.refresh(ds_1.DataSource.Items);
        });
    };
    // Renders the indicator
    InspectionReportsApp.prototype.renderIndicator = function (el, value) {
        if (value === void 0) { value = ""; }
        var icon = null;
        // Set the filter value
        el.setAttribute("data-filter", value);
        // Render the icon based on the value
        switch (value) {
            // Success
            case "Green":
                // Render the icon
                icon = (0, checkCircleFill_1.checkCircleFill)(16);
                icon.classList.add("text-success");
                el.innerHTML = icon.outerHTML;
                // Set the sort value
                el.setAttribute("data-sort", "0");
                break;
            // Error
            case "Red":
                // Render the icon
                icon = (0, exclamationCircleFill_1.exclamationCircleFill)(16);
                icon.classList.add("text-danger");
                el.innerHTML = icon.outerHTML;
                // Set the sort value
                el.setAttribute("data-sort", "2");
                break;
            // Warning
            case "Yellow":
                // Render the icon
                icon = (0, dashCircleFill_1.dashCircleFill)(16);
                icon.classList.add("text-warning");
                el.innerHTML = icon.outerHTML;
                // Set the sort value
                el.setAttribute("data-sort", "1");
                break;
        }
    };
    return InspectionReportsApp;
}());
exports.InspectionReportsApp = InspectionReportsApp;
