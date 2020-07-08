"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class CreditCardV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('brand', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('number', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('expire_month', pip_services3_commons_node_2.TypeCode.Integer);
        this.withRequiredProperty('expire_year', pip_services3_commons_node_2.TypeCode.Integer);
        this.withRequiredProperty('first_name', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('last_name', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('state', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('ccv', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.CreditCardV1Schema = CreditCardV1Schema;
//# sourceMappingURL=CreditCardV1Schema.js.map