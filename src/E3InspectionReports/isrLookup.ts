import { Components } from "gd-sprest-bs";
import { pencilSquare } from "gd-sprest-bs/build/icons/svgs/pencilSquare";
import { DataSource } from "../E3StatusReport/ds";
import { StatusReportForms } from "../E3StatusReport/form";
import { IStatusReportItem } from "../E3StatusReport/ds";
import { IInspectionWorksheet } from "./ds";

/**
 * ISR Lookup Control
 */
export class ISRLookup {
    private _el: HTMLElement = null;
    private _type: string;
    private _item: IInspectionWorksheet;
    private _isApproved: boolean;

    // Constructor
    constructor(el: HTMLElement, type: string, item: IInspectionWorksheet, isApproved: boolean) {
        // Save the properties
        this._el = el;
        this._type = type;
        this._item = item;
        this._isApproved = isApproved;

        // Render the control
        this.render();
    }

    // Method to render the control
    private render() {

        // define columns for ISR table
        let columns: Components.ITableColumn[] =
            [
                {
                    name: "number",
                    title: "No."
                },
                {
                    name: "rtype",
                    title: "Type"
                },
                {
                    name: "observation",
                    title: "Observation"
                },
                {
                    name: "status",
                    title: "Status"
                }
            ];
        
        // if worksheet is not approved, add EDIT button to ISR table(s)
        if(!this._isApproved){
            columns.unshift(
                {
                    // edit button,
                    name: "",
                    title: "",
                    onRenderCell: (el, col, item: IStatusReportItem) => {
                        // render a button group
                        Components.Button({
                            el,
                            type: Components.ButtonTypes.OutlinePrimary,
                            isSmall: true,
                            iconSize: 14,
                            iconType: pencilSquare,
                            onClick: () => {
                                // Display the edit form
                                StatusReportForms.editIR(item, () => {
                                    // Refresh the datatable
                                    DataSource.refresh();
                                }, this._item);
                            }
                        });
                    }
                }
            )
        }

        // render a table
        Components.Table({
            el: this._el,
            rows: DataSource.getRelatedISR(this._type, this._item.Id),
            columns: columns
        })

        // render a NEW button
        Components.Button({
            el: this._el,
            text: "+ New " + this._type,
            className: "isrButton",
            isDisabled: this._isApproved,
            isSmall: true,
            onClick: () => {
                // Show the item form
                StatusReportForms.create(this._type, () => {
                    // Refresh the dashboard
                    DataSource.refresh();
                }, this._item);
            }
        });
    }
}