"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const PaymentMethodTypeV1_1 = require("../data/version1/PaymentMethodTypeV1");
const stripe_1 = require("stripe");
const StripeOptions_1 = require("./StripeOptions");
const StripeCardsConnector_1 = require("./stripe/StripeCardsConnector");
const StripeBankAccountsConnector_1 = require("./stripe/StripeBankAccountsConnector");
class PaymentMethodsStripePersistence {
    constructor() {
        this._credentialsResolver = new pip_services3_components_node_1.CredentialResolver();
        this._logger = new pip_services3_components_node_2.CompositeLogger();
        this._client = null;
    }
    configure(config) {
        this._logger.configure(config);
        this._credentialsResolver.configure(config);
        this._stripeOptions = new StripeOptions_1.StripeOptions(config);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._credentialsResolver.setReferences(references);
    }
    isOpen() {
        return this._client != null;
    }
    open(correlationId, callback) {
        let credentials;
        async.series([
            // Get credential params
            (callback) => {
                this._credentialsResolver.lookup(correlationId, (err, result) => {
                    credentials = result;
                    callback(err);
                });
            },
            // Connect
            (callback) => {
                let secretKey = credentials.getAccessKey();
                this._client = new stripe_1.Stripe(secretKey, {
                    apiVersion: this._stripeOptions.apiVersion,
                    maxNetworkRetries: this._stripeOptions.maxNetworkRetries,
                    httpAgent: this._stripeOptions.httpAgent,
                    timeout: this._stripeOptions.timeout,
                    host: this._stripeOptions.host,
                    port: this._stripeOptions.port,
                    protocol: this._stripeOptions.protocol,
                    telemetry: this._stripeOptions.telemetry
                });
                this._stripeCardsConnector = new StripeCardsConnector_1.StripeCardsConnector(this._client);
                this._stripeBankAccountsConnector = new StripeBankAccountsConnector_1.StripeBankAccountsConnector(this._client);
                callback();
            }
        ], callback);
    }
    close(correlationId, callback) {
        this._stripeCardsConnector = null;
        this._stripeBankAccountsConnector = null;
        this._client = null;
        if (callback)
            callback(null);
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        this.getPageByFilterAsync(correlationId, filter, paging).then(page => {
            if (callback)
                callback(null, page);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    getById(correlationId, id, customerId, callback) {
        this._stripeCardsConnector.getByIdAsync(correlationId, id, customerId).then(method => {
            if (callback && method) {
                callback(null, method);
                return;
            }
            this._stripeBankAccountsConnector.getByIdAsync(correlationId, id, customerId).then(method => {
                callback(null, method);
            }).catch(err => {
                if (callback)
                    callback(err, null);
            });
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
        this._stripeCardsConnector.deleteAsync(correlationId, id, customerId).then(method => {
            if (callback && method) {
                callback(null, method);
                return;
            }
            this._stripeBankAccountsConnector.deleteAsync(correlationId, id, customerId).then(method => {
                callback(null, method);
            }).catch(err => {
                if (callback)
                    callback(err, null);
            });
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    clear(correlationId, callback) {
        this.clearAsync(correlationId).then(() => {
            if (callback)
                callback(null);
        }).catch(err => {
            if (callback)
                callback(err);
        });
    }
    getPageByFilterAsync(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = filter.getAsNullableString('id');
            let customerId = filter.getAsNullableString('customer_id');
            let saved = filter.getAsNullableBoolean('saved');
            let _default = filter.getAsNullableBoolean('default');
            let type = filter.getAsNullableString('type');
            let ids = filter.getAsObject('ids');
            // Process ids filter
            if (_.isString(ids))
                ids = ids.split(',');
            if (!_.isArray(ids))
                ids = null;
            let skip = paging.getSkip(0);
            let take = paging.getTake(100);
            let items = [];
            let pageSize = 100;
            let checkFilter = {
                id: id,
                default: _default,
                saved: saved,
                type: type,
                ids: ids,
                customerId: customerId
            };
            let pageCards = yield this._stripeCardsConnector.getPageByFilterAsync(correlationId, filter, new pip_services3_commons_node_1.PagingParams(0, pageSize));
            for (let item of pageCards.data) {
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
            if (items.length >= take) {
                return new pip_services3_commons_node_2.DataPage(items);
            }
            let pageBankAccounts = yield this._stripeBankAccountsConnector.getPageByFilterAsync(correlationId, filter, new pip_services3_commons_node_1.PagingParams(0, pageSize));
            for (let item of pageBankAccounts.data) {
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
        });
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
        return true;
    }
    clearAsync(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._stripeCardsConnector.clearAsync(correlationId);
            yield this._stripeBankAccountsConnector.clearAsync(correlationId);
        });
    }
    getConnectorByType(item) {
        if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.CreditCard)
            return this._stripeCardsConnector;
        if (item.type == PaymentMethodTypeV1_1.PaymentMethodTypeV1.BankAccount)
            return this._stripeBankAccountsConnector;
        return null;
    }
}
exports.PaymentMethodsStripePersistence = PaymentMethodsStripePersistence;
//# sourceMappingURL=PaymentMethodsStripePersistence.js.map