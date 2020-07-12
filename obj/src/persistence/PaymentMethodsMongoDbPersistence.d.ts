import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';
import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { IPaymentMethodsPersistence } from './IPaymentMethodsPersistence';
export declare class PaymentMethodsMongoDbPersistence extends IdentifiableMongoDbPersistence<PaymentMethodV1, string> implements IPaymentMethodsPersistence {
    constructor();
    private composeFilter;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void;
    getById(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void;
    delete(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void;
}
