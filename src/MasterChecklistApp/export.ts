import { LoadingDialog } from "dattatable";
import { List, SPTypes, Types } from "gd-sprest-bs";
import * as moment from "moment";
import Strings from "../strings";

/**
 * Generates CSV data from the items
 */
export class Export {
    private static _fields: Array<Types.SP.Field> = null;
    private static _headers: Array<string> = null;

    // Generates the csv from the items
    private static generate(items: Array<any>) {
        let csv = [];

        // Add the header row
        csv.push('"' + this._headers.join('","') + '"');

        // Parse the items
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let row = [];

            // Parse the fields
            for (let j = 0; j < this._fields.length; j++) {
                let field = this._fields[j];
                let value = item[field.InternalName] || "";

                // See if this is a lookup field
                let lookupField = (field as Types.SP.FieldLookup).LookupField;
                if (lookupField) {
                    // Set the value
                    value = value[lookupField];
                }

                // See if this is a boolean
                if (typeof (value) === "boolean" || field.FieldTypeKind == SPTypes.FieldType.Boolean) {
                    // Update the value
                    value = value ? "Yes" : "No";
                }

                // See if this is a date/time field
                if (field.FieldTypeKind == SPTypes.FieldType.DateTime) {
                    // Determine the format
                    let format = "MM/DD/yyyy";
                    format += (field as Types.SP.FieldDateTime).DisplayFormat == SPTypes.DateFormat.DateTime ? " HH:mm:ss" : "";

                    // Update the value
                    value = moment(item.referenceDate).format(format);
                }

                // Add the field value
                row.push(value);
            }

            // Add the row
            csv.push('"' + row.join('","') + '"');
        }

        // Return the csv
        return csv.join('\n');
    }

    /**
     * Public Methods
     */

    // Generates the csv data
    static generateCSV(items: Array<any> = []) {
        // Show a loading dialog
        LoadingDialog.setHeader("Generating the CSV");
        LoadingDialog.setBody("This will close after the csv file is generated...");
        LoadingDialog.show();

        // Generate the data
        let csv = this.generate(items);

        // Close the dialog
        LoadingDialog.hide();

        // See if this is IE or Mozilla
        if (Blob && navigator && navigator["msSaveBlob"]) {
            // Download the file
            navigator["msSaveBlob"](new Blob([csv], { type: "data:text/csv;charset=utf-8;" }), "checklist_data.csv");
        } else {
            // Generate an anchor
            var anchor = document.createElement("a");
            anchor.download = "checklist_data.csv";
            anchor.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            anchor.target = "__blank";

            // Download the file
            anchor.click();
        }
    }

    // Initalizes the component
    static init(): PromiseLike<void> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Clear the fields & headers
            this._fields = [];
            this._headers = [];

            // Load the default fields
            List(Strings.Lists.Checklist).ContentTypes().query({ Top: 1, Expand: ["Fields"] }).execute(ct => {
                // Parse the default content type fields
                let fields = ct.results[0].Fields.results;
                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];

                    // Ignore the content type field
                    if (field.InternalName == "ContentType") { continue; }

                    // Add the field and header
                    this._fields.push(field);
                    this._headers.push(field.Title);
                }

                // Resolve the request
                resolve();
            }, reject);
        });
    }
}