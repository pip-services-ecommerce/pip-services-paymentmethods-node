"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const pip_services3_commons_node_6 = require("pip-services3-commons-node");
const pip_services3_commons_node_7 = require("pip-services3-commons-node");
const pip_services3_commons_node_8 = require("pip-services3-commons-node");
const PaymentMethodV1Schema_1 = require("../data/version1/PaymentMethodV1Schema");
class PaymentMethodsCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        // Register commands to the database
        this.addCommand(this.makeGetPaymentMethodsCommand());
        this.addCommand(this.makeGetPaymentMethodByIdCommand());
        this.addCommand(this.makeCreatePaymentMethodCommand());
        this.addCommand(this.makeUpdatePaymentMethodCommand());
        this.addCommand(this.makeDeletePaymentMethodByIdCommand());
    }
    makeGetPaymentMethodsCommand() {
        return new pip_services3_commons_node_2.Command("get_payment_methods", new pip_services3_commons_node_5.ObjectSchema(true)
            .withOptionalProperty('filter', new pip_services3_commons_node_7.FilterParamsSchema())
            .withOptionalProperty('paging', new pip_services3_commons_node_8.PagingParamsSchema()), (correlationId, args, callback) => {
            let filter = pip_services3_commons_node_3.FilterParams.fromValue(args.get("filter"));
            let paging = pip_services3_commons_node_4.PagingParams.fromValue(args.get("paging"));
            this._logic.getPaymentMethods(correlationId, filter, paging, callback);
        });
    }
    makeGetPaymentMethodByIdCommand() {
        return new pip_services3_commons_node_2.Command("get_payment_method_by_id", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty('method_id', pip_services3_commons_node_6.TypeCode.String)
            .withRequiredProperty('customer_id', pip_services3_commons_node_6.TypeCode.String), (correlationId, args, callback) => {
            let methodId = args.getAsString("method_id");
            let customerId = args.getAsString("customer_id");
            this._logic.getPaymentMethodById(correlationId, methodId, customerId, callback);
        });
    }
    makeCreatePaymentMethodCommand() {
        return new pip_services3_commons_node_2.Command("create_payment_method", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty('method', new PaymentMethodV1Schema_1.PaymentMethodV1Schema()), (correlationId, args, callback) => {
            let method = args.get("method");
            this._logic.createPaymentMethod(correlationId, method, callback);
        });
    }
    makeUpdatePaymentMethodCommand() {
        return new pip_services3_commons_node_2.Command("update_payment_method", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty('method', new PaymentMethodV1Schema_1.PaymentMethodV1Schema()), (correlationId, args, callback) => {
            let method = args.get("method");
            this._logic.updatePaymentMethod(correlationId, method, callback);
        });
    }
    makeDeletePaymentMethodByIdCommand() {
        return new pip_services3_commons_node_2.Command("delete_payment_method_by_id", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty('method_id', pip_services3_commons_node_6.TypeCode.String)
            .withRequiredProperty('customer_id', pip_services3_commons_node_6.TypeCode.String), (correlationId, args, callback) => {
            let methodId = args.getAsNullableString("method_id");
            let customerId = args.getAsString("customer_id");
            this._logic.deletePaymentMethodById(correlationId, methodId, customerId, callback);
        });
    }
}
exports.PaymentMethodsCommandSet = PaymentMethodsCommandSet;
//# sourceMappingURL=PaymentMethodsCommandSet.js.map