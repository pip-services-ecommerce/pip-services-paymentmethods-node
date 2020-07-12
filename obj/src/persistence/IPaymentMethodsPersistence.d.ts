import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
export interface IPaymentMethodsPersistence {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void;
    getById(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void;
    create(correlationId: string, item: PaymentMethodV1, callback: (err: any, item: PaymentMethodV1) => void): void;
    update(correlationId: string, item: PaymentMethodV1, callback: (err: any, item: PaymentMethodV1) => void): void;
    delete(correlationId: string, id: string, customerId: string, callback: (err: any, item: PaymentMethodV1) => void): void;
}
