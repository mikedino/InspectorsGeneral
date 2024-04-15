"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISRApp = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var arrowClockwise_1 = require("gd-sprest-bs/build/icons/svgs/arrowClockwise");
var pencilSquare_1 = require("gd-sprest-bs/build/icons/svgs/pencilSquare");
var jQuery = require("jquery");
var moment = require("moment");
var ds_1 = require("./ds");
var form_1 = require("./form");
var strings_1 = require("../strings");
require("./styles.scss");
/**
 * Implementation Status Report (ISR) Application (Subweb)
 */
var ISRApp = /** @class */ (function () {
    // Constructor
    function ISRApp() {
        var _this = this;
        this._statusFilter = null;
        this._reportedStatusFilter = null;
        this._dashboard = null;
        // Show the loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading the Data");
        dattatable_1.LoadingDialog.setBody("This will close after the data is loaded...");
        dattatable_1.LoadingDialog.show();
        // Load the ISR data
        ds_1.DataSource.init().then(function () {
            dattatable_1.LoadingDialog.hide();
            // Render the dashboard
            _this.render();
        });
    }
    // Renders the modal
    ISRApp.prototype.render = function () {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the properties
        dattatable_1.Modal.setType(gd_sprest_bs_1.Components.ModalTypes.Full);
        dattatable_1.Modal.setScrollable(true);
        // Set the header
        dattatable_1.Modal.setHeader("".concat(gd_sprest_bs_1.ContextInfo.webTitle, " Implementation Status Reports"));
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
    ISRApp.prototype.renderDashboard = function (el) {
        var _this = this;
        // Hide the dialog
        dattatable_1.LoadingDialog.hide();
        // grouped column number and filtered column numbers
        var groupedColumn = 9;
        var statusColumn = 3;
        var reportedStatusColumn = 4;
        // Create the dashboard
        this._dashboard = new dattatable_1.Dashboard({
            el: el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: "Implementation Status Reports (ISR)",
            },
            subNavigation: {
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
                items: [
                    {
                        header: "Filter by Status",
                        items: [
                            {
                                label: "Open",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Closed",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: function (item) {
                            // Set the filter
                            _this._statusFilter = item || "";
                            // Apply the filter
                            _this._dashboard.filter(statusColumn, _this._statusFilter);
                        }
                    },
                    {
                        header: "Filter by Reported Status",
                        items: [
                            {
                                label: "In progress",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Action complete",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: function (item) {
                            // Set the filter
                            _this._reportedStatusFilter = item || "";
                            // Apply the filter
                            _this._dashboard.filter(reportedStatusColumn, _this._reportedStatusFilter);
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
                columns: [
                    {
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
                                            // Display the edit form
                                            form_1.StatusReportForms.edit(item, function () {
                                                // Refresh the datatable
                                                _this.refresh();
                                            });
                                        }
                                    }
                                ]
                            });
                        }
                    },
                    {
                        name: "number",
                        title: "No."
                    },
                    {
                        name: "observation",
                        title: "Observation"
                    },
                    {
                        name: "status",
                        title: "Status",
                        onRenderCell: function (el, column, item) {
                            // Set the filter/sort values
                            el.setAttribute("data-filter", item.status);
                            el.setAttribute("data-sort", item.status);
                        }
                    },
                    {
                        name: "reportedStatus",
                        title: "Reported Status",
                        onRenderCell: function (el, column, item) {
                            // Set the filter/sort values
                            el.setAttribute("data-filter", item.reportedStatus);
                            el.setAttribute("data-sort", item.reportedStatus);
                        }
                    },
                    {
                        name: "ecd",
                        title: "Estimated Completion Date",
                        onRenderCell: function (el, column, item) {
                            // Format the date
                            el.innerHTML = item.ecd ? moment(item.ecd).format("MM/DD/yyyy") : "";
                        }
                    },
                    {
                        name: "",
                        title: "Program/Process",
                        onRenderCell: function (el, column, item) {
                            el.innerHTML = item.reportLU.Title;
                        },
                    },
                    {
                        name: "Modified",
                        title: "Modified",
                        onRenderCell: function (el, column, item) {
                            // Format the date
                            el.innerHTML = item.Modified ? moment(item.Modified).format("MMM D") : "";
                        }
                    },
                    {
                        name: "",
                        title: "Modified By",
                        onRenderCell: function (el, column, item) {
                            el.innerHTML = item.Editor.Title;
                        },
                    },
                    {
                        // grouped column
                        name: "rtype",
                        title: "Type"
                    }
                ],
                rows: ds_1.DataSource.StatusReportItems,
                dtProps: {
                    dom: 'rt<"row"<"col-sm-4"l><"col-sm-4"i><"col-sm-4"p>>',
                    pageLength: 100,
                    // Note - If you change the columns you will need to update this
                    columnDefs: [
                        {
                            "targets": 0,
                            "orderable": false,
                            "searchable": false
                        },
                        {
                            // making the grouped column hidden
                            "targets": groupedColumn,
                            // Setting this to false will set the style:width=0
                            // Using the onRendered method to make this column hidden
                            "visible": true
                        }
                    ],
                    language: {
                        emptyTable: "No ISR's exist for this command."
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
                        // grouping
                        var rows = api.rows({ page: 'current' }).nodes();
                        var last = null;
                        api
                            .column(groupedColumn, { page: 'current' })
                            .data()
                            .each(function (group, i) {
                            if (last !== group) {
                                jQuery(rows)
                                    .eq(i)
                                    // update colspan to total number of columns in the dashboard (minus the hidden column)
                                    .before("<tr class=\"group\"><td colspan=\"".concat(groupedColumn, "\">").concat(group, "</td></tr>"));
                                last = group;
                            }
                        });
                    },
                    headerCallback: function (thead, data, start, end, display) {
                        jQuery('th', thead).addClass('align-middle');
                    },
                    // Order by the grouping column pre/fixed to maintain grouping, then "number" ascending
                    orderFixed: {
                        pre: [groupedColumn, "asc"],
                        post: [1, "asc"]
                    }
                },
                onRendered: function (el, dt) {
                    // See if status filter is set
                    if (_this._statusFilter) {
                        // Apply the filter
                        _this._dashboard.filter(statusColumn, _this._statusFilter);
                    }
                    // See if reported status filter is set
                    if (_this._reportedStatusFilter) {
                        // Apply the filter
                        _this._dashboard.filter(reportedStatusColumn, _this._reportedStatusFilter);
                    }
                    // sorting the group headers
                    jQuery('.dataTable').on('click', 'tr.group', function () {
                        var currentOrder = dt.order()[0];
                        if (currentOrder[0] === groupedColumn && currentOrder[1] === 'asc') {
                            dt.order([groupedColumn, 'desc']).draw();
                        }
                        else {
                            dt.order([groupedColumn, 'asc']).draw();
                        }
                    });
                    // Wait for the modal to be displayed
                    setTimeout(function () {
                        // Make the type column hidden
                        dt.columns(groupedColumn).visible(false);
                    }, 100);
                }
            }
        });
    };
    // Refreshes the dashboard
    ISRApp.prototype.refresh = function () {
        var _this = this;
        // Refresh the data
        ds_1.DataSource.refresh().then(function () {
            // Refresh the dashboard
            _this._dashboard.refresh(ds_1.DataSource.StatusReportItems);
        });
    };
    return ISRApp;
}());
exports.ISRApp = ISRApp;
