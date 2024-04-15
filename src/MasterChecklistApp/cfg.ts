import { Helper, SPTypes } from "gd-sprest-bs";
import Strings from "../strings";

/**
 * SharePoint Assets for the Master checklist
 */
export const Configuration = Helper.SPConfig({
    ListCfg: [
        {
            ListInformation: {
                Title: Strings.Lists.Programs,
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            }
        },
        {
            ListInformation: {
                Title: Strings.Lists.Checklist,
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            },
            TitleFieldRequired: false,
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "program",
                        "questionNumber",
                        "question",
                        "reference",
                        "referenceData",
                        "referenceDate",
                        "obsoleteQuestion"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "program",
                    title: "Program",
                    type: Helper.SPCfgFieldType.Lookup,
                    listName: Strings.Lists.Programs,
                    showField: "Title",
                    required: true
                } as Helper.IFieldInfoLookup,
                {
                    name: "obsoleteQuestion",
                    title: "Obsolete Question",
                    type: Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0",
                    showInNewForm: false
                },
                {
                    name: "question",
                    title: "Question",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.TextOnly,
                    required: true
                } as Helper.IFieldInfoNote,
                {
                    name: "questionNumber",
                    title: "Question Number",
                    type: Helper.SPCfgFieldType.Number,
                    numberType: SPTypes.FieldNumberType.Integer,
                    required: true
                } as Helper.IFieldInfoNumber,
                {
                    name: "reference",
                    title: "Reference",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "referenceData",
                    title: "Reference Data",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "referenceDate",
                    title: "Reference Date",
                    type: Helper.SPCfgFieldType.Date,
                    displayFormat: SPTypes.DateFormat.DateOnly
                } as Helper.IFieldInfoDate
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"program\" /><FieldRef Name=\"questionNumber\" /></OrderBy><Where><Neq><FieldRef Name=\"obsoleteQuestion\" /><Value Type=\"Boolean\">1</Value></Neq></Where>",
                    ViewFields: [
                        "questionNumber", "question", "reference", "referenceDate", "referenceData", "obsoleteQuestion",
                    ]
                }
            ]
        }
    ]
});