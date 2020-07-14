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
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const stripe_1 = require("stripe");
const util_1 = require("util");
const StripeOptions_1 = require("../StripeOptions");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
const pip_services3_components_node_3 = require("pip-services3-components-node");
const version1_1 = require("../../data/version1");
const version1_2 = require("../../data/version1");
class StripeCardsConnector {
    constructor() {
        this._client = null;
        this._connectionResolver = new pip_services3_components_node_1.ConnectionResolver();
        this._credentialsResolver = new pip_services3_components_node_2.CredentialResolver();
        this._logger = new pip_services3_components_node_3.CompositeLogger();
    }
    configure(config) {
        this._logger.configure(config);
        this._connectionResolver.configure(config);
        this._credentialsResolver.configure(config);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialsResolver.setReferences(references);
    }
    isOpen() {
        return this._client != null;
    }
    open(correlationId, callback) {
        let connectionParams;
        let credentialParams;
        async.series([
            // Get connection params
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err, result) => {
                    connectionParams = result;
                    callback(err);
                });
            },
            // Get credential params
            (callback) => {
                this._credentialsResolver.lookup(correlationId, (err, result) => {
                    credentialParams = result;
                    callback(err);
                });
            },
            // Connect
            (callback) => {
                let stripeOptions = new StripeOptions_1.StripeOptions(connectionParams);
                let secretKey = credentialParams.getAccessKey();
                this._client = new stripe_1.Stripe(secretKey, {
                    apiVersion: stripeOptions.apiVersion,
                    maxNetworkRetries: stripeOptions.maxNetworkRetries,
                    httpAgent: stripeOptions.httpAgent,
                    timeout: stripeOptions.timeout,
                    host: stripeOptions.host,
                    port: stripeOptions.port,
                    protocol: stripeOptions.protocol,
                    telemetry: stripeOptions.telemetry
                });
                callback();
            }
        ], callback);
    }
    close(correlationId, callback) {
        this._client = null;
        if (callback)
            callback(null);
    }
    getPageByFilterAsync(correlationId, filter, paging) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let customer_id = (_a = filter) === null || _a === void 0 ? void 0 : _a.getAsString('customer_id');
            let customerId = customer_id ? yield this.fromPublicCustomerAsync(customer_id) : null;
            let skip = paging.getSkip(0);
            let take = paging.getTake(100);
            let ids = customerId ? [customerId] : yield this.getAllCustomerIds();
            let data = [];
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                let items = yield this._client.paymentMethods.list({
                    customer: id,
                    type: "card",
                    //starting_after: skip,
                    limit: skip + take,
                    expand: ['data.billing_details', 'data.card']
                });
                for (let j = 0; j < items.data.length; j++) {
                    const item = items.data[j];
                    data.push(yield this.toPublicAsync(item));
                }
            }
            return new pip_services3_commons_node_2.DataPage(data);
        });
    }
    getByIdAsync(correlationId, id, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var customer_id = yield this.fromPublicCustomerAsync(customerId);
            let paymentMethod = yield this.errorSuppression(this._client.paymentMethods.retrieve(id, {
                expand: ['billing_details', 'card']
            }));
            return paymentMethod && paymentMethod.customer == customer_id
                ? yield this.toPublicAsync(paymentMethod)
                : null;
        });
    }
    createAsync(correlationId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            var customerId = yield this.fromPublicCustomerAsync(item.customer_id);
            if (customerId == null) {
                var customer = yield this._client.customers.create({
                    metadata: {
                        'customer_id': item.customer_id
                    }
                });
                customerId = customer.id;
            }
            let card = item.card;
            let address = item.billing_address || new version1_2.AddressV1();
            let paymentMethod = yield this._client.paymentMethods.create({
                type: 'card',
                card: {
                    exp_month: card.expire_month,
                    exp_year: card.expire_year,
                    number: card.number,
                    cvc: card.ccv
                },
                billing_details: {
                    address: {
                        city: address.city,
                        country: address.country_code,
                        line1: address.line1,
                        line2: address.line2,
                        postal_code: address.postal_code,
                        state: address.state
                    },
                    name: card.first_name + ' ' + card.last_name,
                },
                metadata: this.toMetadata(item),
            });
            paymentMethod = yield this._client.paymentMethods.attach(paymentMethod.id, { customer: customerId });
            return yield this.toPublicAsync(paymentMethod);
        });
    }
    updateAsync(correlationId, item) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            let card = item.card;
            let address = item.billing_address;
            let updateParams = {
                card: {
                    exp_month: card.expire_month,
                    exp_year: card.expire_year,
                },
                metadata: this.toMetadata(item),
            };
            if (address.city || address.country_code || address.line1) {
                updateParams.billing_details = {
                    address: {
                        city: (_b = (_a = address) === null || _a === void 0 ? void 0 : _a.city, (_b !== null && _b !== void 0 ? _b : '')),
                        country: (_c = address) === null || _c === void 0 ? void 0 : _c.country_code,
                        line1: (_e = (_d = address) === null || _d === void 0 ? void 0 : _d.line1, (_e !== null && _e !== void 0 ? _e : '')),
                        line2: (_g = (_f = address) === null || _f === void 0 ? void 0 : _f.line2, (_g !== null && _g !== void 0 ? _g : '')),
                        postal_code: (_j = (_h = address) === null || _h === void 0 ? void 0 : _h.postal_code, (_j !== null && _j !== void 0 ? _j : '')),
                        state: (_l = (_k = address) === null || _k === void 0 ? void 0 : _k.state, (_l !== null && _l !== void 0 ? _l : ''))
                    },
                    name: card.first_name + ' ' + card.last_name
                };
            }
            let paymentMethod = yield this._client.paymentMethods.update(item.id, updateParams);
            return yield this.toPublicAsync(paymentMethod);
        });
    }
    deleteAsync(correlationId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            let paymentMethod = yield this.errorSuppression(this._client.paymentMethods.detach(id, {
                expand: ['billing_details', 'card']
            }));
            return paymentMethod ? yield this.toPublicAsync(paymentMethod) : null;
        });
    }
    clearAsync(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = new pip_services3_commons_node_1.FilterParams();
            let paging = new pip_services3_commons_node_3.PagingParams(0, 100);
            let page = yield this.getPageByFilterAsync(correlationId, filter, paging);
            for (let i = 0; i < page.data.length; i++) {
                const paymentMethod = page.data[i];
                yield this.deleteAsync(correlationId, paymentMethod.id);
            }
        });
    }
    toPublicAsync(item) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let customer_id = yield this.toPublicCustomerAsync(util_1.isString(item.customer) ? item.customer : (_a = item.customer) === null || _a === void 0 ? void 0 : _a.id);
            var method = {
                id: item.id,
                type: version1_1.PaymentMethodTypeV1.CreditCard,
                customer_id: customer_id,
                card: {
                    expire_month: item.card.exp_month,
                    expire_year: item.card.exp_year,
                    number: '',
                    ccv: ''
                },
                last4: item.card.last4,
                billing_address: {
                    city: item.billing_details.address.city,
                    country_code: item.billing_details.address.country,
                    line1: item.billing_details.address.line1,
                    line2: item.billing_details.address.line2,
                    postal_code: item.billing_details.address.postal_code,
                    state: item.billing_details.address.state
                },
                create_time: new Date(item.created),
            };
            this.fromMetadata(method, item.metadata);
            return method;
        });
    }
    toPublicCustomerAsync(customer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (customer_id) {
                let item = yield this._client.customers.retrieve(customer_id, {});
                let customer = item;
                if (customer) {
                    return customer.metadata['customer_id'].toString();
                }
            }
            return null;
        });
    }
    fromPublicCustomerAsync(customer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (customer_id) {
                var customers = yield this._client.customers.list({});
                for (let index = 0; index < customers.data.length; index++) {
                    const customer = customers.data[index];
                    if (customer.metadata['customer_id'] == customer_id) {
                        return customer.id;
                    }
                }
            }
            return null;
        });
    }
    getAllCustomerIds() {
        return __awaiter(this, void 0, void 0, function* () {
            let ids = [];
            let pageSize = 100;
            do {
                let options = ids.length == 0
                    ? {
                        limit: pageSize
                    }
                    : {
                        limit: pageSize,
                        starting_after: ids[ids.length - 1]
                    };
                if (ids.length == 0)
                    var items = yield this._client.customers.list(options);
                ids.push(...items.data.map((item, index, array) => item.id));
            } while (items.has_more);
            return ids;
        });
    }
    toMetadata(item) {
        let card = item.card;
        return {
            'default': item.default ? 'true' : 'false',
            'saved': item.saved ? 'true' : 'false',
            'name': item.name,
            'first_name': card.first_name,
            'last_name': card.last_name,
            'brand': card.brand,
            'state': card.state
        };
    }
    fromMetadata(item, metadata) {
        if (metadata) {
            item.default = metadata['default'] == 'true';
            item.saved = metadata['saved'] == 'true';
            item.name = metadata['name'].toString();
            item.card.first_name = metadata['first_name'].toString();
            item.card.last_name = metadata['last_name'].toString();
            item.card.brand = metadata['brand'].toString();
            item.card.state = metadata['state'].toString();
        }
    }
    errorSuppression(action, errorCodes = ['resource_missing']) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            let err;
            try {
                result = yield action;
            }
            catch (e) {
                err = e;
            }
            if (err) {
                if (!errorCodes.includes(err.code))
                    throw err;
            }
            return result;
        });
    }
}
exports.StripeCardsConnector = StripeCardsConnector;
//# sourceMappingURL=StripeCardsConnector.js.map