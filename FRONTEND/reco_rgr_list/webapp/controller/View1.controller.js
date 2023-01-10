sap.ui.define([
  "sap/ui/core/mvc/Controller",
  'sap/ui/model/json/JSONModel',
  "sap/ui/model/Sorter",
  "sap/ui/Device",
  "sap/ui/core/ValueState",
  "sap/m/PDFViewer",
  "sap/ui/export/Spreadsheet",
  'sap/ui/core/Fragment',
  "sap/ui/table/TablePersoController",
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  'sap/m/MessageToast',
  'sap/m/Token',
  "sap/ui/table/RowAction",
  "sap/ui/table/RowActionItem",
  "sap/ui/export/Spreadsheet",
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Sorter, Device, ValueState, PDFViewer, Spreadsheet, Fragment, TablePersoController, Filter, FilterOperator, MessageToast, Token, RowAction, RowActionItem) {
    "use strict";

    return Controller.extend("recorgrlist.controller.View1", {
      onInit() {
        var that = this;
        document.title = that.get_i18n("tab_title");

        let version = this.getOwnerComponent().getManifestEntry("/sap.app/applicationVersion/version")

        that.getOwnerComponent().setModel(new JSONModel({ "version": version }), "appVersion")
        let sFragmentId = this.getView().createId("idFragmentMainTable");
        that._oTPC = new TablePersoController({

          table: sap.ui.core.Fragment.byId(sFragmentId, "table")
        });
        var fnPress = this.selectRowTable.bind(this);
        var oTemplate = new RowAction({
          items: [
            new RowActionItem({
              type: "Navigation",
              press: fnPress,
              visible: true
            })
          ]
        });
        sap.ui.core.Fragment.byId(sFragmentId, "table").setRowActionTemplate(oTemplate);
        // Cargas de dialogs generalizados 
        that.oLoader_app = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_cargando")
        });
        that.oLoader_detalle = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_cargando_detalle")
        });
        that.oLoader_datos = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_cargando_datos")
        });
        that.oLoader_pdf = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_cargando_pdf")
        });
        that.oLoader_requesting_data = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_cargando_detalle"),
          text: that.get_i18n("dialog_esperar")
        });
        that.oLoader_creando = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_creando"),
          text: that.get_i18n("dialog_esperar")
        });
        that.oLoader_actualizando = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_actualizando"),
          text: that.get_i18n("dialog_esperar")
        });
        that.oLoader_eliminando = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_eliminando"),
          text: that.get_i18n("dialog_esperar")
        });
        that.oLoader_aprobando = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_aprobando"),
          text: that.get_i18n("dialog_esperar")
        });
        that.oLoader_rechazando = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_rechazando"),
          text: that.get_i18n("dialog_esperar")
        });
        that.oLoader_validando = new sap.m.BusyDialog({
          showCancelButton: false,
          title: that.get_i18n("dialog_title_validando"),
          text: that.get_i18n("dialog_esperar")
        });
        this.oLoaderData = new sap.m.BusyDialog({
          showCancelButton: false,
          title: this._get_i18n("dialog_cargando")
        });
        that.oModelEdit = new JSONModel({
          busy: false,
          delay: 0
        });
        let oInfo = {
          countCR: 0,
          countCRVisible: 0,
          countRD: 0,
          visibleProcessSteps: false,
          no_rota: false,
          editableField: false
        }
        let oModel = new JSONModel(oInfo);
        this.getOwnerComponent().setModel(oModel, "infoModel");

        that.loaderModels()

        // let model_item_detail = new JSONModel([{Name:'01',desc:'status uno'}])
        // that.getOwnerComponent().setModel(model_item_detail, "model_item_detail")

        that.lista_comp_detail_pestana_1 = [
          "ps_btn_1", "ps_btn_2", "ps_btn_3",
          "ps_btn_4", "ps_in_11", "ps_in_12",
          "ps_in_13", "ps_in_21", "ps_in_22",
          "ps_in_23", "ps_in_31", "ps_in_32",
          "ps_in_33", "ps_in_41", "ps_in_42",
          "ps_in_43", "ro_in_1", "ro_in_2",
          "ro_in_3", "ro_in_4", "ro_in_5",
          "ro_in_6", "ro_in_7", "wa_in_1",
          "wa_in_2", "wa_in_3"]

        
        sFragmentId = this.getView().createId("idFragmentFilterBar");
        let oRepairTrackingNumber = sap.ui.core.Fragment.byId(sFragmentId, "idRepairTrackingNumber");
        var fnValidator = function (args) {
          var text = args.text.trim();
          const regex = /^[0-9]*$/;
          const flag = regex.test(text);
          if (flag) {
            if (text.length <= 10) {
              return new Token({ key: text, text: text });
            } else {
              MessageToast.show(that._get_i18n("dialog_msg_5"));
            }
          } else {
            MessageToast.show(that._get_i18n("dialog_msg_6"));
          }
        };
        oRepairTrackingNumber.addValidator(fnValidator);
        let oChangeOutPO = sap.ui.core.Fragment.byId(sFragmentId, "idChangeOutPO");
        oChangeOutPO.addValidator(fnValidator);
        fnValidator = function (args) {
          var text = args.text.trim();
          const regex = /^[0-9]*$/;
          const flag = regex.test(text);
          if (flag) {
            if (text.length <= 12) {
              return new Token({ key: text, text: text });
            } else {
              MessageToast.show(that._get_i18n("dialog_msg_7"));
            }
          } else {
            MessageToast.show(that._get_i18n("dialog_msg_6"));
          }
        };
        let oChangeOutOrderNumber = sap.ui.core.Fragment.byId(sFragmentId, "idChangeOutOrderNumber");
        oChangeOutOrderNumber.addValidator(fnValidator);
        let oROrderNumber = sap.ui.core.Fragment.byId(sFragmentId, "idROrderNumber");
        oROrderNumber.addValidator(fnValidator);
        let oCreatedBy = sap.ui.core.Fragment.byId(sFragmentId, "idCreatedBy");
        fnValidator = function (args) {
          var text = args.text.trim();
          const regex = /^[A-Za-z0-9Ññ\s]+$/;
          const flag = regex.test(text);
          if (flag) {
            if (text.length <= 12) {
              return new Token({ key: text, text: text });
            } else {
              MessageToast.show(that._get_i18n("dialog_msg_7"));
            }
          } else {
            MessageToast.show(that._get_i18n("dialog_msg_8"));
          }
        };
        oCreatedBy.addValidator(fnValidator);
      },
      //--------------------------------->FUNCIONES COMUNES<----------------------------------

      //Funcion para obtener el texto en el idioma que se requiere
      _get_i18n: function (key) {
        var oController = this;
        return oController.getOwnerComponent().getModel("i18n").getResourceBundle().getText(key);
      },
      _formatDate: function (date) {
        var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

        if (month.length < 2)
          month = '0' + month;
        if (day.length < 2)
          day = '0' + day;

        return [year, month, day].join('');
      },
      loaderModels: async function () {
        this.oLoaderData.open();
        // let flagMetadata = true;
        // flagMetadata = this.getOwnerComponent().getModel("MODEL_ZSC_WORKSPACE_SRV").oMetadata.bFailed
        // if (!flagMetadata) {
        // let sFragmentId = this.getView().createId("idFragmentFilterBar");
        // let oFilterBar = sap.ui.core.Fragment.byId(sFragmentId, "idFilterBar");
        // oFilterBar.setBlocked(false);
        await this.getRepairStatus();
        await this.getRepairType();
        await this.getCompCodeF4();
        await this.getPlanPlantF4();
        await this.getPlanGroupF4();
        await this.getPlantF4();
        // } else {
        //   let sFragmentId = this.getView().createId("idFragmentFilterBar");
        //   let oFilterBar = sap.ui.core.Fragment.byId(sFragmentId, "idFilterBar");
        //   oFilterBar.setBlocked(true);
        // }
        this.oLoaderData.close();
      },
      getRepairStatus: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/RepairStatusSet"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "repairStatusModel");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getRepairType: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/RepairTypeSet"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "repairTypeModel");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getCompCodeF4: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/CompCodeF4Set"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "compCodeF4Model");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getPlanPlantF4: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/PlanPlantF4Set"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "planPlantF4Model");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getPlanGroupF4: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/PlanGroupF4Set"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "planGroupF4Model");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getPlantF4: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/PlantF4Set"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "plantF4Model");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getWorkCenterF4: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/WorkCenterF4Set"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "workCenterF4Model");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getVendorF4: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/VendorF4Set"
        var filters = []
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "vendorF4Model");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getMaterials: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/Mat1wSet"
        var filters = [];
        let sFragmentId = this.getView().createId("idFragmentFilterBar");
        let oPlanningPlant = sap.ui.core.Fragment.byId(sFragmentId, "idPlanningPlant");
        if (oPlanningPlant.getSelectedKeys().length > 0) {
          let planningPlantFilter = [];
          oPlanningPlant.getSelectedKeys().forEach(planningPlant => {
            planningPlantFilter.push(new Filter("Werks", sap.ui.model.FilterOperator.EQ, planningPlant))
          });
          filters.push(new Filter({
            filters: planningPlantFilter,
            and: false
          }))
        }
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "materialModel");
            //console.log(data)
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      changePlant: function () {
        let sFragmentId = this.getView().createId("idFragmentFilterBar");
        let oPlanningPlant = sap.ui.core.Fragment.byId(sFragmentId, "idPlanningPlant");
        let oMaterial = sap.ui.core.Fragment.byId(sFragmentId, "idMaterial");
        oMaterial.setValue("");
        if (oPlanningPlant.getSelectedItems().length != 0) {
          oMaterial.setEnabled(true);
        } else {
          let oModel = new JSONModel();
          this.getOwnerComponent().setModel(oModel, "materialModel");
          oMaterial.setEnabled(false);
        }
      },
      getComponentRep: async function () {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/ZCompRepWbListSet"
        var filters = this.getFiltersBar();
        var oData = {};
        this.oLoaderData.open();
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            data.forEach(oCR => {
              delete oCR["__metadata"];
              for (const key in oCR) {
                if (oCR.hasOwnProperty(key)) {
                  if (typeof oCR[key] == "string") {
                    oCR[key] = oCR[key].trim();
                  }
                }
              }
            });
            this.dataBack = data;
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "componentRepModel");
            that.getOwnerComponent().getModel("infoModel").setProperty("/countCR", data.length);
            if (data.length > 10) {
              that.getOwnerComponent().getModel("infoModel").setProperty("/countCRVisible", 10);
            } else {
              that.getOwnerComponent().getModel("infoModel").setProperty("/countCRVisible", data.length);
            }
            this.filterStatus();
            //console.log(data)
          } else if (data[0].EX_RESULT == "E") {
            that._buildDialog(that._get_i18n("dialog_information"), "Information", data[0].EX_RESULT_DESC).open();
            let oModel = new JSONModel();
            that.getOwnerComponent().setModel(oModel, "componentRepModel");
            that.getOwnerComponent().getModel("infoModel").setProperty("/countCR", 0);
            that.getOwnerComponent().getModel("infoModel").setProperty("/countCRVisible", 0);
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
          this.oLoaderData.close();
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
          this.oLoaderData.close();
        }
      },
      getFiltersBar: function () {
        let filters = [];
        let sFragmentId = this.getView().createId("idFragmentFilterBar");
        //Component Repair Status
        let oComponentRepairStatus = sap.ui.core.Fragment.byId(sFragmentId, "idComponentRepairStatus");
        if (oComponentRepairStatus.getSelectedKeys().length > 0) {
          let statusFilter = [];
          oComponentRepairStatus.getSelectedKeys().forEach(status => {
            statusFilter.push(new Filter("Zcrstat", sap.ui.model.FilterOperator.EQ, status))
          });
          filters.push(new Filter({
            filters: statusFilter,
            and: false
          }))
        }
        //Component Repair Type
        let oComponentRepairType = sap.ui.core.Fragment.byId(sFragmentId, "idComponentRepairType");
        if (oComponentRepairType.getSelectedKeys().length > 0) {
          let typeFilter = [];
          oComponentRepairType.getSelectedKeys().forEach(type => {
            typeFilter.push(new Filter("Zcrtype", sap.ui.model.FilterOperator.EQ, type))
          });
          filters.push(new Filter({
            filters: typeFilter,
            and: false
          }))
        }
        //CP Tracking Number
        let oRepairTrackingNumber = sap.ui.core.Fragment.byId(sFragmentId, "idRepairTrackingNumber");
        if (oRepairTrackingNumber.getTokens().length > 0) {
          let rtNumberFilter = [];
          oRepairTrackingNumber.getTokens().forEach(rtNumber => {
            rtNumberFilter.push(new Filter("Zcrtn", sap.ui.model.FilterOperator.EQ, rtNumber.getText()))
          });
          filters.push(new Filter({
            filters: rtNumberFilter,
            and: false
          }))
        }
        //Change Out Order Number
        let oChangeOutOrderNumber = sap.ui.core.Fragment.byId(sFragmentId, "idChangeOutOrderNumber");
        if (oChangeOutOrderNumber.getTokens().length > 0) {
          let changeOutONFilter = [];
          oChangeOutOrderNumber.getTokens().forEach(changeOutON => {
            changeOutONFilter.push(new Filter("Zsoauf", sap.ui.model.FilterOperator.EQ, changeOutON.getText()))
          });
          filters.push(new Filter({
            filters: changeOutONFilter,
            and: false
          }))
        }
        //Refurbishemnt Order Number
        let oROrderNumber = sap.ui.core.Fragment.byId(sFragmentId, "idROrderNumber");
        if (oROrderNumber.getTokens().length > 0) {
          let rOrderNumberFilter = [];
          oROrderNumber.getTokens().forEach(rOrderNumber => {
            rOrderNumberFilter.push(new Filter("Zrfauf", sap.ui.model.FilterOperator.EQ, rOrderNumber.getText()))
          });
          filters.push(new Filter({
            filters: rOrderNumberFilter,
            and: false
          }))
        }
        //Change Out Purchase Order
        let oChangeOutPO = sap.ui.core.Fragment.byId(sFragmentId, "idChangeOutPO");
        if (oChangeOutPO.getTokens().length > 0) {
          let changeOutPOFilter = [];
          oChangeOutPO.getTokens().forEach(changeOutPO => {
            changeOutPOFilter.push(new Filter("Zsoebln", sap.ui.model.FilterOperator.EQ, changeOutPO.getText()))
          });
          filters.push(new Filter({
            filters: changeOutPOFilter,
            and: false
          }))
        }
        //Company Code
        let oCompanyCode = sap.ui.core.Fragment.byId(sFragmentId, "idCompanyCode");
        if (oCompanyCode.getSelectedKeys().length > 0) {
          let companyCodeFilter = [];
          oCompanyCode.getSelectedKeys().forEach(companyCode => {
            companyCodeFilter.push(new Filter("Bukrs", sap.ui.model.FilterOperator.EQ, companyCode))
          });
          filters.push(new Filter({
            filters: companyCodeFilter,
            and: false
          }))
        }
        //Planning Plant
        let oPlanningPlant = sap.ui.core.Fragment.byId(sFragmentId, "idPlanningPlant");
        if (oPlanningPlant.getSelectedKeys().length > 0) {
          let planningPlantFilter = [];
          oPlanningPlant.getSelectedKeys().forEach(planningPlant => {
            planningPlantFilter.push(new Filter("Iwerk", sap.ui.model.FilterOperator.EQ, planningPlant))
          });
          filters.push(new Filter({
            filters: planningPlantFilter,
            and: false
          }))
        }
        //Planner Group
        let oPlannerGroup = sap.ui.core.Fragment.byId(sFragmentId, "idPlannerGroup");
        if (oPlannerGroup.getSelectedKeys().length > 0) {
          let plannerGroupFilter = [];
          oPlannerGroup.getSelectedKeys().forEach(plannerGroup => {
            plannerGroupFilter.push(new Filter("Ingrp", sap.ui.model.FilterOperator.EQ, plannerGroup))
          });
          filters.push(new Filter({
            filters: plannerGroupFilter,
            and: false
          }))
        }
        //Main Work Center
        let oIMainWorkCenter = sap.ui.core.Fragment.byId(sFragmentId, "idIMainWorkCenter");
        if (oIMainWorkCenter.getValue() != "") {
          let mainWorkCenter = oIMainWorkCenter.getValue().split("-")[1].trim();
          filters.push(new sap.ui.model.Filter("Arbpl", sap.ui.model.FilterOperator.EQ, mainWorkCenter));
        }
        //Plant Work Center
        let oPlantWorkCenter = sap.ui.core.Fragment.byId(sFragmentId, "idPlantWorkCenter");
        if (oPlantWorkCenter.getSelectedKeys().length > 0) {
          let plantWorkCenterFilter = [];
          oPlantWorkCenter.getSelectedKeys().forEach(plantWorkCenter => {
            plantWorkCenterFilter.push(new Filter("Vawrk", sap.ui.model.FilterOperator.EQ, plantWorkCenter))
          });
          filters.push(new Filter({
            filters: plantWorkCenterFilter,
            and: false
          }))
        }
        //Mainteneance Plant
        let oMainteneancePlant = sap.ui.core.Fragment.byId(sFragmentId, "idMainteneancePlant");
        if (oMainteneancePlant.getSelectedKeys().length > 0) {
          let mainteneancePlantFilter = [];
          oMainteneancePlant.getSelectedKeys().forEach(mainteneancePlant => {
            mainteneancePlantFilter.push(new Filter("Swerk", sap.ui.model.FilterOperator.EQ, mainteneancePlant))
          });
          filters.push(new Filter({
            filters: mainteneancePlantFilter,
            and: false
          }))
        }
        //Material
        let oMaterial = sap.ui.core.Fragment.byId(sFragmentId, "idMaterial");
        if (oMaterial.getValue() != "") {
          let material = oMaterial.getValue().split("-")[1].trim();
          filters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, material));
        }
        //Desired Vendor
        let oIDesiredVendor = sap.ui.core.Fragment.byId(sFragmentId, "idIDesiredVendor");
        if (oIDesiredVendor.getValue() != "") {
          let desiredVendor = oIDesiredVendor.getValue().split("-")[1].trim();
          filters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, desiredVendor));
        }
        //Created By
        let oCreatedBy = sap.ui.core.Fragment.byId(sFragmentId, "idCreatedBy");
        if (oCreatedBy.getTokens().length > 0) {
          let createdByFilter = [];
          oCreatedBy.getTokens().forEach(createdBy => {
            createdByFilter.push(new Filter("Zernam", sap.ui.model.FilterOperator.EQ, createdBy.getText()))
          });
          filters.push(new Filter({
            filters: createdByFilter,
            and: false
          }))
        }
        //Created On
        let oCreatedOnFrom = sap.ui.core.Fragment.byId(sFragmentId, "idCreatedOnFrom");
        let oCreatedOnTo = sap.ui.core.Fragment.byId(sFragmentId, "idCreatedOnTo");
        if (oCreatedOnFrom.getValue() != "" && oCreatedOnTo.getValue() != "") {
          filters.push(new sap.ui.model.Filter("Zerdat", sap.ui.model.FilterOperator.BT, oCreatedOnFrom.getValue(), oCreatedOnTo.getValue()));
        }
        //Changed By
        let oChangedBy = sap.ui.core.Fragment.byId(sFragmentId, "idChangedBy");
        if (oChangedBy.getTokens().length > 0) {
          let ChangedByFilter = [];
          oChangedBy.getTokens().forEach(changedBy => {
            ChangedByFilter.push(new Filter("Zaenam", sap.ui.model.FilterOperator.EQ, changedBy.getText()))
          });
          filters.push(new Filter({
            filters: ChangedByFilter,
            and: false
          }))
        }
        //Changed On
        let oChangedOnFrom = sap.ui.core.Fragment.byId(sFragmentId, "idChangedOnFrom");
        let oChangedOnTo = sap.ui.core.Fragment.byId(sFragmentId, "idChangedOnTo");
        if (oChangedOnFrom.getValue() != "" && oChangedOnTo.getValue() != "") {
          filters.push(new sap.ui.model.Filter("Zaedat", sap.ui.model.FilterOperator.BT, oChangedOnFrom.getValue(), oChangedOnTo.getValue()));
        }
        return filters;
      },
      filterStatus: function () {
        let sFragmentId = this.getView().createId("idFragmentMainTable");
        let statusReIssued = sap.ui.core.Fragment.byId(sFragmentId, "idReIssued").getSelected();
        let statusWrongIssued = sap.ui.core.Fragment.byId(sFragmentId, "idWrongIssued").getSelected();
        let statusCancelled = sap.ui.core.Fragment.byId(sFragmentId, "idCancelled").getSelected();
        let statusPrinted = sap.ui.core.Fragment.byId(sFragmentId, "idPrinted").getSelected();
        let statusRePrinted = sap.ui.core.Fragment.byId(sFragmentId, "idRePrinted").getSelected();
        let oTable = sap.ui.core.Fragment.byId(sFragmentId, "table")
        if (!statusReIssued && !statusWrongIssued && !statusCancelled && !statusPrinted && !statusRePrinted) {
          oTable.mBindingInfos.rows.binding.iLength = this.dataBack.length;
          this.getOwnerComponent().getModel("componentRepModel").setData(this.dataBack);
          this.getOwnerComponent().getModel("infoModel").setProperty("/countCR", this.dataBack.length);
          if (this.dataBack.length > 10) {
            this.getOwnerComponent().getModel("infoModel").setProperty("/countCRVisible", 10);
          } else {
            this.getOwnerComponent().getModel("infoModel").setProperty("/countCRVisible", this.dataBack.length);
          }
        } else {
          let data = oTable.getBinding().oList;
          let oCRsNew = [];
          this.dataBack.forEach(oCR => {
            if (statusReIssued) {
              if (oCR.Zreiss) {
                oCRsNew.push(oCR);
              }
            }
            if (statusWrongIssued) {
              if (oCR.Zwriss) {
                oCRsNew.push(oCR);
              }
            }
            if (statusCancelled) {
              if (oCR.Zcanc) {
                oCRsNew.push(oCR);
              }
            }
            if (statusPrinted) {
              if (!(oCR.Zprtd)) {
                oCRsNew.push(oCR);
              }
            }
            if (statusRePrinted) {
              if (!(oCR.Zrprt)) {
                oCRsNew.push(oCR);
              }
            }
          });
          oCRsNew = [...new Set(oCRsNew)];
          oTable.mBindingInfos.rows.binding.iLength = oCRsNew.length;
          this.getOwnerComponent().getModel("componentRepModel").setData(oCRsNew);
          this.getOwnerComponent().getModel("infoModel").setProperty("/countCR", oCRsNew.length);
          if (oCRsNew.length > 10) {
            this.getOwnerComponent().getModel("infoModel").setProperty("/countCRVisible", 10);
          } else {
            this.getOwnerComponent().getModel("infoModel").setProperty("/countCRVisible", oCRsNew.length);
          }
          if (oCRsNew.length == 0 && this.dataBack.length != 0) {
            this._buildDialog(this._get_i18n("dialog_information"), "Information", this._get_i18n("dialog_msg_9")).open();
          }
        }

      },
      display_detail: async function () {
        this.oLoaderData.open();
        var that = this;
        this.getView().byId("btn_edit").setVisible(true)
        this.getView().byId("btn_display").setVisible(false)
        this.getView().byId("btn_save").setVisible(false)
        this.getOwnerComponent().getModel("infoModel").setProperty("/editableField", false);
        await this.getScrElementAttr(this.oItemSelected["Zcrtn"], this.oItemSelected["Zcrtnv"], "");
        // that.disable_comp(that.lista_comp_detail_pestana_1)
        this.oLoaderData.close();
      },
      edit_detail: async function () {
        this.oLoaderData.open();
        var that = this;
        this.getView().byId("btn_edit").setVisible(false)
        this.getView().byId("btn_display").setVisible(true)
        this.getView().byId("btn_save").setVisible(true)
        this.getOwnerComponent().getModel("infoModel").setProperty("/editableField", true);
        await this.getScrElementAttr(this.oItemSelected["Zcrtn"], this.oItemSelected["Zcrtnv"], "X");
        this.oLoaderData.close();
        // that.enable_comp(that.lista_comp_detail_pestana_1)
      },
      enable_comp: function (list) {
        var that = this;
        for (const name of list) {
          this.getView().byId(name).setEnabled(true)
        }
      },
      disable_comp: function (list) {
        var that = this;
        for (const name of list) {
          this.getView().byId(name).setEnabled(false)
        }
      },
      /** FUNCIONES BASE */
      get_i18n: function (key) {
        var that = this;
        return that.getOwnerComponent().getModel("i18n").getResourceBundle().getText(key);
      },
      i18nComboBox: function (v) {
        var that = this;
        return (v != null ? that.get_i18n(v) : "");
      },
      handleNav_back: async function (oEvent) {
        var that = this;
        var navCon = that.byId("navCon");
        navCon.to(that.byId("page1"), "slide");
        this.byId("idDynamicPageHeader").setVisible(true);
      },
      onPersoButtonPressed: function () {
        this._oTPC.openDialog();
      },
      onExit: function () {
        var oController = this;
        if (oController._oTPC) {
          oController._oTPC.destroy();
        }
      },
      _buildDialog: function (_title, _state, _text) {
        var that = this;
        var dialog = new sap.m.Dialog({
          title: _title,
          type: 'Message',
          state: _state,
          content: new sap.m.Text({
            text: _text
          }),
          beginButton: new sap.m.Button({
            text: that.get_i18n("aceptar"),
            press: function () {
              dialog.close();
            }
          }),
          afterClose: function () {
            // that.reiniciarFormulario();
            dialog.destroy();
          }
        });
        return dialog;
      },
      _confirmDialog: function (_title, _state, _text, _action) {
        var that = this;
        that.oDialog = new sap.m.Dialog({
          title: _title,
          type: 'Message',
          state: _state,
          content: new sap.m.Text({
            text: _text
          }),

          buttons: [new sap.m.Button({
            text: that.get_i18n("aceptar"),
            press: function () {
              switch (_action) {
                case "GENERAR_GUIA":
                  that._crear();
                  break;
                case "EMITIR_GUIA":
                  that._emitirGuia()
                  break;
                case "SOLICITAR_EMISION":
                  that._solicitarEmisionGuia()
                  break;
                case "EDITAR_GUIA":
                  that._editar()
                  break;
                case "COPIAR_GUIA":
                  that._crear();    //llamamos a crear porque la copia equivale a lo mismo que crear de cero                           
                  break;
                case "ANULAR_GUIA":
                  that._anularGuia()
                  break;
                case "crear_destinatario":
                  that._crearDestinatario()
                  break;
                case "crear_direccion_destinatario":
                  that._crearDireccionDestinatario()
                  break;
                case "crear_transportista":
                  that._crearTransportista()
                  break;
                case "crear_chofer":
                  that._crearChofer()
                  break;

                case "ELIMINAR":
                  that._eliminar()
                  break;
              }
              that.oDialog.close();
            }
          }), new sap.m.Button({
            text: that.get_i18n("cancelar"),
            press: function () {
              that.oDialog.close();
            }
          })],
          afterClose: function () {
            // that.reiniciarFormulario();
            that.oDialog.destroy();
          }
        });
        return that.oDialog;
      },
      RequestSAPGETPromise: function (Model, filters, service, oData) {
        if (this.statusCode != 401) {
          return new Promise(function (resolve, reject) {
            Model.setUseBatch(false)
            Model.read(service, {
              filters: [filters],
              async: false,
              success: function (oRespon, response) {
                resolve(oRespon.results)
              },
              error: function (oError) {
                reject(oError)
              }
            })
          })
        } else {
          return "E"
        }
      },
      RequestSAPGETPromiseEntity: function (Model, filters, service, oData) {
        if (this.statusCode != 401) {
          return new Promise(function (resolve, reject) {
            Model.setUseBatch(false)
            Model.read(service + filters, {
              filters: [],
              async: false,
              success: function (oRespon, response) {
                resolve(oRespon)
              },
              error: function (oError) {
                reject(oError)
              }
            })
          })
        } else {
          return "E"
        }
      },
      RequestSAPPOSTPromise: function (Model, service, oData) {
        return new Promise(function (resolve, reject) {
          Model.setUseBatch(false);
          Model.create(service, oData, {
            async: true,
            success: function (oRespon, response) {
              resolve(oRespon);
            },
            error: function (oError) {
              reject(oError);
            }
          })
        })
      },
      getData: function () {

      },
      handleValueHelpWorkCenter: async function (oEvent) {
        var oView = this.getView();
        this._sInputId = oEvent.getSource().getId();
        this.oLoaderData.open();
        await this.getWorkCenterF4();
        this.oLoaderData.close();
        // create value help dialog
        if (!this._pValueHelpDialogWorkCenter) {
          this._pValueHelpDialogWorkCenter = Fragment.load({
            id: oView.getId(),
            name: "recorgrlist.fragments.mainWorkCenter",
            controller: this
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }

        // open value help dialog
        this._pValueHelpDialogWorkCenter.then(function (oValueHelpDialog) {
          oValueHelpDialog.open();
        });
      },
      _handleValueHelpSearchWorkCenter: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter({
          filters: [
            new Filter("Ktext", FilterOperator.Contains, sValue),
            new Filter("Arbpl", FilterOperator.Contains, sValue)
          ],
          and: false
        })
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },

      _handleValueHelpClose: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem");
        if (oSelectedItem) {
          var productInput = this.byId(this._sInputId);
          productInput.setValue(oSelectedItem.getTitle() + " - " + oSelectedItem.getDescription());
        }
        oEvent.getSource().getBinding("items").filter([]);
      },
      handleValueHelpDesiredVendor: async function (oEvent) {
        var oView = this.getView();
        this._sInputId = oEvent.getSource().getId();
        this.oLoaderData.open();
        await this.getVendorF4();
        this.oLoaderData.close();
        // create value help dialog
        if (!this._pValueHelpDialogDesiredVendor) {
          this._pValueHelpDialogDesiredVendor = Fragment.load({
            id: oView.getId(),
            name: "recorgrlist.fragments.desiredVendor",
            controller: this
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }

        // open value help dialog
        this._pValueHelpDialogDesiredVendor.then(function (oValueHelpDialog) {
          oValueHelpDialog.open();
        });
      },
      _handleValueHelpSearchDesiredVendor: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter({
          filters: [
            new Filter("Lifnr", FilterOperator.Contains, sValue),
            new Filter("Loevm", FilterOperator.Contains, sValue)
          ],
          and: false
        })
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },
      handleValueHelpMaterial: async function (oEvent) {
        var oView = this.getView();
        this._sInputId = oEvent.getSource().getId();
        this.oLoaderData.open();
        await this.getMaterials();
        this.oLoaderData.close();
        // create value help dialog
        if (!this._pValueHelpDialogMaterial) {
          this._pValueHelpDialogMaterial = Fragment.load({
            id: oView.getId(),
            name: "recorgrlist.fragments.material",
            controller: this
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }

        // open value help dialog
        this._pValueHelpDialogMaterial.then(function (oValueHelpDialog) {
          oValueHelpDialog.open();
        });
      },
      _handleValueHelpSearchMaterial: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter({
          filters: [
            new Filter("Maktg", FilterOperator.Contains, sValue),
            new Filter("Matnr", FilterOperator.Contains, sValue)
          ],
          and: false
        })
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },
      selectRowTable: async function (oEvent) {
        var navCon = this.byId("navCon");
        navCon.to(this.byId("page2"), "slide");
        this.byId("idDynamicPageHeader").setVisible(false);
        let sPath = oEvent.getSource().getBindingContext("componentRepModel").getPath();
        let oItemSelected = this.getOwnerComponent().getModel("componentRepModel").getProperty(sPath);
        this.oItemSelected = oItemSelected;
        this.oLoaderData.open();
        await this.getCompRepDet(this.oItemSelected["Zcrtn"], this.oItemSelected["Zcrtnv"]);
        await this.getCompRepExtRef(this.oItemSelected["Zcrtn"], this.oItemSelected["Zcrtnv"]);
        await this.getInspNote(this.oItemSelected["Zcrtn"], this.oItemSelected["Zcrtnv"]);
        this.oLoaderData.close();
        this.display_detail();
        if (oItemSelected.Zcrtype == "ROTA") {
          this.getOwnerComponent().getModel("infoModel").setProperty("/titleDetail", this.get_i18n("DISPLAY_ROTABLE_COMPONENT_REPAIR"));
          this.getOwnerComponent().getModel("infoModel").setProperty("/visibleProcessSteps", true);
          this.getOwnerComponent().getModel("infoModel").setProperty("/no_rota", false);
        } else if (oItemSelected.Zcrtype == "REPR") {
          this.getOwnerComponent().getModel("infoModel").setProperty("/titleDetail", this.get_i18n("DISPLAY_NOROTABLE_COMPONENT_REPAIR"));
          this.getOwnerComponent().getModel("infoModel").setProperty("/visibleProcessSteps", false);
          this.getOwnerComponent().getModel("infoModel").setProperty("/no_rota", true);
        }
        // let refDocuments = [
        //   {
        //     name: this.get_i18n("returnReservation"),
        //     refDN: oItemSelected["Zsorsn"],
        //     refD: "Pending"
        //   },
        //   {
        //     name: this.get_i18n("changeOutOrder"),
        //     refDN: oItemSelected["Zsoauf"],
        //     refD: oItemSelected["Zsoktext"]
        //   },
        //   {
        //     name: this.get_i18n("changeOutOrderPR"),
        //     refDN: oItemSelected["Zsobnfn"],
        //     refD: "Pending"
        //   },
        //   {
        //     name: this.get_i18n("changeOutOrderPO"),
        //     refDN: oItemSelected["Zsoebln"],
        //     refD: "Pending"
        //   },
        //   {
        //     name: this.get_i18n("refurbishmentOrder"),
        //     refDN: oItemSelected["Zrfauf"],
        //     refD: "Pending"
        //   },
        //   {
        //     name: this.get_i18n("refurbishmentOrderPR"),
        //     refDN: oItemSelected["Zrfbnfn"],
        //     refD: "Pending"
        //   },
        //   {
        //     name: this.get_i18n("refurbishmentOrderPO"),
        //     refDN: oItemSelected["Zrfebln"],
        //     refD: "Pending"
        //   },
        //   {
        //     name: this.get_i18n("requestQuotation"),
        //     refDN: oItemSelected["Anfnr"],
        //     refD: "Pending"
        //   },
        //   {
        //     name: this.get_i18n("serviceEntrySheet"),
        //     refDN: "Pending",
        //     refD: "Pending"
        //   }
        // ];
        // let oModelRD = new JSONModel();
        // this.getOwnerComponent().setModel(oModelRD, "refDocumentsModel");
        // this.getOwnerComponent().getModel("infoModel").setProperty("/countRD", refDocuments.length);
        let oModel = new JSONModel(oItemSelected);
        // this.getOwnerComponent().setModel(oModel, "itemDetailModel");

      },
      getScrElementAttr: async function (In_Zcrtn, In_Zcrtnv, In_EditMode) {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/ScrElementAttrSet"
        var filters = [
          new sap.ui.model.Filter("In_Zcrtn", sap.ui.model.FilterOperator.EQ, In_Zcrtn),
          new sap.ui.model.Filter("In_Zcrtnv", sap.ui.model.FilterOperator.EQ, In_Zcrtnv),
          // new sap.ui.model.Filter("In_ScrGrp1", sap.ui.model.FilterOperator.EQ, ),
          new sap.ui.model.Filter("In_EditMode", sap.ui.model.FilterOperator.EQ, In_EditMode),
        ]
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].Ex_Result_Code == "S") {
            //Response Ok
            console.log(data)
            data.forEach(field => {
              if (field.Ex_Active == "1") {
                that.getOwnerComponent().getModel("infoModel").setProperty("/" + field.Ex_ScrGrp1, true);
              } else {
                that.getOwnerComponent().getModel("infoModel").setProperty("/" + field.Ex_ScrGrp1, false);
              }
            });
            // let oModel = new JSONModel(data);
            // oModel.setSizeLimit(100000);
            // that.getOwnerComponent().setModel(oModel, "vendorF4Model");
            //console.log(data)
          } else if (data[0].Ex_Result_Code == "E") {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", data[0].Ex_Result_Desc).open();
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getCompRepDet: async function (In_Zcrtn, In_Zcrtnv) {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/CompRepDetSet"
        var filters = "(Zcrtn='" + In_Zcrtn + "',Zcrtnv='" + In_Zcrtnv + "')"
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromiseEntity(model, filters, service, oData);
          if (data.EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "itemDetailModel");
            //console.log(data)
          } else if (data.EX_RESULT == "E") {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", data[0].EX_RESULT_DESC).open();
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getCompRepExtRef: async function (In_Zcrtn, In_Zcrtnv) {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/CompRepExtRefSet"
        var filters = [
          new sap.ui.model.Filter("Zcrtn", sap.ui.model.FilterOperator.EQ, In_Zcrtn),
          new sap.ui.model.Filter("Zcrtnv", sap.ui.model.FilterOperator.EQ, In_Zcrtnv),
        ]
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            let oModel = new JSONModel(data);
            oModel.setSizeLimit(100000);
            that.getOwnerComponent().setModel(oModel, "refDocumentsModel");
            this.getOwnerComponent().getModel("infoModel").setProperty("/countRD", data.length);
            //console.log(data)
          } else if (data[0].Ex_Result_Code == "E") {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", data[0].EX_RESULT_DESC).open();
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      getInspNote: async function (In_Zcrtn, In_Zcrtnv) {
        var that = this
        var model = that.getOwnerComponent().getModel("MODEL_ZGEAM_COMP_REPAIR_WORKBENCH_SRV");
        var service = "/InspNoteSet"
        var filters = [
          new sap.ui.model.Filter("Zcrtn", sap.ui.model.FilterOperator.EQ, In_Zcrtn),
          new sap.ui.model.Filter("Zcrtnv", sap.ui.model.FilterOperator.EQ, In_Zcrtnv),
        ]
        var oData = {};
        try {
          let data = await that.RequestSAPGETPromise(model, filters, service, oData);
          if (data[0].EX_RESULT == "S") {
            //Response Ok
            console.log(data)
            // let oModel = new JSONModel(data);
            // oModel.setSizeLimit(100000);
            // that.getOwnerComponent().setModel(oModel, "vendorF4Model");
            //console.log(data)
          } else if (data[0].EX_RESULT == "E") {
            console.log(data[0].EX_RESULT_DESC)
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", data[0].EX_RESULT_DESC).open();
          } else if (data == "E") {
            // that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_10")).open();
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service).open();
          }
        } catch (e) {
          //Response Error
          that.oLoader_validando.close()
          console.log(e)
          //that.resetModels()
          if (e.statusCode == 401) {
            this.statusCode = 401
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_4")).open()
          } else {
            that._buildDialog(that._get_i18n("dialog_error"), "Error", that._get_i18n("dialog_msg_2") + service + that._get_i18n("dialog_msg_2_1")).open()
          }
        }
      },
      exportWorksheet: function () {
        var oController = this;
        var oTable_ = this.byId("idTableRFQ"); //Aqui pone tu tabla!!!
        var list = Object.keys(oTable_.getModel("componentRepModel").getData()[0]);
        var aColumns = [];
        oTable_.getColumns().forEach(column => {
            if(column.getTemplate().mBindingInfos.text != undefined){
                aColumns.push({
                    label: column.getLabel().getText(),
                    property: column.getTemplate().mBindingInfos.text.parts[0].path
                });
            }                 
        });
        var data = oTable_.getModel("componentRepModel").getData();
        var array = [];
        for (var index in data) {
            if (typeof data[index] == "object") {
                if (data[index].KEY) {
                    data[index] = data[index].KEY
                }
            } else {
                data[index] = data[index]
            }
        }
        for (var index in data) {
            array.push(data[index]);
        }

        var mSettings = {
            workbook: {
                columns: aColumns
            },
            dataSource: array,
            fileName: "Template.xlsx"
        };
        var oSpreadsheet = new Spreadsheet(mSettings);
        oSpreadsheet.build();
    },
    });
  }
);