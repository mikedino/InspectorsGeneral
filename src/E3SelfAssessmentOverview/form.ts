import { CanvasForm, ItemForm, Modal } from "dattatable";
import { Components } from "gd-sprest-bs";
import { IFormControl } from "gd-sprest-bs/src/components/components";
import * as jQuery from "jquery";
import Strings from "../strings";
import { ISelfAssessmentOverviewItem, DataSource } from "./ds";
import './styles.scss';
import HTML from './template.html';

/**
 * Inspection Schedule Forms
 */
export class SelfAssessmentOverviewForms {

    // Creates a new event
    static create(program: string, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.SelfAssessmentOverview;

        // Show the new form
        ItemForm.create({
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Large3);
            },
            onSetHeader: el => {
                el.innerHTML = "Create Self Assessment Overview for " + program;
            },
            onCreateEditForm: props => {
                props.onControlRendering = (ctrl, field) => {
                    // get title field and set the value to the current program
                    if (field.InternalName == "Title") {
                        // don't allow updates to Program Name
                        ctrl.isDisabled = true;
                        ctrl.value = program;
                    }
                }
                props.onFormRendered = form => {
                    // Set the size of the form
                    ItemForm.setSize(Components.OffcanvasSize.Large3);

                    // create a new container for custom HTML
                    let formEl: HTMLDivElement = document.createElement('div');
                    formEl.innerHTML = HTML;
                    form.el.prepend(formEl);

                    // iterate thru form and move form elements accordingly
                    this.renderCustomForm();
                }
                return props;
            },
            onUpdate: item => {
                onUpdated()
            }
        });
    }

    // Displays the edit form
    static edit(item: ISelfAssessmentOverviewItem, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.SelfAssessmentOverview;

        // Show the edit form
        ItemForm.edit({
            onSetHeader: el => {
                el.innerHTML = `Edit ${item.Title} - Self Assessment Overview`;
            },
            itemId: item.Id,
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Large3);
            },
            onCreateEditForm: props => {
                props.onFormRendered = form => {
                    // Set the size of the form
                    ItemForm.setSize(Components.OffcanvasSize.Large3);

                    // create a new container for custom HTML
                    let formEl: HTMLDivElement = document.createElement('div');
                    formEl.innerHTML = HTML;
                    form.el.prepend(formEl);

                    // iterate thru form and move form elements accordingly
                    this.renderCustomForm();

                }
                return props;
            },
            onSetFooter: el => {
                Components.Button({
                    el,
                    type: Components.ButtonTypes.OutlineDanger,
                    text: "Delete",
                    title: "Delete",
                    className: "float-start",
                    onClick: () => {
                        // Delete the item
                        this.delete(item, () => {
                            // Refresh the SA Overview datasource
                            DataSource.refresh()
                        });
                    }
                });
            },
            onUpdate: item => {
                // Call the update event
                onUpdated();
            }
        });

    }

    // Displays the view form
    static view(item: ISelfAssessmentOverviewItem) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.SelfAssessmentOverview;

        // Show the edit form
        ItemForm.view({
            onSetHeader: el => {
                el.innerHTML = `View ${item.Title} - Self Assessment Overview`;
            },
            itemId: item.Id,
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Large3);
            },
            onCreateViewForm: props => {

                props.onFormRendered = form => {
                    // Set the size of the form
                    ItemForm.setSize(Components.OffcanvasSize.Large3);

                    // create a new container for custom HTML
                    let formEl: HTMLDivElement = document.createElement('div');
                    formEl.innerHTML = HTML;
                    form.el.prepend(formEl);

                    // iterate thru form and move form elements accordingly
                    this.renderCustomForm();

                    // get assessement control and render as box
                    let assessmentCtrl = form.getControl("assessment");
                    this.renderStatusBox(assessmentCtrl);
                }
                return props;
            },
            onSetFooter: el => {
                // Components.Button({
                //     el,
                //     type: Components.ButtonTypes.OutlineSuccess,
                //     text: "Edit",
                //     title: "Edit",
                //     className: "float-start",
                //     onClick: () => {
                //         // edite the item
                //         this.edit(item, () => { });
                //     }
                // });
                // render a button group
                Components.ButtonGroup({
                    el,
                    buttons: [
                        {
                            text: "Print",
                            title: "Click to print this form",
                            type: Components.ButtonTypes.OutlineDark,
                            className: "float-start ms-1",
                            onClick: () => {
                                // print the form
                                //window.print();
                                this.printForm(item.Title);
                            }
                        },
                        {
                            text: "Edit",
                            title: "Click to edit this record",
                            type: Components.ButtonTypes.OutlineSuccess,
                            className: "float-start ms-1",
                            onClick: () => {
                                // edit the item
                                this.edit(item, () => { });
                            }
                        },
                    ]
                });
            },
        });
    }

    // Deletes the request
    static delete(item: ISelfAssessmentOverviewItem, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the header
        CanvasForm.setHeader("Delete Overview");
        CanvasForm.setType(Components.OffcanvasTypes.End)

        // Set the body
        CanvasForm.setBody("Are you sure you want to delete this self assessment overview?<p></p>");

        // Set the footer
        Components.Tooltip({
            el: CanvasForm.BodyElement,
            content: "Click to delete the item.",
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
                            alert("There was an error deleting the item.\n\n" + err);

                            // Log
                            console.error("[" + Strings.ProjectName + "] Unable to delete overview item " + item.Title, item);
                        }
                    );
                }
            }
        });

        // Show the modal
        CanvasForm.show();
    }

    // build the custom form
    private static renderCustomForm() {
        jQuery('.formfield').each(function () {
            let fieldname = jQuery(this).attr('data-fieldname');
            let el = jQuery(this);
            jQuery('label#' + fieldname + '_label').each(function () {
                // get entire row of column for cleanup 
                let parentEl = jQuery(this).parent().parent();
                // move control and label
                jQuery(this).parent().contents().appendTo(el);
                // hide original parent element
                parentEl.hide();
            });
        });
    }

    // render status box on display form
    private static renderStatusBox(control: IFormControl){
        let elem: HTMLElement = document.createElement('div');
        elem.id = "assessmentBox";
        let val = control.getValue();
        elem.innerHTML = val;

        // Render the icon based on the value
        switch (val) {
            case "Green":
                elem.className = "bg-success text-white text-center"
                control.el.innerHTML = elem.outerHTML;
                break;
            case "Red":
                elem.className = "bg-danger text-white text-center"
                control.el.innerHTML = elem.outerHTML;
                break;
            case "Yellow":
                elem.className = "bg-warning text-dark text-center"
                control.el.innerHTML = elem.outerHTML;
                break;
        }
    }


    // print the self-assessment form in a friendly format
    private static printForm(title){

        let printStyle = `@media print {
            .form-label{font-size:large;font-weight:500}
            body{display:grid;grid-template-columns:1fr 1fr;font-size: small;font-family:'Segoe UI Web (West European)', Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif;}
            #headerArea{grid-column:1/3;padding:15px 0;}
            .col-6:not(.row){margin:2px;border:1px solid #bcbcbc;}
            .col-6.row{grid-column:1/3;display:grid;grid-template-columns: 75px 250px 250px 250px;height: max-content;}
            .cell-contents.formfield{padding:5px;}
            .col-md-3.offset-md-1{float:right;}
            .title-text{text-align:center;}
            .text-white{color:#fff;}
            .text-dark{color:#333;}
            .text-center{text-align: center;}
            .bg-danger{background-color:#dc3545;}
            .bg-warning{background-color:#ffc107;}
            .bg-success{background-color:#198754;}
            .p-2{padding:.5rem;}
            .m-2{margin:.5rem;}
        }`;

        // create the style element
        let elStyle = document.createElement("style");
        elStyle.innerHTML = printStyle;

        // open a new print window
        let printwin = window.open("");

        // generate the print dom
        printwin.document.title = `${title} -  Self Assessment Overview`;
        printwin.document.head.append(elStyle);
        printwin.document.body.innerHTML = document.getElementById("form-container").innerHTML;

        // stop the 
        printwin.stop();

        //remove input boxes
        printwin.document.querySelectorAll('input').forEach( box => { box.remove(); });

        //replace "program name" with actual program name
        printwin.document.getElementById('Title_label').innerHTML = title;

        //setTimeout(function(){printwin.print();},1000);
        printwin.print();
        printwin.close();
        
    }
}