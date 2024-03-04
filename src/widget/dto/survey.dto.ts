import { IsBoolean, IsMongoId, IsString } from "class-validator";

interface OptionsDto {
    title: string;
}


export class SurveyWidgetDto {
    @IsString()
    headline: string;

    @IsString()
    description: string;


    options: OptionsDto;

    @IsBoolean()
    is_active: boolean

    @IsString()
    widgetId: string;
}


export class UpdateSurveyWidgetDto {
    @IsString()
    id: string;

    @IsString()
    headline: string;

    @IsString()
    description: string;


    options: OptionsDto;

    @IsString()
    widgetId: string;


    @IsString()
    workspace_id: string

    @IsBoolean()
    is_active: boolean
}
