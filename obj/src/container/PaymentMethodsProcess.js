"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const PaymentMethodsServiceFactory_1 = require("../build/PaymentMethodsServiceFactory");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
class PaymentMethodsProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super("payment_methods", "Payment methods microservice");
        this._factories.add(new PaymentMethodsServiceFactory_1.PaymentMethodsServiceFactory);
        this._factories.add(new pip_services3_rpc_node_1.DefaultRpcFactory);
    }
}
exports.PaymentMethodsProcess = PaymentMethodsProcess;
//# sourceMappingURL=PaymentMethodsProcess.js.map