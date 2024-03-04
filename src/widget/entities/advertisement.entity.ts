import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseWidgetConfigEntity } from "./base.entity";

@Schema()
class Features extends Document {
    @Prop({ type: String, default: null })
    title: string;
}

export const FeaturesSchema = SchemaFactory.createForClass(Features)

@Schema()
export class Advertisements extends BaseWidgetConfigEntity {

    @Prop({ type: String, default: null })
    image: string;

    @Prop({ type: String, default: null })
    headline: string;

    @Prop({ type: [FeaturesSchema], default: [] })
    features: Features[];

    @Prop({ type: String, default: null })
    buttonLabel: string;

    @Prop({ type: String, default: null })
    outsideUrl: string;
}

export const AdvertisementsSchema = SchemaFactory.createForClass(Advertisements)


