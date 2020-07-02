// let _ = require('lodash');
// let async = require('async');

// import { FilterParams } from 'pip-services3-commons-node';
// import { PagingParams } from 'pip-services3-commons-node';
// import { DataPage } from 'pip-services3-commons-node';
// import { ConfigParams } from 'pip-services3-commons-node';
// import { IConfigurable } from 'pip-services3-commons-node';
// import { IReferences } from 'pip-services3-commons-node';
// import { IReferenceable } from 'pip-services3-commons-node';
// import { IOpenable } from 'pip-services3-commons-node';
// import { ICleanable } from 'pip-services3-commons-node';
// import { CredentialParams } from 'pip-services3-components-node';
// import { CredentialResolver } from 'pip-services3-components-node';
// import { CompositeLogger } from 'pip-services3-components-node';

// import { BadRequestException } from 'pip-services3-commons-node';

// import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
// import { PaymentMethodTypeV1 } from '../data/version1/PaymentMethodTypeV1';
// import { IPaymentMethodsPersistence } from './IPaymentMethodsPersistence'

// export class PaymentMethodsPayPalPersistence implements IPaymentMethodsPersistence, IConfigurable,
//     IReferenceable, IOpenable, ICleanable {

//     private _sandbox: boolean = false;
//     private _credentialsResolver: CredentialResolver = new CredentialResolver();
//     private _logger: CompositeLogger = new CompositeLogger();
//     private _client: any = null;

//     public constructor() { }

//     public configure(config: ConfigParams): void {
//         this._logger.configure(config);
//         this._credentialsResolver.configure(config);

//         this._sandbox = config.getAsBooleanWithDefault("options.sandbox", this._sandbox);
//     }

//     public setReferences(references: IReferences): void {
//         this._logger.setReferences(references);
//         this._credentialsResolver.setReferences(references);
//     }

//     public isOpen(): boolean {
//         return this._client != null;
//     }

//     public open(correlationId: string, callback: (err: any) => void): void {
//         let credentials: CredentialParams;

//         async.series([
//             // Get credential params
//             (callback) => {
//                 this._credentialsResolver.lookup(correlationId, (err, result) => {
//                     credentials = result;
//                     callback(err);
//                 });
//             },
//             // Connect
//             (callback) => {
//                 this._client = require('paypal-rest-sdk');
//                 this._client.configure({
//                     mode: this._sandbox ? 'sandbox' : 'live',
//                     client_id: credentials.getAccessId(),
//                     client_secret: credentials.getAccessKey()
//                 });
//                 callback();
//             }
//         ], callback);
//     }

//     public close(correlationId: string, callback: (err: any) => void): void {
//         this._client = null;
//         if (callback) callback(null);
//     }

//     private toPublic(value: any): PaymentMethodV1 {
//         if (value == null) return null;

//         let result = _.omit(value, 'external_customer_id', 'external_method_id',
//             'external_method_id', 'valid_until', 'create_time', 'update_time', 'links');

//         // Parse external_method_id
//         let temp = value.external_method_id.split(';');
//         result.number = temp.length > 0 ? temp[0] : '';
//         result.name = temp.length > 1 ? temp[1] : '';
//         result.ccv = temp.length > 2 ? temp[2] : '';
//         result.saved = temp.length > 3 ? temp[3] == 'saved' : false;
//         result.default = temp.length > 4 ? temp[4] == 'default' : false;
//         result.customer_id = temp.length > 5 ? temp[5] : value.external_customer_id;
//         return result;
//     }

//     private fromPublic(value: PaymentMethodV1): any {
//         if (value == null) return null;

//         delete value.create_time;
//         delete value.update_time;

//         let result = _.omit(value, 'id', 'state', 'customer_id', 'ccv', 'name', 'saved', 'default');
//         result.external_customer_id = value.customer_id;

//         // Generate external_method_id
//         let temp = value.number;
//         temp += ';' + (value.name ? value.name.replace(';', '_') : '');
//         temp += ';' + (value.ccv ? value.ccv.replace(';', '') : '');
//         temp += ';' + (value.saved ? 'saved' : '');
//         temp += ';' + (value.default ? 'default' : '');
//         temp += ';' + (value.customer_id ? value.customer_id.replace(';', '') : '');
//         result.external_method_id = temp;

//         return result;
//     }

//     public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
//         callback: (err: any, page: DataPage<PaymentMethodV1>) => void): void {
//         let id = filter.getAsNullableString('id');
//         let state = filter.getAsNullableString('state');
//         let customerId = filter.getAsNullableString('customer_id');
//         let saved = filter.getAsNullableBoolean('saved');
//         let ids = filter.getAsObject('ids');

//         // Process ids filter
//         if (_.isString(ids))
//             ids = ids.split(',');
//         if (!_.isArray(ids))
//             ids = null;

//         let skip = paging.getSkip(0);
//         let take = paging.getTake(100);
//         let items: PaymentMethodV1[] = [];

//         let page = 0;
//         let pageSize = 20;
//         let pageItems: PaymentMethodV1[];

//         async.doWhilst(
//             (callback) => {
//                 page++;

//                 // Set filters supported by PayPal
//                 let options: any = {
//                     page: page,
//                     page_size: pageSize
//                 };
//                 if (customerId)
//                     options.external_customer_id = customerId;

//                 this._client.creditCard.list(options, (err, data) => {
//                     if (err) {
//                         callback(err);
//                         return;
//                     }

//                     pageItems = _.map(data.items, (item) => this.toPublic(item));

//                     for (let item of pageItems) {
//                         // Filter items
//                         if (id != null && item.id != id)
//                             continue;
//                         if (state != null && item.state != state)
//                             continue;
//                         if (saved != null && item.saved != saved)
//                             continue;
//                         if (ids != null && _.indexOf(ids, item.id) < 0)
//                             continue;

//                         // Process skip and take
//                         if (skip > 0) {
//                             skip--;
//                             continue;
//                         }

//                         if (items.length < take)
//                             items.push(item);
//                     }

//                     callback(null);
//                 });
//             },
//             () => pageItems.length == pageSize && items.length < take,
//             (err) => {
//                 let page = err == null ? new DataPage(items) : null;
//                 callback(err, page);
//             }
//         );
//     }

//     public getOneById(correlationId: string, id: string,
//         callback: (err: any, item: PaymentMethodV1) => void): void {
//         this._client.creditCard.get(id, (err, data) => {
//             if (err != null && err.httpStatusCode == 404)
//                 err = null;

//             let item = this.toPublic(data);
//             callback(err, item);
//         });
//     }

//     public create(correlationId: string, item: PaymentMethodV1,
//         callback: (err: any, item: PaymentMethodV1) => void): void {
//         item = _.omit(item, 'id');
//         item = this.fromPublic(item);

//         this._client.creditCard.create(item, (err, data) => {
//             console.log("Creating method", item);

//             if (err != null) {
//                 var strErr = JSON.stringify(err);
//                 this._logger.trace(correlationId, "Error creating credit method with PayPal persistence: ", strErr);

//                 let code = err && err.response ? err.response.name : "UNKNOWN";
//                 let message = err && err.response ? err.response.message : strErr;
//                 let status = err && err.httpStatusCode ? err.httpStatusCode : "500";

//                 err = new BadRequestException(
//                     null, code,
//                     message
//                 ).withStatus(status);
//             }
//             item = this.toPublic(data);
//             callback(err, item);
//         });
//     }

//     public update(correlationId: string, item: PaymentMethodV1,
//         callback: (err: any, item: PaymentMethodV1) => void): void {
//         let id = item.id;
//         let data: any = this.fromPublic(item);

//         // Delete and then recreate, because some fields are read-only in PayPal
//         // this._client.creditCard.del(id, (err) => {
//         //     if (err) {
//         //         callback(err, null);
//         //         return;
//         //     }

//         //     this._client.creditCard.create(data, (err, data) => {
//         //         item = this.toPublic(data);
//         //         callback(err, item);
//         //     });
//         // });

//         // First try to create then delete, because if user misstyped credit method will be just deleted
//         this._client.creditCard.create(data, (err, data) => {
//             if (err) {
//                 callback(err, null);
//                 return;
//             }

//             this._client.creditCard.del(id, (err) => {
//                 if (err) {
//                     callback(err, null);
//                     return;
//                 }
//             });

//             item = this.toPublic(data);
//             callback(err, item);
//         });
//     }

//     public deleteById(correlationId: string, id: string,
//         callback: (err: any, item: PaymentMethodV1) => void): void {
//         this._client.creditCard.get(id, (err, data) => {
//             if (err != null || data == null) {
//                 callback(err, null);
//                 return;
//             }

//             let item = this.toPublic(data);

//             this._client.creditCard.del(id, (err) => {
//                 callback(err, item);
//             });
//         });
//     }

//     public clear(correlationId: string, callback: (err: any) => void): void {
//         let page = 0;
//         let pageSize = 20;
//         let creditCards: any[] = []

//         async.doWhilst(
//             (callback) => {
//                 page++;

//                 let options = {
//                     page_size: pageSize,
//                     page: page
//                 };

//                 this._client.creditCard.list(options, (err, page) => {
//                     if (err) {
//                         callback(err);
//                         return;
//                     }

//                     creditCards = page.items;

//                     async.each(
//                         creditCards,
//                         (creditCard, callback) => {
//                             this._client.creditCard.del(creditCard.id, (err) => {
//                                 callback(err);
//                             });
//                         },
//                         callback
//                     );
//                 });
//             },
//             () => creditCards.length == pageSize,
//             callback
//         );
//     }
// }