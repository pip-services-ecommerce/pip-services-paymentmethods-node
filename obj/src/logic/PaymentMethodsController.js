"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const PaymentMethodsCommandSet_1 = require("./PaymentMethodsCommandSet");
class PaymentMethodsController {
    constructor() {
        this._dependencyResolver = new pip_services3_commons_node_2.DependencyResolver(PaymentMethodsController._defaultConfig);
    }
    configure(config) {
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired('persistence');
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new PaymentMethodsCommandSet_1.PaymentMethodsCommandSet(this);
        return this._commandSet;
    }
    getPaymentMethods(correlationId, filter, paging, callback) {
        this._persistence.getPageByFilter(correlationId, filter, paging, callback);
    }
    getPaymentMethodById(correlationId, id, customerId, callback) {
        this._persistence.getOneById(correlationId, id, (err, method) => {
            // Do not allow to access method of different customer
            if (method && method.customer_id != customerId)
                method = null;
            callback(err, method);
        });
    }
    createPaymentMethod(correlationId, method, callback) {
        method.create_time = new Date();
        method.update_time = new Date();
        this._persistence.create(correlationId, method, callback);
    }
    updatePaymentMethod(correlationId, method, callback) {
        let newCard;
        method.update_time = new Date();
        async.series([
            (callback) => {
                this._persistence.getOneById(correlationId, method.id, (err, data) => {
                    if (err == null && data && data.customer_id != method.customer_id) {
                        err = new pip_services3_commons_node_3.BadRequestException(correlationId, 'WRONG_CUST_ID', 'Wrong credit method customer id')
                            .withDetails('id', method.id)
                            .withDetails('customer_id', method.customer_id);
                    }
                    callback(err);
                });
            },
            (callback) => {
                this._persistence.update(correlationId, method, (err, data) => {
                    newCard = data;
                    callback(err);
                });
            }
        ], (err) => {
            callback(err, newCard);
        });
    }
    deletePaymentMethodById(correlationId, id, customerId, callback) {
        let oldCard;
        async.series([
            (callback) => {
                this._persistence.getOneById(correlationId, id, (err, data) => {
                    if (err == null && data && data.customer_id != customerId) {
                        err = new pip_services3_commons_node_3.BadRequestException(correlationId, 'WRONG_CUST_ID', 'Wrong credit method customer id')
                            .withDetails('id', id)
                            .withDetails('customer_id', customerId);
                    }
                    callback(err);
                });
            },
            (callback) => {
                this._persistence.deleteById(correlationId, id, (err, data) => {
                    oldCard = data;
                    callback(err);
                });
            }
        ], (err) => {
            if (callback)
                callback(err, oldCard);
        });
    }
}
exports.PaymentMethodsController = PaymentMethodsController;
PaymentMethodsController._defaultConfig = pip_services3_commons_node_1.ConfigParams.fromTuples('dependencies.persistence', 'pip-services-paymentmethods:persistence:*:*:1.0');
//# sourceMappingURL=PaymentMethodsController.js.map