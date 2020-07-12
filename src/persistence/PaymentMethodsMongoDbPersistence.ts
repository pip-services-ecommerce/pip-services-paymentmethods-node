let _ = require('lodash');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { TagsProcessor } from 'pip-services3-commons-node';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { IPaymentMethodsPersistence } from './IPaymentMethodsPersistence';

export class PaymentMethodsMongoDbPersistence
    extends IdentifiableMongoDbPersistence<PaymentMethodV1, string>
    implements IPaymentMethodsPersistence {

    constructor() {
        super('payment_methods');
        super.ensureIndex({ customer_id: 1 });
    }
    
    private composeFilter(filter: any) {
        filter = filter || new FilterParams();

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
    
    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }

    public getById(correlationId: string, id: string, customerId: string,
        callback: (err: any, item: PaymentMethodV1) => void): void {
        super.getOneById(correlationId, id, callback);
    }

    public delete(correlationId: string, id: string, customerId: string,
        callback: (err: any, item: PaymentMethodV1) => void): void {
        super.deleteById(correlationId, id, callback);
    }
}
