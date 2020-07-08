import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IGetter } from 'pip-services3-data-node';
import { IWriter } from 'pip-services3-data-node';

import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';

export interface IPaymentMethodsPersistence extends IGetter<PaymentMethodV1, string>, IWriter<PaymentMethodV1, string> {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void;

    getOneById(correlationId: string, id: string, 
        callback: (err: any, item: PaymentMethodV1) => void): void;

    create(correlationId: string, item: PaymentMethodV1, 
        callback: (err: any, item: PaymentMethodV1) => void): void;

    update(correlationId: string, item: PaymentMethodV1, 
        callback: (err: any, item: PaymentMethodV1) => void): void;

    deleteById(correlationId: string, id: string,
        callback: (err: any, item: PaymentMethodV1) => void): void;
}
