"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const PaymentMethodTypeV1_1 = require("../data/version1/PaymentMethodTypeV1");
const StripeCardsConnector_1 = require("./stripe/StripeCardsConnector");
const StripeBankAccountsConnector_1 = require("./stripe/StripeBankAccountsConnector");
const StripeExternalCardsConnector_1 = require("./stripe/StripeExternalCardsConnector");
const StripeExternalBankAccountsConnector_1 = require("./stripe/StripeExternalBankAccountsConnector");
class PaymentMethodsStripePersistence {
    constructor() {
        this._stripeCardsConnector = new StripeCardsConnector_1.StripeCardsConnector();
        this._stripeBankAccountsConnector = new StripeBankAccountsConnector_1.StripeBankAccountsConnector();
        this._stripeExternalCardsConnector = new StripeExternalCardsConnector_1.StripeExternalCardsConnector();
        this._stripeExternalBankAccountsConnector = new StripeExternalBankAccountsConnector_1.StripeExternalBankAccountsConnector();
    }
    configure(config) {
        if (this._stripeCardsConnector)
            this._stripeCardsConnector.configure(config);
        if (this._stripeBankAccountsConnector)
            this._stripeBankAccountsConnector.configure(config);
        if (this._stripeExternalCardsConnector)
            this._stripeExternalCardsConnector.configure(config);
        if (this._stripeExternalBankAccountsConnector)
            this._stripeExternalBankAccountsConnector.configure(config);
    }
    setReferences(references) {
        if (this._stripeCardsConnector)
            this._stripeCardsConnector.setReferences(references);
        if (this._stripeBankAccountsConnector)
            this._stripeBankAccountsConnector.setReferences(references);
        if (this._stripeExternalCardsConnector)
            this._stripeExternalCardsConnector.setReferences(references);
        if (this._stripeExternalBankAccountsConnector)
            this._stripeExternalBankAccountsConnector.setReferences(references);
    }
    isOpen() {
        var _a, _b, _c, _d;
        return ((_a = this._stripeCardsConnector) === null || _a === void 0 ? void 0 : _a.isOpen()) || ((_b = this._stripeBankAccountsConnector) === null || _b === void 0 ? void 0 : _b.isOpen())
            || ((_c = this._stripeExternalCardsConnector) === null || _c === void 0 ? void 0 : _c.isOpen())
            || ((_d = this._stripeExternalBankAccountsConnector) === null || _d === void 0 ? void 0 : _d.isOpen());
    }
    open(correlationId, callback) {
        async.series([
            // create stripe cards connector
            (callback) => {
                this._stripeCardsConnector.open(correlationId, (err) => {
                    callback(err);
                });
            },
            // create stripe bank accounts connector
            (callback) => {
                this._stripeBankAccountsConnector.open(correlationId, (err) => {
                    callback(err);
                });
            },
            // create stripe external cards connector
            (callback) => {
                this._stripeExternalCardsConnector.open(correlationId, (err) => {
                    callback(err);
                });
            },
            // create stripe external bank accounts connector
            (callback) => {
                this._stripeExternalBankAccountsConnector.open(correlationId, (err) => {
                    callback(err);
                });
            },
        ], callback);
    }
    close(correlationId, callback) {
        async.series([
            // close stripe cards connector
            (callback) => {
                this._stripeCardsConnector.close(correlationId, (err) => {
                    this._stripeCardsConnector = null;
                    callback(err);
                });
            },
            // close stripe bank accounts connector
            (callback) => {
                this._stripeBankAccountsConnector.close(correlationId, (err) => {
                    this._stripeBankAccountsConnector = null;
                    callback(err);
                });
            },
            // close stripe external cards connector
            (callback) => {
                this._stripeExternalCardsConnector.close(correlationId, (err) => {
                    this._stripeExternalCardsConnector = null;
                    callback(err);
                });
            },
            // close stripe external accounts connector
            (callback) => {
                this._stripeExternalBankAccountsConnector.close(correlationId, (err) => {
                    this._stripeExternalBankAccountsConnector = null;
                    callback(err);
                });
            },
        ], callback);
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        let pageSize = 100;
        Promise.all([
            this._stripeCardsConnector.getPageByFilterAsync(correlationId, filter, new pip_services3_commons_node_1.PagingParams(0, pageSize)),
            this._stripeBankAccountsConnector.getPageByFilterAsync(correlationId, filter, new pip_services3_commons_node_1.PagingParams(0, pageSize)),
            this._stripeExternalCardsConnector.getPageByFilterAsync(correlationId, filter, new pip_services3_commons_node_1.PagingParams(0, pageSize)),
            this._stripeExternalBankAccountsConnector.getPageByFilterAsync(correlationId, filter, new pip_services3_commons_node_1.PagingParams(0, pageSize))
        ]).then(pages => {
            let methods = [];
            pages.forEach(page => methods = methods.concat(...page.data));
            if (callback)
                callback(null, this.buildPageByFilter(correlationId, filter, paging, methods));
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    getById(correlationId, id, customerId, callback) {
        Promise.all([
            this._stripeCardsConnector.getByIdAsync(correlationId, id, customerId),
            this._stripeBankAccountsConnector.getByIdAsync(correlationId, id, customerId),
            this._stripeExternalCardsConnector.getByIdAsync(correlationId, id, customerId),
            this._stripeExternalBankAccountsConnector.getByIdAsync(correlationId, id, customerId)
        ]).then(methods => {
            var _a;
            if (callback)
                callback(null, (_a = methods) === null || _a === void 0 ? void 0 : _a.find(x => x != null));
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    create(correlationId, item, callback) {
        var connector = this.getConnectorByType(item);
        if (connector == null) {
            callback(new pip_services3_commons_node_3.BadRequestException(correlationId, 'ERR_PAYMENT_TYPE', 'Payment type not supported')
                .withDetails('item.type', item.type), null);
            return;
        }
        connector.createAsync(correlationId, item).then(method => {
            if (callback)
                callback(null, method);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    update(correlationId, item, callback) {
        var connector = this.getConnectorByType(item);
        if (connector == null) {
            callback(new pip_services3_commons_node_3.BadRequestException(correlationId, 'ERR_PAYMENT_TYPE', 'Payment type not supported')
                .withDetails('item.type', item.type), null);
            return;
        }
        connector.updateAsync(correlationId, item).then(method => {
            if (callback)
                callback(null, method);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    delete(correlationId, id, customerId, callback) {
        Promise.all([
            this._stripeCardsConnector.deleteAsync(correlationId, id, customerId),
            this._stripeBankAccountsConnector.deleteAsync(correlationId, id, customerId),
            this._stripeExternalCardsConnector.deleteAsync(correlationId, id, customerId),
            this._stripeExternalBankAccountsConnector.deleteAsync(correlationId, id, customerId)
        ]).then(methods => {
            var _a;
            if (callback)
                callback(null, (_a = methods) === null || _a === void 0 ? void 0 : _a.find(x => x != null));
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    clear(correlationId, callback) {
        Promise.all([
            this._stripeCardsConnector.clearAsync(correlationId),
            this._stripeBankAccountsConnector.clearAsync(correlationId),
            this._stripeExternalCardsConnector.clearAsync(correlationId),
            this._stripeExternalBankAccountsConnector.clearAsync(correlationId),
        ]).then(() => {
            if (callback)
                callback(null);
        })
            .catch(err => {
            if (callback)
                callback(err);
        });
    }
    buildPageByFilter(correlationId, filter, paging, methods) {
        let id = filter.getAsNullableString('id');
        let customerId = filter.getAsNullableString('customer_id');
        let saved = filter.getAsNullableBoolean('saved');
        let _default = filter.getAsNullableBoolean('default');
        let type = filter.getAsNullableString('type');
        let ids = filter.getAsObject('ids');
        let payout = filter.getAsNullableBoolean('payout');
        // Process ids filter
        if (_.isString(ids))
            ids = ids.split(',');
        if (!_.isArray(ids))
            ids = null;
        let skip = paging.getSkip(0);
        let take = paging.getTake(100);
        let items = [];
        let checkFilter = {
            id: id,
            default: _default,
            saved: saved,
            type: type,
            ids: ids,
            customerId: customerId,
            payout: payout
        };
        for (let item of methods) {
            // Filter items
            if (!this.checkItem(checkFilter, item))
                continue;
            // Process skip and take
            if (skip > 0) {
                skip--;
                continue;
            }
            if (items.length < take)
                items.push(item);
            if (items.length >= take)
                break;
        }
        return new pip_services3_commons_node_2.DataPage(items);
    }
    checkItem(filter, item) {
        if (filter.id != null && item.id != filter.id)
            return false;
        if (filter.default != null && item.default != filter.default)
            return false;
        if (filter.saved != null && item.saved != filter.saved)
            return false;
        if (filter.type != null && item.type != filter.type)
            return false;
        if (filter.ids != null && _.indexOf(filter.ids, item.id) < 0)
            return false;
        if (filter.customerId != null && item.customer_id != filter.customerId)
            return false;
        if (filter.payout != null && item.payout != filter.payout)
            return false;
        return true;
    }
    getConnectorByType(item) {
        if (item.payout) {
            if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card)
                return this._stripeExternalCardsConnector;
            if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.BankAccount)
                return this._stripeExternalBankAccountsConnector;
        }
        else {
            if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.Card)
                return this._stripeCardsConnector;
            if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.BankAccount)
                return this._stripeBankAccountsConnector;
        }
        return null;
    }
}
exports.PaymentMethodsStripePersistence = PaymentMethodsStripePersistence;
//# sourceMappingURL=PaymentMethodsStripePersistence.js.map