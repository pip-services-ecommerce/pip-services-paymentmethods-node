import { PaymentMethodV1 } from "../data/version1/PaymentMethodV1";
import { FilterParams, DataPage, PagingParams } from "pip-services3-commons-node";

export interface IStripeConnector
{
    getPageByFilterAsync(correlationId: string, filter: FilterParams, paging: PagingParams) : Promise<DataPage<PaymentMethodV1>>;
    getByIdAsync(correlationId: string, id: string, customerId: string) : Promise<PaymentMethodV1>;
    createAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    updateAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    deleteAsync(correlationId: string, id: string, customerId: string): Promise<PaymentMethodV1>;
    clearAsync(correlationId: string): Promise<void>;
}