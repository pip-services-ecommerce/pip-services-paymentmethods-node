import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class BankAccountV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withRequiredProperty('bank_code', TypeCode.String);
        this.withOptionalProperty('branch_code', TypeCode.String);
        this.withRequiredProperty('number', TypeCode.String);
        this.withRequiredProperty('first_name', TypeCode.String);
        this.withRequiredProperty('last_name', TypeCode.String);
        this.withOptionalProperty('country', TypeCode.String);
    }
}
