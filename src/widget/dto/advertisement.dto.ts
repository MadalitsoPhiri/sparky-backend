import { IsMongoId, IsNotEmpty, IsObject, IsString, IsSurrogatePair } from "class-validator";

interface FeaturesDto {
    title: string;
}


export class AdvertWidgetDto {
    @IsString()
    image: string;

    @IsString()
    headline: string;

    features: FeaturesDto;

    @IsString()
    buttonLabel: string;

    @IsString()
    outsideUrl: string;

    @IsString()
    widgetId: string;
}

export class UpdateAdvertWidgetDto {
    @IsString()
    id: string;

    @IsString()
    image: string;

    @IsString()
    headline: string;

    features: FeaturesDto;

    @IsString()
    buttonLabel: string;

    @IsString()
    outsideUrl: string;

    @IsString()
    widgetId: string;
}
