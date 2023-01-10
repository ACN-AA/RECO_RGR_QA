sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/ValueState",
    "sap/m/PDFViewer",
    "sap/ui/export/Spreadsheet",
    'sap/ui/core/Fragment',
    "sap/ui/table/TablePersoController"
  ],
  function (BaseController, JSONModel, Sorter, Device, ValueState, PDFViewer, Spreadsheet, Fragment, TablePersoController) {
    "use strict";

    return BaseController.extend("recorgrlist.controller.App", {
    });
  }
);
