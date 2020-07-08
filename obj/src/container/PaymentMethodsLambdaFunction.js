"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_aws_node_1 = require("pip-services3-aws-node");
const PaymentMethodsServiceFactory_1 = require("../build/PaymentMethodsServiceFactory");
class PaymentMethodsLambdaFunction extends pip_services3_aws_node_1.CommandableLambdaFunction {
    constructor() {
        super("payment_methods", "Payment methods function");
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-paymentmethods', 'controller', 'default', '*', '*'));
        this._factories.add(new PaymentMethodsServiceFactory_1.PaymentMethodsServiceFactory());
    }
}
exports.PaymentMethodsLambdaFunction = PaymentMethodsLambdaFunction;
exports.handler = new PaymentMethodsLambdaFunction().getHandler();
//# sourceMappingURL=PaymentMethodsLambdaFunction.js.map