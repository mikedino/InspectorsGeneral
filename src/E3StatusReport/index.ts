import { Dashboard, LoadingDialog, Modal } from "dattatable";
import { Components, ContextInfo } from "gd-sprest-bs";
import { arrowClockwise } from "gd-sprest-bs/build/icons/svgs/arrowClockwise";
import { pencilSquare } from "gd-sprest-bs/build/icons/svgs/pencilSquare";
import { arrowUpLeft } from "gd-sprest-bs/build/icons/svgs/arrowUpLeft";
import { paperclip } from "gd-sprest-bs/build/icons/svgs/paperclip";
import * as jQuery from "jquery";
import moment = require("moment");
import { DataSource, IStatusReportItem } from "./ds";
import { StatusReportForms } from "./form";
import { Security } from "../security";
import { Export } from "./export";
import Strings from "../strings";
import './styles.scss';

/**
 * Implementation Status Report (ISR) Application (Subweb)
 */
export class ISRApp {
    private _statusFilter: string = null;
    private _reportedStatusFilter: string = null;
    private _dashboard: Dashboard = null;

    // Constructor
    constructor() {
        // Show the loading dialog
        LoadingDialog.setHeader("Loading the Data");
        LoadingDialog.setBody("This will close after the data is loaded...");
        LoadingDialog.show();

        // Load the ISR data
        DataSource.init().then(() => {
            LoadingDialog.hide();

            // Render the dashboard
            this.render();
        });
    }

    // Renders the modal
    private render() {
        // Clear the modal
        Modal.clear();

        // Set the properties
        Modal.setType(Components.ModalTypes.Full);
        Modal.setScrollable(true);

        // Set the header
        Modal.setHeader(`${ContextInfo.webTitle} Implementation Status Reports`);

        // Render the body
        this.renderDashboard(Modal.BodyElement);

        // Set the footer
        Components.TooltipGroup({
            el: Modal.FooterElement,
            tooltips: [
                {
                    content: "Closes the modal",
                    btnProps: {
                        text: "Close",
                        type: Components.ButtonTypes.OutlineDanger,
                        onClick: () => {
                            // Close the modal
                            Modal.hide();
                        }
                    }
                }
            ]
        });

        // Show the modal
        Modal.show();
    }

    // Renders the dashboard
    private renderDashboard(el: HTMLElement) {

        // Hide the dialog
        LoadingDialog.hide();

        // grouped column number and filtered column numbers
        let noColumn = 3;
        let statusColumn = 7;
        let reportedStatusColumn = 6;
        let programColumn = 2;
        let groupedColumn = 10;

        // Create the dashboard
        this._dashboard = new Dashboard({
            el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: "Implementation Status Reports (ISR)",
            },
            subNavigation: {
                items: [
                    {
                        className: "ms-2 btn-outline-primary",
                        text: "Send Items to Rollup List",
                        isDisabled: Security.IsAdmin ? false : true,
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: arrowUpLeft,
                        isButton: true,
                        onClick: () => {
                            // Show the item form
                            DataSource.copyToRollup();
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Export",
                        isButton: true,
                        isDisabled: DataSource.StatusReportItems.length > 0 ? false : true,
                        onClick: () => {
                            // initialize Export then Export the data to csv
                            Export.init().then(() => {
                                Export.generateCSV(DataSource.StatusReportItems)
                            }, 
                                //on reject, close the loading dialog and popup an error modal
                                error => {
                                    // Close the loading dialog
                                    LoadingDialog.hide();
                                    // Clear the modal
                                    Modal.clear();
                                    // Set the properties
                                    Modal.setType(Components.ModalTypes.Small);
                                    // Set the header
                                    Modal.setHeader(`ERROR EXPORTING ISR's`);
                                    // Set the body                                    
                                    Modal.setBody(error);
                                }
                            );
                        }
                    }
                ],
                itemsEnd: [
                    {
                        className: "ms-2 btn-outline-dark",
                        text: "Refresh",
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: arrowClockwise,
                        isButton: true,
                        onClick: () => {
                            // Refresh the dashboard
                            this.refresh();
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
                                type: Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Closed",
                                type: Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Accepted",
                                type: Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Returned",
                                type: Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: (item: string) => {

                            // Set the filter
                            this._statusFilter = item || "";

                            // Apply the filter
                            this._dashboard.filter(statusColumn, this._statusFilter, true);

                        },
                    },
                    {
                        header: "Filter by Reported Status",
                        items: [
                            {
                                label: "In progress",
                                type: Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Action complete",
                                type: Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: (item: string) => {

                            // Set the filter
                            this._reportedStatusFilter = item || "";

                            // Apply the filter
                            this._dashboard.filter(reportedStatusColumn, this._reportedStatusFilter);

                        }
                    }
                ]
            },
            footer: {
                itemsEnd: [
                    {
                        text: "v" + Strings.Version
                    }
                ]
            },
            table: {
                columns: [
                    {
                        name: "",
                        title: "Edit",
                        onRenderCell: (el, col, item: IStatusReportItem) => {
                            // render a button group
                            Components.ButtonGroup({
                                el,
                                isSmall: true,
                                buttons: [
                                    {
                                        text: "",
                                        title: "Click to edit this record",
                                        iconSize: 16,
                                        iconType: pencilSquare,
                                        type: Components.ButtonTypes.OutlinePrimary,
                                        onClick: () => {
                                            // Display the edit form
                                            StatusReportForms.edit(item, () => {
                                                // Refresh the datatable
                                                this.refresh();
                                            });
                                        }
                                    }
                                ]
                            });
                        }
                    },
                    {
                        name: "Attachments",
                        title: " ",
                        // col # 1
                        onRenderCell: (el, column, item: IStatusReportItem) => {
                            // See if the item is active
                            if (item.Attachments) {
                                // Render as a icon
                                let icon = paperclip(20) as HTMLElement;
                                el.innerHTML = icon.outerHTML;
                                // Set the sort value
                                el.setAttribute("data-sort", "1");
                            } else el.innerHTML = "";
                        }
                    },
                    {
                        name: "",
                        title: "Program/Process",
                        // col # 2
                        onRenderCell: (el, column, item) => {
                            el.innerHTML = item.reportLU.Title;
                        },
                    },
                    {
                        name: "number",
                        title: "No."
                         // col # 3
                    },
                    {
                        name: "observation",
                        title: "Observation"
                         // col # 4
                    },
                    {
                        name: "reference",
                        title: "Reference"
                         // col # 5
                    },
                    {
                        name: "reportedStatus",
                        title: "Reported Status",
                         // col # 6
                        onRenderCell: (el, column, item: IStatusReportItem) => {
                            // Set the filter/sort values
                            el.setAttribute("data-filter", item.reportedStatus);
                            el.setAttribute("data-sort", item.reportedStatus);
                        }
                    },
                    {
                        name: "status",
                        title: "IG Status",
                         // col # 7
                        onRenderCell: (el, column, item: IStatusReportItem) => {
                            // Set the filter/sort values
                            el.setAttribute("data-filter", item.status as any);
                            el.setAttribute("data-sort", item.status as any);
                        }
                    },
                    {
                        name: "Modified",
                        title: "Modified",
                         // col # 8
                        onRenderCell: (el, column, item) => {
                            // Format the date
                            el.innerHTML = item.Modified ? moment(item.Modified).format("MMM D") : "";
                        }
                    },
                    {
                        name: "",
                        title: "Modified By",
                         // col # 9
                        onRenderCell: (el, column, item) => {
                            el.innerHTML = item.Editor.Title;
                        },
                    },
                    {
                        // grouped column
                        name: "rtype",
                        title: "Type"
                         // col # 10
                    }
                ],
                rows: DataSource.StatusReportItems,
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
                        let api = new jQuery.fn.dataTable.Api(settings) as any;
                        jQuery(api.context[0].nTable).removeClass('no-footer');
                        jQuery(api.context[0].nTable).addClass('tbl-footer');
                        jQuery(api.context[0].nTable).addClass('table-striped');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_info').addClass('text-center');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_length').addClass('pt-2');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_paginate').addClass('pt-03');

                        // grouping
                        let rows = api.rows({ page: 'current' }).nodes();
                        let last = null;

                        api
                            .column(groupedColumn, { page: 'current' })
                            .data()
                            .each(function (group, i) {
                                if (last !== group) {
                                    jQuery(rows)
                                        .eq(i)
                                        // update colspan to total number of columns in the dashboard (minus the hidden column)
                                        .before(`<tr class="group"><td colspan="${groupedColumn}">${group}</td></tr>`);
                                    last = group;
                                }
                            });
                    },
                    headerCallback: function (thead, data, start, end, display) {
                        jQuery('th', thead).addClass('align-middle');
                    },
                    // Order by the grouping column pre/fixed to maintain grouping, then "Program" ascending, then "No."
                    orderFixed: {
                        pre: [groupedColumn, "asc"],
                        post: [[programColumn, "asc"],[noColumn, "asc"]]
                    }
                },
                onRendered: (el, dt) => {
                    // See if status filter is set
                    if (this._statusFilter) {
                        // Apply the filter
                        this._dashboard.filter(statusColumn, this._statusFilter, true);
                    }

                    // See if reported status filter is set
                    if (this._reportedStatusFilter) {
                        // Apply the filter
                        this._dashboard.filter(reportedStatusColumn, this._reportedStatusFilter);
                    }

                    // sorting the group headers
                    jQuery('.dataTable').on('click', 'tr.group', function () {
                        let currentOrder = dt.order()[0];
                        if (currentOrder[0] === groupedColumn && currentOrder[1] === 'asc') {
                            dt.order([groupedColumn, 'desc']).draw();
                        }
                        else {
                            dt.order([groupedColumn, 'asc']).draw();
                        }
                    });

                    // Wait for the modal to be displayed
                    setTimeout(() => {
                        // Make the type column hidden
                        dt.columns(groupedColumn).visible(false);
                    }, 100);
                }
            }
        });
    }

    // Refreshes the dashboard
    private refresh() {
        // Refresh the data
        DataSource.refresh().then(() => {
            // Refresh the dashboard
            this._dashboard.refresh(DataSource.StatusReportItems);
        });
    }

}