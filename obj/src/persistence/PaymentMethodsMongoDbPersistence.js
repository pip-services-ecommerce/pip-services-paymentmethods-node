"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_mongodb_node_1 = require("pip-services3-mongodb-node");
class PaymentMethodsMongoDbPersistence extends pip_services3_mongodb_node_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('payment_methods');
        super.ensureIndex({ customer_id: 1 });
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
        let criteria = [];
        let id = filter.getAsNullableString('id');
        if (id != null)
            criteria.push({ _id: id });
        // Filter ids
        let ids = filter.getAsObject('ids');
        if (_.isString(ids))
            ids = ids.split(',');
        if (_.isArray(ids))
            criteria.push({ _id: { $in: ids } });
        let type = filter.getAsNullableString('type');
        if (type != null)
            criteria.push({ type: type });
        let _default = filter.getAsNullableBoolean('default');
        if (_default != null)
            criteria.push({ default: _default });
        let customerId = filter.getAsNullableString('customer_id');
        if (customerId != null)
            criteria.push({ customer_id: customerId });
        return criteria.length > 0 ? { $and: criteria } : null;
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }
    getById(correlationId, id, customerId, callback) {
        super.getOneById(correlationId, id, callback);
    }
    delete(correlationId, id, customerId, callback) {
        super.deleteById(correlationId, id, callback);
    }
}
exports.PaymentMethodsMongoDbPersistence = PaymentMethodsMongoDbPersistence;
//# sourceMappingURL=PaymentMethodsMongoDbPersistence.js.map