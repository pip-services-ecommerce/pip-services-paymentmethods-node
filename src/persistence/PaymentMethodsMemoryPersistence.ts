let _ = require('lodash');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-node';
import { TagsProcessor } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { IPaymentMethodsPersistence } from './IPaymentMethodsPersistence';

export class PaymentMethodsMemoryPersistence
    extends IdentifiableMemoryPersistence<PaymentMethodV1, string>
    implements IPaymentMethodsPersistence {

    constructor() {
        super();
    }

    private contains(array1, array2) {
        if (array1 == null || array2 == null) return false;

        for (let i1 = 0; i1 < array1.length; i1++) {
            for (let i2 = 0; i2 < array2.length; i2++)
                if (array1[i1] == array2[i1])
                    return true;
        }

        return false;
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();

        let id = filter.getAsNullableString('id');
        let type = filter.getAsNullableString('type');
        let customerId = filter.getAsNullableString('customer_id');
        let _default = filter.getAsNullableBoolean('default');
        let ids = filter.getAsObject('ids');

        // Process ids filter
        if (_.isString(ids))
            ids = ids.split(',');
        if (!_.isArray(ids))
            ids = null;

        return (item) => {
            if (id && item.id != id)
                return false;
            if (ids && _.indexOf(ids, item.id) < 0)
                return false;
            if (type && item.type != type)
                return false;
            if (_default && item.default != _default)
                return false;
            if (customerId && item.customer_id != customerId)
                return false;
            return true;
        };
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
