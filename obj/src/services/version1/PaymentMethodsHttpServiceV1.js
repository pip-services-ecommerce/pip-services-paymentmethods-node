"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
class PaymentMethodsHttpServiceV1 extends pip_services3_rpc_node_1.CommandableHttpService {
    constructor() {
        super('v1/payment_methods');
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-paymentmethods', 'controller', 'default', '*', '1.0'));
    }
}
exports.PaymentMethodsHttpServiceV1 = PaymentMethodsHttpServiceV1;
//# sourceMappingURL=PaymentMethodsHttpServiceV1.js.map