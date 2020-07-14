import { IStripeConnector } from "../IStripeConnector";
import { FilterParams, IReferences } from "pip-services3-commons-node";
import { DataPage } from "pip-services3-commons-node";
import { PagingParams } from "pip-services3-commons-node";
import { ConfigParams } from "pip-services3-commons-node";
import { PaymentMethodV1 } from "../../data/version1";
export declare class StripeBankAccountsConnector implements IStripeConnector {
    private _client;
    private _connectionResolver;
    private _credentialsResolver;
    private _logger;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    isOpen(): boolean;
    open(correlationId: string, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    getPageByFilterAsync(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<PaymentMethodV1>>;
    getByIdAsync(correlationId: string, id: string, customerId: string): Promise<PaymentMethodV1>;
    createAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    updateAsync(correlationId: string, item: PaymentMethodV1): Promise<PaymentMethodV1>;
    deleteAsync(correlationId: string, id: string, customerId: string): Promise<PaymentMethodV1>;
    clearAsync(correlationId: string): Promise<void>;
    private getCustomerIdAsync;
    private toPublicAsync;
    private toPublicCustomerAsync;
    private fromPublicCustomerAsync;
    private getAllCustomerIds;
    private toMetadata;
    private fromMetadata;
    errorSuppression<T>(action: Promise<T>, errorCodes?: [string]): Promise<T>;
}
