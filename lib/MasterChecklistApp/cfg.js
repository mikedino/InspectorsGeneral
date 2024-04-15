"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * SharePoint Assets for the Master checklist
 */
exports.Configuration = gd_sprest_bs_1.Helper.SPConfig({
    ListCfg: [
        {
            ListInformation: {
                Title: strings_1.default.Lists.Programs,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList
            }
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.Checklist,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList
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
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Lookup,
                    listName: strings_1.default.Lists.Programs,
                    showField: "Title",
                    required: true
                },
                {
                    name: "obsoleteQuestion",
                    title: "Obsolete Question",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0",
                    showInNewForm: false
                },
                {
                    name: "question",
                    title: "Question",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.TextOnly,
                    required: true
                },
                {
                    name: "questionNumber",
                    title: "Question Number",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Number,
                    numberType: gd_sprest_bs_1.SPTypes.FieldNumberType.Integer,
                    required: true
                },
                {
                    name: "reference",
                    title: "Reference",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "referenceData",
                    title: "Reference Data",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "referenceDate",
                    title: "Reference Date",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Date,
                    displayFormat: gd_sprest_bs_1.SPTypes.DateFormat.DateOnly
                }
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
