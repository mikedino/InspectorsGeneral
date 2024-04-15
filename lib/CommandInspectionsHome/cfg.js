"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * Assets for the Command Inspections Home page rendering
 */
exports.Configuration = gd_sprest_bs_1.Helper.SPConfig({
    ListCfg: [
        {
            ListInformation: {
                Title: strings_1.default.Lists.Directory,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList
            },
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "Title",
                        "description",
                        "url",
                        "active"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "active",
                    title: "Active",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                },
                {
                    name: "description",
                    title: "Description",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "url",
                    title: "Site Url",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Url
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"Title\" /></OrderBy>",
                    ViewFields: ["Title", "description", "url", "active"]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.Contacts,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList
            },
            CustomFields: [
                {
                    name: "sortOrder",
                    title: "Sort Order",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                },
                {
                    name: "inspector",
                    title: "Inspector",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.User
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"sortOrder\" /></OrderBy>",
                    ViewFields: ["sortOrder", "Title", "inspector"]
                }
            ]
        },
        {
            ListInformation: {
                Title: strings_1.default.Lists.HomePageLinks,
                BaseTemplate: gd_sprest_bs_1.SPTypes.ListTemplateType.GenericList
            },
            CustomFields: [
                {
                    name: "url",
                    title: "URL",
                    type: gd_sprest_bs_1.Helper.SPCfgFieldType.Text
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>",
                    ViewFields: ["ID", "Title", "url"]
                }
            ]
        }
    ]
});
