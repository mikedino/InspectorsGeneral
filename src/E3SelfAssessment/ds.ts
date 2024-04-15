import { Components, Types, Web } from "gd-sprest-bs";
import { Export } from "./export";
import Strings from "../strings";


// Item
export interface IE3ChecklistItem extends Types.SP.ListItem {
    Question: string;
    QuestionNumber: number;
    Reference: string;
    ReferenceData: string;
    ReferenceDate: string;
    ResponseChoice: string;
    Response: string;
    na: boolean;
    IsDeficiency: boolean;
    IsRecommendation: boolean;
    InspectorComments: string;
}

// program identification (for self-assessment overview powerpoint slide)
export interface IProgramIdentification extends Types.SP.ListItem{}

/**
 * Data Source
 */
export class DataSource {

    // Initializes the application
    static init(): PromiseLike<any> {
        // Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the data
                this.load(),
                // Load program id data
                this.loadProgramIdItems(),
                // Initialize the export component
                Export.init()
            ]).then(resolve, reject);
        });
    }

    // Loads the list data
    private static _items: IE3ChecklistItem[] = null;
    private static _programs: Components.IDropdownItem[] = null;
    static get Items(): IE3ChecklistItem[] { return this._items; }
    static get Programs(): Components.IDropdownItem[] { return this._programs; }
    static load(): PromiseLike<IE3ChecklistItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // clear the array
            this._programs = [];

            // Load the data
            Web().Lists(Strings.Lists.CommandInspectionChecklists).Items().query({
                GetAllItems: true,
                OrderBy: ["QuestionNumber"],
                Select: ["*"],
                Top: 5000
            }).execute(
                // Success
                items => {


                    // Set the items
                    this._items = items.results as any;

                    // Parse the items and figure out the unique programs
                    let programs = {};
                    for (let i = 0; i < this._items.length; i++) {
                        // check if program has a value to prevent null programs in filters
                        let program = this._items[i]["Title"];
                        if (program) {
                            // Set the program
                            programs[program] = true;
                        }
                    }

                    // Parse the categories and generate the items
                    for (let program in programs) {
                        // Add the item
                        this._programs.push({
                            text: program
                        });
                    }

                    // Sort the programs array
                    this._programs = this._programs.sort((a, b) => {
                        if (a.text < b.text) { return -1; }
                        if (a.text > b.text) { return 1; }
                        return 0;
                    });

                    // Resolve the request
                    resolve(this._items);

                },
                // Error
                () => { reject(); }
            );

        });
    }
    static getItemsByProgram(program: string): Array<IE3ChecklistItem> {
        let items: Array<IE3ChecklistItem> = [];

        // Parse the items
        for (let i = 0; i < this.Items.length; i++) {
            let item = this.Items[i];

            // See if the program matches
            if (item.Title && item.Title == program) {
                // Add the item
                items.push(item);
            }
        }

        // Return the items
        return items;
    }

    // Loads the program identificaiton list data
    private static _programIdItems: IProgramIdentification[] = null;
    static get ProgramIdItems(): IProgramIdentification[] { return this._programIdItems; }
    static loadProgramIdItems(): PromiseLike<IProgramIdentification[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // clear the array
            this._programIdItems = [];

            // Load the data
            Web().Lists(Strings.Lists.CIProgramIdentification).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Select: ["*"],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._programIdItems = items.results as any;

                    // Resolve the request
                    resolve(this._items);

                },
                // Error
                () => { reject(); }
            );

        });
    }
    // gets the related program item for the selected program
    static getProgramByTitle(programText: string): IProgramIdentification {
        let pidItem: IProgramIdentification = null;

        if (this.Items) {
            // Parse the items
            for (let i = 0; i < this.ProgramIdItems.length; i++) {
                let item = this.ProgramIdItems[i];

                // See if the program matches
                if (item.Title && item.Title == programText) {
                    // Add the item
                    pidItem = item;
                }
            }
        }
        // Return the item
        return pidItem;
    }


    // Refreshes the application data
    static refresh(): PromiseLike<any> {
        // Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the data
                this.load(),
                // Load program id data
                this.loadProgramIdItems()
            ]).then(resolve, reject);
        });
    }
}