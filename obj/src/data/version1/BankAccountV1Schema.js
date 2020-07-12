"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class BankAccountV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('bank_code', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('branch_code', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('number', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('routing_number', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('currency', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('first_name', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('last_name', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('country', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.BankAccountV1Schema = BankAccountV1Schema;
//# sourceMappingURL=BankAccountV1Schema.js.map