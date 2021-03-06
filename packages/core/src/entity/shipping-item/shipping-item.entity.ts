import { Adjustment, AdjustmentType } from '@vendure/common/lib/generated-types';
import { DeepPartial } from '@vendure/common/lib/shared-types';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Calculated } from '../../common/calculated-decorator';
import { VendureEntity } from '../base/base.entity';
import { OrderLine } from '../order-line/order-line.entity';
import { ShippingMethod } from '../shipping-method/shipping-method.entity';

@Entity()
export class ShippingItem extends VendureEntity {
    constructor(input?: DeepPartial<ShippingItem>) {
        super(input);
    }

    @Column() price: number;

    @Column('simple-json') pendingAdjustments: Adjustment[];

    @ManyToOne(type => ShippingMethod)
    shippingMethod: ShippingMethod;

    @Calculated()
    get adjustments(): Adjustment[] {
        return this.pendingAdjustments;
    }

    clearAdjustments(type?: AdjustmentType) {
        if (!type) {
            this.pendingAdjustments = [];
        } else {
            this.pendingAdjustments = this.pendingAdjustments.filter(a => a.type !== type);
        }
    }
}
