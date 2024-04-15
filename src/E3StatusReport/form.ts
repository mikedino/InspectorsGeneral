import { CanvasForm, ItemForm, Documents } from "dattatable";
import { Components } from "gd-sprest-bs";
import { Security } from "../security";
import Strings from "../strings";
import { IStatusReportItem } from "./ds";
import { InspectionWorksheetForms } from "../E3InspectionReports/form";
import { IInspectionWorksheet } from "../E3InspectionReports/ds";
import { DataSource } from "./ds";
import { IFormControlPropsDropdown } from "gd-sprest-bs/src/components/components";

/**
 * Inspection Schedule Forms
 */
export class StatusReportForms {

    // fields only Inspectors can modify
    private static lockdownFields = ["number", "observation", "status", "rtype", "inspectorFeedback", "reference"];
    // excluded fields used on Inspection Reports version of the ISR form
    private static excludeFields = ["Title", "implementationStatus", "ecd", "reportLU", "reportedStatus", "inspectorFeedback"];
    // fields to toggle if Type Choice is a Recommendation
    private static toggleFields = ["Title", "implementationStatus", "ecd", "reportLU", "reportedStatus", "inspectorFeedback", "status", "reference"];

    // Creates a new ISR (status report) from the Inspection Reports dashboard
    static create(typeChoice: string, onUpdated: () => void, reportItem: IInspectionWorksheet) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.ISR;

        // Show the new form
        ItemForm.create({
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: props => {
                // hide fields
                props.excludeFields = this.excludeFields;

                props.onControlRendering = (ctrl, field) => {
                    // create array of fields to be locked down 
                    if (this.lockdownFields.includes(field.InternalName)) {
                        ctrl.isReadonly = !Security.IsInspector;
                    }

                    // set choice based on button clicked and then lock down
                    if (field.InternalName == "rtype") {
                        ctrl.value = typeChoice;
                        ctrl.isDisabled = !Security.IsInspector;

                        //assign onchange event to control
                        (ctrl as IFormControlPropsDropdown).onChange = (item: Components.IDropdownItem) => {
                            this.toggleField(item.value);
                        }
                    }
                }

                props.onFormRendered = (form) => {
                    //hide fields on initial render if recommendation
                    let choiceVal:Components.IFormControlPropsDropdown = form.getControl("rtype").getValue();
                    if (choiceVal.value == "Recommendation") {
                        this.toggleField(choiceVal.value);
                    }
                }
                return props;
            },
            onSave: values => {
                // set report lookup to current report
                values.reportLUId = reportItem.Id;
                return values;
            },
            onUpdate: item => {

                // re-open inspection worksheet canvas
                InspectionWorksheetForms.edit(reportItem, () => { })

                // Call the update event
                onUpdated();
            }
        });
    }

    // method to toggle the field for recommendation vs. deficiency
    private static toggleField(choiceValue: string) {
        // loop through each of the toggle fields to see if it exist in this form
        for (let i = 0; i < this.toggleFields.length; i++) {

            // get the control
            let thisControl: Components.IFormControl = ItemForm.EditForm.getControl(this.toggleFields[i]);

            // Update the form fields hide/show for each field if it exists
            if (thisControl && choiceValue == "Recommendation") {
                thisControl.control.el.parentElement.parentElement.classList.add("d-none");
            } else if (thisControl) {
                thisControl.control.el.parentElement.parentElement.classList.remove("d-none");
            }
        }
    }

    // Displays the edit form on the Inspection Reports dashboard
    static editIR(item: IStatusReportItem, onUpdated: () => void, reportItem: IInspectionWorksheet = null) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.ISR;

        // Show the edit form
        ItemForm.edit({
            itemId: item.Id,
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium3);
            },
            onCreateEditForm: props => {
                // hide fields
                props.excludeFields = this.excludeFields;

                props.onControlRendering = (ctrl, field) => {
                    // find Type Choice column
                    if (field.InternalName == "rtype") {
                        //assign onchange event to control
                        (ctrl as IFormControlPropsDropdown).onChange = (item: Components.IDropdownItem) => {
                            this.toggleField(item.value);
                        }
                    }
                }

                props.onFormRendered = (form) => {
                    //hide fields on initial render if recommendation
                    let choiceVal:Components.IFormControlPropsDropdown = form.getControl("rtype").getValue();
                    if (choiceVal.value == "Recommendation") {
                        this.toggleField(choiceVal.value);
                    }
                }

                return props;
            },

            onSetFooter: el => {
                Components.Button({
                    el,
                    type: Components.ButtonTypes.OutlineDanger,
                    isDisabled: !Security.IsInspector,
                    text: "Delete",
                    title: "Delete",
                    className: "float-start",
                    onClick: () => {
                        // Delete the item
                        this.delete(item, () => {
                            // Refresh the ISR datasource
                            DataSource.refresh().then(() => {
                                // then re-open inspection worksheet canvas
                                InspectionWorksheetForms.edit(reportItem, () => { })
                            })
                        });
                    }
                });
            },
            onUpdate: item => {
                // re-open inspection worksheet canvas
                InspectionWorksheetForms.edit(reportItem, () => { })

                // Call the update event
                onUpdated();
            }
        });

    }

    // Displays the edit form on the ISR dashboard
    static edit(item: IStatusReportItem, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties;
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.ISR;

        // Show the edit form
        ItemForm.edit({
            itemId: item.Id,
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium3);
            },
            onSetHeader: el => {
                el.innerHTML = item.reportLU.Title;
            },
            onCreateEditForm: props => {
                // hide fields
                props.excludeFields = [
                    "Title", "reportLU"
                ]

                props.onControlRendering = (ctrl, field) => {
                    if (this.lockdownFields.includes(field.InternalName)) {
                        // disable fields for non-inspectors                    
                        ctrl.isReadonly = !Security.IsInspector;
                    }

                    // find Type Choice column
                    if (field.InternalName == "rtype") {
                        //assign onchange event to control
                        (ctrl as IFormControlPropsDropdown).onChange = (item: Components.IDropdownItem) => {
                            this.toggleField(item.value);
                        }
                    }
                }

                props.onFormRendered = (form) => {
                    //hide fields on initial render if recommendation
                    let choiceVal:Components.IFormControlPropsDropdown = form.getControl("rtype").getValue();
                    if (choiceVal.value == "Recommendation") {
                        this.toggleField(choiceVal.value);
                    }
                }

                return props;
            },
            onSetFooter: el => {
                Components.Button({
                    el,
                    type: Components.ButtonTypes.OutlineDanger,
                    isDisabled: !Security.IsInspector,
                    text: "Delete",
                    title: "Delete",
                    className: "float-start me-2",
                    onClick: () => {
                        // Delete the item
                        this.delete(item, () => {
                            // Refresh the ISR datasource
                            DataSource.refresh();
                        });
                    }
                });
            },
            onUpdate: item => {
                // Call the update event
                onUpdated();
            },
            tabInfo: {
                tabs: [
                    {
                        title: "ISR Details",
                        excludeFields: ["Attachments"]
                    },
                    {
                        title: "Attachments",
                        fields: [],
                        onRendered: (el) => {
                            new Documents({
                                el,
                                listName: Strings.Lists.ISR,
                                itemId: item.Id
                            });
                        }
                    }
                ]
            }
        });

    }

    // Displays the view form
    static view(itemId: number) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.ISR;

        // Show the edit form
        ItemForm.view({
            itemId: itemId
        });
    }

    // Deletes the request
    static delete(item: IStatusReportItem, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the header
        CanvasForm.setHeader("Delete ISR");
        CanvasForm.setType(Components.OffcanvasTypes.End)

        // Set the body
        CanvasForm.setBody("Are you sure you want to delete this ISR?<p></p>");

        // Set the footer
        Components.Tooltip({
            el: CanvasForm.BodyElement,
            content: "Click to delete the ISR.",
            btnProps: {
                text: "Delete",
                type: Components.ButtonTypes.OutlineDanger,
                onClick: () => {
                    // Close the modal
                    CanvasForm.hide();

                    // Delete the item
                    item.delete().execute(
                        // Success
                        () => {

                            // Call the update event
                            onUpdated();
                        },
                        // Error
                        (err) => {

                            // TODO
                            alert("There was an error deleting the ISR.\n\n" + err);

                            // Log
                            console.error("[" + Strings.ProjectName + "] Unable to delete ISR " + item.Title, item);
                        }
                    );
                }
            }
        });

        // Show the modal
        CanvasForm.show();
    }
}