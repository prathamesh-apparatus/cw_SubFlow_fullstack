import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateCategoryDto { @IsString() @MinLength(1) @MaxLength(255) name!: string; @IsOptional() @IsString() description?: string; }
export class UpdateCategoryDto { @IsOptional() @IsString() @MinLength(1) @MaxLength(255) name?: string; @IsOptional() @IsString() description?: string; }
