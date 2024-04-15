import { Components, ContextInfo, Web } from 'gd-sprest-bs';
import { DataTable } from 'dattatable';
import * as jQuery from "jquery";
import * as moment from 'moment';
import { pencilSquare } from "gd-sprest-bs/build/icons/svgs/pencilSquare";
import { trash3 } from "gd-sprest-bs/build/icons/svgs/trash3";
import Strings from "../strings";
import { InspectionReportsApp } from "../E3InspectionReports";
import { SelfAssessmentApp } from "../E3SelfAssessment";
import { ISRApp } from "../E3StatusReport";
import { IInspectionSchedule, DataSource } from '../E3Schedule/ds';
import { InspectionScheduleForms } from '../E3Schedule/form';
import HTML from './template.html';
import './styles.scss';

/**
 * Echelon III Home Page
 */
export class E3HomePage {
    private _el: HTMLElement = null;
    //private _schedule: Components.ITable = null;
    private _schedule: DataTable = null;

    // constructor
    constructor(el: HTMLElement) {
        this._el = el;

        // Load the schedule data
        DataSource.init().then(() => {

            // Render the dashboard
            this.render();
        });
    }

    private render() {

        // render html template
        this._el.innerHTML = HTML;

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
    }

    // Sets the click events for the page
    private configureEvents() {
        // Set the inspection results click event
        let el = this._el.querySelector("#inspectionResults .clickBox");
        if (el) {
            // Set the click event
            el.addEventListener("click", ev => {
                // Display the inspection reports
                new InspectionReportsApp();
            });
        }

        // Set the self assessment click event
        el = this._el.querySelector("#selfAssessment .clickBox");
        if (el) {
            // Set the click event
            el.addEventListener("click", ev => {
                // Display the self assessments
                new SelfAssessmentApp();
            });
        }

        // Set the ISR click event
        el = this._el.querySelector("#isr .clickBox");
        if (el) {
            // Set the click event
            el.addEventListener("click", ev => {
                // Display the ISR's
                new ISRApp();
            });
        }
    }

    private renderLinks() {
        // set the Org Chart click event
        let el = this._el.querySelector("#orgChartLink");
        if (el) {
            el.addEventListener("click", () => {
                // Open in a new tab
                window.open(ContextInfo.webAbsoluteUrl + "/OrgChart");
            });
        }

        // set the Program Identification click event
        el = this._el.querySelector("#programIdLink");
        if (el) {
            el.addEventListener("click", () => {
                // Open in a new tab
                window.open(ContextInfo.webAbsoluteUrl + "/Lists/CIProgramIdentification");
            });
        }

        // set the Shared Documents click event
        el = this._el.querySelector("#documentSharingLink");
        if (el) {
            el.addEventListener("click", () => {
                // Open in a new tab
                window.open(ContextInfo.webAbsoluteUrl + "/Shared%20Documents");
            });
        }

        // set the Schedule click event
        el = this._el.querySelector("#scheduleLink");
        if (el) {
            el.addEventListener("click", () => {
                // Open in a new tab
                window.open(ContextInfo.webAbsoluteUrl + "/Lists/InspectionSchedule");
            });
        }
    }

    // render the header portion
    private renderHeader() {
        if (ContextInfo.webAbsoluteUrl.indexOf('/USFFHQ') > 0) {
            // for the USFF HQ site only, change the title and remove the subtitle
            document.querySelector('h1').innerText = ContextInfo.webTitle;
            document.querySelector('.welcome').innerHTML = "<p>&nbsp;</p>";
        } else {
            let elArr = document.querySelectorAll(".siteTitle");
            elArr.forEach(element => {
                element.innerHTML = ContextInfo.webTitle
            });
        }
    }

    // find Org Chart link
    private getOrgChart() {
        let el: HTMLDivElement = document.querySelector("#orgChartContent");

        //get org chart list items - last updated
        Web().Lists("OrgChart").RootFolder().Files().query({ Top: 1 }).execute((files) => {

            // if org chart exists, append link
            if (files.results.length > 0) {
                let link = document.createElement("a");
                el.appendChild(link);
                link.href = files.results[0].ServerRelativeUrl;
                link.innerHTML = "View Org Chart";
            } else el.innerHTML = "Org Chart not posted";

        }, () => {
            // error 
            console.error("[E3HomePage] Error retrieving Org Chart.");
        });

    }

    // render the footer portion
    private renderSchedule() {

        // set the grouped column number
        let groupedColumn = 4;

        let el = this._el.querySelector("#scheduleContent");
        let elNew = this._el.querySelector("#scheduleNewItem");

        while (el.firstElementChild) {
            el.removeChild(el.firstElementChild)
        }

        Components.Card({
            el,
            className: "px-5 border-light",
            body: [{
                onRender: (el) => {
                    /*this._schedule = Components.Table({
                        el,
                        rows: DataSource.Items ? DataSource.Items : [{ "Title": "There are no events to display" }],
                        columns: [
                            {
                                //name: "edit",
                                name: "",
                                title: "",
                                onRenderCell: (el, col, item: IInspectionSchedule) => {
                                    // render a button group
                                    Components.ButtonGroup({
                                        el,
                                        isSmall: true,
                                        buttons: [
                                            {
                                                text: "",
                                                title: "Click to edit this record",
                                                iconSize: 14,
                                                iconType: pencilSquare,
                                                type: Components.ButtonTypes.OutlinePrimary,
                                                onClick: () => {
                                                    // Display the edit form
                                                    InspectionScheduleForms.edit(item, () => {
                                                        // Refresh the datatable
                                                        this.refreshSchedule();
                                                    });
                                                }
                                            },
                                            {
                                                text: "",
                                                title: "Click to delete this record",
                                                className: "ms-1",
                                                iconSize: 14,
                                                iconType: trash3,
                                                type: Components.ButtonTypes.OutlineDanger,
                                                onClick: () => {
                                                    // Delete the item
                                                    InspectionScheduleForms.delete(item, () => {
                                                        // Refresh the schedule datasource
                                                        this.refreshSchedule();
                                                    });
                                                }
                                            },
                                        ]
                                    })
                                }
                            },
                            {
                                name: "Title",
                                title: "Event Name",
                                className: "pointer",
                                onClickCell: (el, col, item) => {
                                    // view the event
                                    InspectionScheduleForms.view(item.Id);
                                },
                            },
                            {
                                name: "",
                                title: "Start Date",
                                className: "text-center",
                                onRenderHeader: (el, col) => {
                                    el.className = "text-center";
                                },
                                onRenderCell: (el, col, item) => {
                                    el.innerHTML = moment(item.EventDate).format("MM/DD/yyyy HHmm");
                                }
                            },
                            {
                                name: "",
                                title: "End Date",
                                className: "text-center",
                                onRenderHeader: (el) => {
                                    el.className = "text-center";
                                },
                                onRenderCell: (el, col, item) => {
                                    el.innerHTML = moment(item.EndDate).format("MM/DD/yyyy HHmm");
                                }
                            }
                        ]
                    })*/
                    this._schedule = new DataTable({
                        el,
                        rows: DataSource.Items ? DataSource.Items : [{ "Title": "There are no events to display" }],
                        columns: [
                            {
                                //name: "edit",
                                name: "",
                                title: "",
                                onRenderCell: (el, col, item: IInspectionSchedule) => {
                                    // render a button group
                                    Components.ButtonGroup({
                                        el,
                                        isSmall: true,
                                        buttons: [
                                            {
                                                text: "",
                                                title: "Click to edit this record",
                                                iconSize: 14,
                                                iconType: pencilSquare,
                                                type: Components.ButtonTypes.OutlinePrimary,
                                                onClick: () => {
                                                    // Display the edit form
                                                    InspectionScheduleForms.edit(item, () => {
                                                        // Refresh the datatable
                                                        this.refreshSchedule();
                                                    });
                                                }
                                            },
                                            {
                                                text: "",
                                                title: "Click to delete this record",
                                                className: "ms-1",
                                                iconSize: 14,
                                                iconType: trash3,
                                                type: Components.ButtonTypes.OutlineDanger,
                                                onClick: () => {
                                                    // Delete the item
                                                    InspectionScheduleForms.delete(item, () => {
                                                        // Refresh the schedule datasource
                                                        this.refreshSchedule();
                                                    });
                                                }
                                            },
                                        ]
                                    })
                                }
                            },
                            {
                                name: "Title",
                                title: "Event Name",
                                className: "pointer",
                                onClickCell: (el, col, item) => {
                                    // view the event
                                    InspectionScheduleForms.view(item.Id);
                                },
                            },
                            {
                                name: "",
                                title: "Start Date",
                                className: "text-center",
                                onRenderHeader: (el, col) => {
                                    el.className = "text-center";
                                },
                                onRenderCell: (el, col, item) => {
                                    el.innerHTML = moment(item.EventDate).format("MM/DD/yyyy HHmm");
                                }
                            },
                            {
                                name: "",
                                title: "End Date",
                                className: "text-center",
                                onRenderHeader: (el) => {
                                    el.className = "text-center";
                                },
                                onRenderCell: (el, col, item) => {
                                    el.innerHTML = moment(item.EndDate).format("MM/DD/yyyy HHmm");
                                }
                            },
                            {
                                //column used for grouping.  hidden using onrendered prop.
                                name: "",
                                title: "StartDateGroup",
                                onRenderCell: (el, col, item) => {
                                    el.innerHTML = moment(item.EventDate).format("dddd DDMMMyyyy").toUpperCase();
                                    el.setAttribute("data-sort", item.EventDate);
                                }
                            }
                        ],
                        dtProps: {
                            dom: 'rt<"row"<"col-sm-4"l><"col-sm-4"i><"col-sm-4"p>>',
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
                            paging: false,
                            searching: false,
                            ordering: false,
                            createdRow: function (row, data, index) {
                                jQuery('td', row).addClass('align-middle');
                            },
                            drawCallback: function (settings) {
                                let api = new jQuery.fn.dataTable.Api(settings) as any;
                                jQuery(api.context[0].nTable).removeClass('no-footer');
                                jQuery(api.context[0].nTable).addClass('tbl-footer');
                                // color alternating rows jQuery(api.context[0].nTable).addClass('table-striped');
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
                                                .before(`<tr class="group text-center table-secondary"><td colspan="4">${group}</td></tr>`);
                                            last = group;
                                        }
                                    });
                            },
                            // Order by the grouping column pre/fixed to maintain grouping
                            orderFixed: {
                                pre: [groupedColumn, "asc"],
                                post: [2, "asc"]
                            }
                        }   ,
                        onRendered: (el, dt) => {
        
                            // Wait for the modal to be displayed
                            setTimeout(() => {
                                // Make the type column hidden
                                dt.columns(groupedColumn).visible(false);
                            }, 100);
                        }                 
                    })
                }
            }],
            footer: {
                onRender: (el) => {
                    Components.Tooltip({
                        el,
                        content: "Click to create a new event.",
                        placement: 1,
                        btnProps: {
                            text: "New Event",
                            type: Components.ButtonTypes.OutlinePrimary,
                            isSmall: true,
                            onClick: () => {
                                // Show the item form
                                InspectionScheduleForms.create(() => {
                                    // Refresh the dashboard
                                    this.refreshSchedule();
                                });
                            }
                        }
                    })
                }
            }
        });
    }

    // Refreshes the schedule
    private refreshSchedule() {
        // Refresh the data
        DataSource.init().then(() => {
            // Refresh (regenerate) the table
            this.renderSchedule();
        });
    }
}