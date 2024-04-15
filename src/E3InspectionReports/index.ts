import { Dashboard, LoadingDialog, Modal, IFilterItem } from "dattatable";
import { Components, ContextInfo } from "gd-sprest-bs";
import { plus } from "gd-sprest-bs/build/icons/svgs/plus";
import { arrowClockwise } from "gd-sprest-bs/build/icons/svgs/arrowClockwise";
import { trash3 } from "gd-sprest-bs/build/icons/svgs/trash3";
import { pencilSquare } from "gd-sprest-bs/build/icons/svgs/pencilSquare";
import { checkCircleFill } from "gd-sprest-bs/build/icons/svgs/checkCircleFill";
import { dashCircleFill } from "gd-sprest-bs/build/icons/svgs/dashCircleFill";
import { exclamationCircleFill } from "gd-sprest-bs/build/icons/svgs/exclamationCircleFill";
import { xCircleFill } from "gd-sprest-bs/build/icons/svgs/xCircleFill";
import * as jQuery from "jquery";
import moment = require("moment");
import { DataSource, IInspectionWorksheet } from "./ds";
import { DataSource as ISRDataSource } from "../E3StatusReport/ds";
import { InspectionWorksheetForms } from "./form";
import { Security } from "../security";
import Strings from "../strings";
import "./styles.scss";

/**
 * Program Inspection Reports Application (Subweb)
 */
export class InspectionReportsApp {
    private _approvalFilter: string = null;
    private _endOfDayFilter: string = null;
    private _inspectorStatusFilter: string = null;
    private _dashboard: Dashboard = null;

    // Constructor
    constructor() {
        // Show the loading dialog
        LoadingDialog.setHeader("Loading the Data");
        LoadingDialog.setBody("This will close after the data is loaded...");
        LoadingDialog.show();

        // Load the inspection report data
        DataSource.init().then(() => {
            // Load the ISR data for the lookups
            ISRDataSource.init().then(() => {
                // Hide the dialog
                LoadingDialog.hide();

                // Render the dashboard
                this.render();
            })

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
        Modal.setHeader(`${ContextInfo.webTitle} Individual Program Inspection Reports`);

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
        // Generate the columns
        let columns = this.generateColumns();

        // Hide the dialog
        LoadingDialog.hide();

        // Create the dashboard
        this._dashboard = new Dashboard({
            el,
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
                        isDisabled: Security.IsInspector ? false : true,
                        iconClassName: "me-1",                        
                        iconSize: 18,
                        iconType: plus,
                        isButton: true,
                        onClick: () => {
                            // Show the item form
                            InspectionWorksheetForms.create(() => {
                                // Refresh the dashboard
                                this.refresh();
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
                items: this.generateFilters()
            },
            footer: {
                itemsEnd: [
                    {
                        text: "v" + Strings.Version
                    }
                ]
            },
            table: {
                columns,
                rows: Security.IsInspector ? DataSource.Items : DataSource.ApprovedItems,
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
                        let api = new jQuery.fn.dataTable.Api(settings) as any;
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
                    order: [[1, "asc"]]
                },
                onRendered: (el, dt) => {
                    
                    // See if inspector status filter is set
                    if (this._inspectorStatusFilter) {
                        // Apply the filter
                        this._dashboard.filter(8, this._inspectorStatusFilter);
                    }

                    // See if approval filter is set
                    if (this._approvalFilter) {
                        // Apply the filter
                        this._dashboard.filter(9, this._approvalFilter);
                    }
                    
                }
            },
            onRendered: el => {
                // Default the filter
                this._dashboard.setFilterValue("Filter by Approval Status", "Approved");
            }
        });
    }

    // Generates the filters
    private generateFilters(): Array<any> {
        // Set the filters ONLY for inspectors
        let items: IFilterItem[] = 
            [
                {
                    header: "Filter by Inspector Status",
                    items: [
                        {
                            label: "Working",
                            type: Components.CheckboxGroupTypes.Switch
                        },
                        {
                            label: "Complete",
                            type: Components.CheckboxGroupTypes.Switch
                        }
                    ],
                    onFilter: (item: string) => {
                        // Set the filter
                        this._inspectorStatusFilter = item || "";

                        // Apply the filter
                        this._dashboard.filter(8, this._inspectorStatusFilter);
                    }
                },
                {
                    header: "Filter by Approval Status",
                    items: [
                        {
                            label: "Approved",
                            type: Components.CheckboxGroupTypes.Switch
                        },
                        {
                            label: "Pending",
                            type: Components.CheckboxGroupTypes.Switch
                        }
                    ],
                    onFilter: (item: string) => {
                        // See if an item is selected
                        if (item) {
                            // Set the filter
                            this._approvalFilter = item == "Approved" ? "Yes" : "No";
                        } else {
                            // Set the filter
                            this._approvalFilter = "";
                        }

                        // Apply the filter
                        this._dashboard.filter(9, this._approvalFilter);
                    }
                }
                
            ];

        return items;
    }

    // Generates the columns
    private generateColumns(): Components.ITableColumn[] {
        // Set the default columns
        let columns: Components.ITableColumn[] =
            [
                {
                    //name: "edit",
                    name: "",
                    title: "Edit",
                    onRenderCell: (el, col, item: IInspectionWorksheet) => {
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
                                        // See if the item is approved and not the admin
                                        if (item.approval == "Approved" && !Security.IsAdmin) {
                                            // Display the view form
                                            InspectionWorksheetForms.view(item.Id);
                                        } else {
                                            // Display the edit form
                                            InspectionWorksheetForms.edit(item, () => {
                                                // Refresh the datatable
                                                this.refresh();
                                            });
                                        }
                                    }
                                },
                                {
                                    text: "",
                                    isDisabled: Security.IsAdmin ? false : true,
                                    title: "Click to delete this record",
                                    className: "ms-1",
                                    iconSize: 16,
                                    iconType: trash3,
                                    type: Components.ButtonTypes.OutlineDanger,
                                    onClick: () => {
                                        // Display delete form
                                        InspectionWorksheetForms.delete(item, () => {
                                            // Refresh the dashboard
                                            this.refresh();
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
                    name: "selfAssessment",
                    title: "Self-Assessment",
                    onRenderCell: (el, col, item: IInspectionWorksheet) => {
                        // Render the indicator
                        this.renderIndicator(el, item[col.name]);
                    }
                },
                {
                    name: "compliance",
                    title: "Compliance",
                    onRenderCell: (el, col, item: IInspectionWorksheet) => {
                        // Render the indicator
                        this.renderIndicator(el, item[col.name]);
                    }
                },
                {
                    name: "effectiveness",
                    title: "Effectiveness",
                    onRenderCell: (el, col, item: IInspectionWorksheet) => {
                        // Render the indicator
                        this.renderIndicator(el, item[col.name]);
                    }
                },
                {
                    name: "risk",
                    title: "Risk",
                    onRenderCell: (el, col, item: IInspectionWorksheet) => {
                        // Render the indicator
                        this.renderIndicator(el, item[col.name]);
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
                    onRenderCell: (el, column, item: IInspectionWorksheet) => {
                        // Set the filter/sort values
                        el.setAttribute("data-filter", item.approval == "Approved" ? "Yes" : "No");
                        el.setAttribute("data-sort", item.approval == "Approved" ? "1" : "0");
                    }
                }
            ];

        // See if this is the inspector
        if (Security.IsInspector) {
            // Add the columns
            columns.push({
                name: "",
                title: "Inspector",
                onRenderCell: (el, column, item) => {
                    el.innerHTML = item.inpsectorName.Title ? item.inpsectorName.Title : "";
                },
            });
            columns.push({
                name: "Modified",
                title: "Modified",
                onRenderCell: (el, column, item) => {
                    // Format the date
                    el.innerHTML = item.Modified ? moment(item.Modified).format("MM/DD/yyyy") : "";
                }
            });
        }

        // Return the columns
        return columns;
    }

    // Refreshes the dashboard
    private refresh() {
        // Refresh the data
        DataSource.refresh().then(() => {
            // Refresh the dashboard
            this._dashboard.refresh(DataSource.Items);
        });
    }

    // Renders the indicator
    private renderIndicator(el: HTMLElement, value: string = "") {
        let icon: HTMLElement = null;

        // Set the filter value
        el.setAttribute("data-filter", value);

        // Render the icon based on the value
        switch (value) {
            // Success
            case "Green":
                // Render the icon
                icon = checkCircleFill(20) as HTMLElement;
                icon.classList.add("text-success");
                el.innerHTML = icon.outerHTML;

                // Set the sort value
                el.setAttribute("data-sort", "0");
                break;

            // Error
            case "Red":
                // Render the icon
                icon = exclamationCircleFill(20) as HTMLElement;
                icon.classList.add("text-danger");
                el.innerHTML = icon.outerHTML;

                // Set the sort value
                el.setAttribute("data-sort", "2");
                break;

            // Warning
            case "Yellow":
                // Render the icon
                icon = dashCircleFill(20) as HTMLElement;
                icon.classList.add("text-warning");
                el.innerHTML = icon.outerHTML;

                // Set the sort value
                el.setAttribute("data-sort", "1");
                break;

            // not-assessed - gray
            case "Gray":
                // Render the icon
                icon = xCircleFill(20) as HTMLElement;
                icon.classList.add("text-secondary");
                el.innerHTML = icon.outerHTML;

                // Set the sort value
                el.setAttribute("data-sort", "3");
                break;
        }
    }
}