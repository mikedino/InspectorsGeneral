"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * SharePoint Assets for the Echelon III sub-sites
 */
exports.Configuration = gd_sprest_bs_1.Helper.SPConfig({
    ListCfg: [
        {
            ListInformation: {
                Title: strings_1.default.Lists.CIProgramIdentification,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList
            },
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "Title", "applicable", "POC", "other", "Inspector", "Number", "nj4u"
                    ]
                }
            ],
            TitleFieldDisplayName: "Program",
            TitleFieldIndexed: true,
            TitleFieldUniqueValues: true,
            CustomFields: [
                {
                    name: "applicable",
                    title: "Applicable",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "Yes",
                    choices: [
                        "Yes", "No"
                    ]
                },
                {
                    name: "POC",
                    title: "Program Manager (PM)",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.User
                },
                {
                    name: "other",
                    title: "Other Inspections/Assessments",
                    description: "Provide Inspecting Organization and Most Recent Date Conducted",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "Inspector",
                    title: "Inspector",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.User
                },
                {
                    name: "Number",
                    title: "Number",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Number
                },
                {
                    name: "nj4u",
                    title: "Area",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "Command Programs",
                    choices: [
                        "Command Programs", "Missions, Functions, and Tasks"
                    ]
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    Default: true,
                    ViewQuery: "<OrderBy><FieldRef Name=\"nj4u\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy><Where><Eq><FieldRef Name=\"applicable\" /><Value Type=\"Text\">Yes</Value></Eq></Where>",
                    ViewFields: [
                        "LinkTitle", "applicable", "POC", "other", "Inspector"
                    ]
                },
                {
                    ViewName: "Not Applicable",
                    ViewQuery: "<OrderBy><FieldRef Name=\"nj4u\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy><Where><Eq><FieldRef Name=\"applicable\" /><Value Type=\"Text\">No</Value></Eq></Where>",
                    ViewFields: [
                        "LinkTitle", "applicable", "POC", "other", "Inspector"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.IndividualProgramInspectionReports,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList,
                Hidden: true
            },
            TitleFieldRequired: false,
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "approval",
                        "inspectorStatus",
                        "endOfDay",
                        "programLU",
                        "selfAssessment",
                        "inpsectorName",
                        "inspectionDate",
                        "processOwner",
                        "recordsReviewed",
                        "compliance",
                        "complianceJustification",
                        "effectiveness",
                        "effectivenessJustification",
                        "risk",
                        "riskJustification",
                        "challenges",
                        "bestPractices",
                        "narrative"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "approval",
                    title: "Inspection Manager Approval",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "Pending",
                    choices: [
                        "Pending", "Approved"
                    ]
                },
                {
                    name: "endOfDay",
                    title: "End Of Day",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "No",
                    choices: [
                        "Yes", "No"
                    ]
                },
                {
                    name: "inspectorStatus",
                    title: "Inspector Status",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "Working",
                    choices: [
                        "Working", "Complete"
                    ]
                },
                {
                    name: "programLU",
                    title: "Program/Process",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Lookup,
                    listName: strings_1.default.Lists.CIProgramIdentification,
                    showField: "Title"
                },
                {
                    name: "selfAssessment",
                    title: "Self-Assessment",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "Green",
                    format: gd_sprest_bs_1.SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                },
                {
                    name: "inpsectorName",
                    title: "Inspector Name",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.User
                },
                {
                    name: "inspectionDate",
                    title: "Inspection Date",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Date,
                    displayFormat: gd_sprest_bs_1.SPTypes.DateFormat.DateTime
                },
                {
                    name: "processOwner",
                    title: "Process Owner/Person(s) Interviewed",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.User,
                    multi: true,
                    selectionMode: gd_sprest_bs_1.SPTypes.FieldUserSelectionType.PeopleOnly
                },
                {
                    name: "recordsReviewed",
                    title: "Records Reviewed",
                    description: "List and provide number reviewed",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "compliance",
                    title: "Program/Process Compliance",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    format: gd_sprest_bs_1.SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                },
                {
                    name: "complianceJustification",
                    title: "Compliance Justification",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "effectiveness",
                    title: "Program/Process Effectiveness",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    format: gd_sprest_bs_1.SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                },
                {
                    name: "effectivenessJustification",
                    title: "Effectiveness Justification",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "risk",
                    title: "Program/Process Risk",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    format: gd_sprest_bs_1.SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                },
                {
                    name: "riskJustification",
                    title: "Risk Justification",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "challenges",
                    title: "Challenges/Barriers Identified by Program Manager",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.RichText
                },
                {
                    name: "bestPractices",
                    title: "Best Practices",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.RichText
                },
                {
                    name: "narrative",
                    title: "Report Narrative",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.RichText
                }
            ],
            ViewInformation: [
                {
                    ViewName: "Approved",
                    Default: true,
                    ViewQuery: "<OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy><Where><Eq><FieldRef Name=\"approval\" /><Value Type=\"Text\">Approved</Value></Eq></Where>",
                    ViewFields: [
                        "LinkTitle", "compliance", "effectiveness", "risk", "bestPractices", "inspectorStatus", "selfAssessment", "approval"
                    ]
                },
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy>",
                    ViewFields: [
                        "LinkTitle", "compliance", "effectiveness", "risk", "bestPractices", "inspectorStatus", "selfAssessment", "approval", "endOfDay"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.CommandInspectionChecklists,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList,
                Hidden: true
            },
            TitleFieldDisplayName: "Program",
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "QuestionNumber",
                        "Question",
                        "ResponseChoice",
                        "Response",
                        "Reference",
                        "ReferenceData",
                        "ReferenceDate",
                        "IsRecommendation",
                        "IsDeficiency",
                        "InspectorComments"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "MasterId",
                    title: "Master ID",
                    description: "Unique ID of the question from the master checklist",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Number
                },
                {
                    name: "QuestionNumber",
                    title: "Question Number",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Number,
                },
                {
                    name: "Question",
                    title: "Question",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.TextOnly
                },
                {
                    name: "ResponseChoice",
                    title: "Response Choice",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    choices: [
                        "Yes", "No", "N/A"
                    ]
                },
                {
                    name: "Response",
                    title: "Response",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.TextOnly
                },
                {
                    name: "Reference",
                    title: "ReferenceData",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text,
                },
                {
                    name: "ReferenceData",
                    title: "Reference Data",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text,
                },
                {
                    name: "ReferenceDate",
                    title: "Reference Date",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Date,
                    displayFormat: gd_sprest_bs_1.SPTypes.DateFormat.DateTime
                },
                {
                    name: "IsRecommendation",
                    title: "Is Recommendation",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                },
                {
                    name: "IsDeficiency",
                    title: "Is Deficiency",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                },
                {
                    name: "InspectorComments",
                    title: "Inspector Comments",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.RichText
                },
                {
                    name: "ObsoleteQuestion",
                    title: "Obsolete Question",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                },
                {
                    name: "na",
                    title: "N/A",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                },
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>",
                    ViewFields: [
                        "Program", "QuestionNumber", "Question", "Response", "ResponseChoice", "Reference", "ReferenceData", "ReferenceDate",
                        "IsDeficiency", "IsRecommendation", "na", "InspectorComments"
                    ]
                },
                {
                    ViewName: "Grouped",
                    Default: true,
                    ViewQuery: "<GroupBy Collapse=\"TRUE\" GroupLimit=\"50\"><FieldRef Name=\"Title\" /></GroupBy><OrderBy><FieldRef Name=\"QuestionNumber\" /></OrderBy>",
                    ViewFields: [
                        "Edit", "QuestionNumber", "Question", "Reference", "ReferenceData", "ReferenceDate", "ObsoleteQuestion",
                        "IsDeficiency", "IsRecommendation"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.Documents,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.DocumentLibrary
            },
            CustomFields: [
                {
                    name: "Details",
                    title: "Details",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.RichText
                },
                {
                    name: "Program",
                    title: "Program",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Lookup,
                    listName: strings_1.default.Lists.CIProgramIdentification,
                    showField: "Title",
                    required: true
                },
            ],
            ViewInformation: [
                {
                    ViewName: "All Documents",
                    Default: true,
                    ViewQuery: "<GroupBy Collapse=\"TRUE\" GroupLimit=\"30\"><FieldRef Name=\"Program\" /></GroupBy><OrderBy><FieldRef Name=\"FileLeafRef\" /></OrderBy>",
                    ViewFields: [
                        "DocIcon", "LinkFilename", "Title", "Modified", "Editor", "FileSizeDisplay", "CheckoutUser"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.InspectionSchedule,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.Events
            },
            CustomFields: [
                {
                    name: "ParticipantsPicker",
                    title: "Attendees",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.User,
                    selectionMode: gd_sprest_bs_1.SPTypes.FieldUserSelectionType.PeopleOnly
                },
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.ISR,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList,
                Hidden: true,
                EnableVersioning: true
            },
            TitleFieldRequired: false,
            TitleFieldDefaultValue: "NoTitle",
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "number",
                        "rtype",
                        "observation",
                        "status",
                        "reportedStatus",
                        "implementationStatus",
                        "ecd"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "number",
                    title: "No.",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Number,
                    description: "*Only Inspectors can modify*"
                },
                {
                    name: "rtype",
                    title: "Type Choice",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    description: "*Only Inspectors can modify*",
                    defaultValue: "",
                    choices: [
                        "Deficiency", "Recommendation"
                    ]
                },
                {
                    name: "observation",
                    title: "Observation",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    description: "*Only Inspectors can modify*",
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.TextOnly
                },
                {
                    name: "status",
                    title: "Status",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    description: "*Only Inspectors can modify*",
                    defaultValue: "Open",
                    choices: [
                        "Open", "Closed"
                    ]
                },
                {
                    name: "reportedStatus",
                    title: "Reported Status",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    description: "This status is modified by the inspected command",
                    defaultValue: "",
                    choices: [
                        "In progress", "Action complete"
                    ]
                },
                {
                    name: "implementationStatus",
                    title: "Current Implementation Status",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.TextOnly,
                    appendFl: true,
                },
                {
                    name: "ecd",
                    title: "Estimated Completion Date",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Date,
                    format: gd_sprest_bs_1.SPTypes.DateFormat.DateOnly
                },
                {
                    name: "reportLU",
                    title: "Program/Process",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Lookup,
                    listName: strings_1.default.Lists.IndividualProgramInspectionReports,
                    showField: "Title"
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    Default: true,
                    ViewQuery: "<GroupBy Collapse=\"FALSE\" GroupLimit=\"30\"><FieldRef Name=\"rtype\" /></GroupBy><OrderBy><FieldRef Name=\"number\" /><FieldRef Name=\"reportLU\" /></OrderBy>",
                    ViewFields: [
                        "number", "observation", "status", "reportedStatus", "implementationStatus", "ecd", "reportLU"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.OrgChart,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.DocumentLibrary
            },
            CustomFields: [
                {
                    name: "Details",
                    title: "Details",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.TextOnly
                },
            ],
            ViewInformation: [
                {
                    ViewName: "All Documents",
                    ViewQuery: "<OrderBy><FieldRef Name=\"FileLeafRef\" /></OrderBy>",
                    ViewFields: [
                        "DocIcon", "LinkFilename", "Details", "Modified", "Editor"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.SelfAssessmentOverview,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList
            },
            TitleFieldDisplayName: "Program Name",
            CustomFields: [
                {
                    name: "assessment",
                    title: "Program Manager Assessment",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Choice,
                    defaultValue: "Green",
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                },
                {
                    name: "policies",
                    title: "1. Policies/Guidelines",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.EnhancedRichText
                },
                {
                    name: "processes",
                    title: "2. Key Processes",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.EnhancedRichText
                },
                {
                    name: "successes",
                    title: "3. Program Successes",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.EnhancedRichText
                },
                {
                    name: "challenges",
                    title: "4. Program Challenges/Issues/Risks",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.EnhancedRichText
                },
                {
                    name: "indicators",
                    title: "5. Key Indicators (Metrics)",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.EnhancedRichText
                },
                {
                    name: "ofi",
                    title: "6. Opportunities for Improvement",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Note,
                    noteType: gd_sprest_bs_1.SPTypes.FieldNoteType.EnhancedRichText
                },
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    Default: true,
                    ViewQuery: "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>",
                    ViewFields: [
                        "LinkTitle", "assessment", "Author", "Created", "Editor", "Modified"
                    ]
                }
            ]
        }
    ]
});
