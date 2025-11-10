export declare class CreateFormFieldDto {
    fieldName: string;
    fieldType: string;
    label: string;
    required?: boolean;
    options?: any;
    errorMessages?: {
        required?: string;
        email?: string;
        number?: string;
        pattern?: string;
        [key: string]: string | undefined;
    };
    displayOrder?: number;
}
export declare class UpdateFormFieldDto {
    fieldName?: string;
    fieldType?: string;
    label?: string;
    required?: boolean;
    options?: any;
    errorMessages?: {
        required?: string;
        email?: string;
        number?: string;
        pattern?: string;
        [key: string]: string | undefined;
    };
    displayOrder?: number;
}
