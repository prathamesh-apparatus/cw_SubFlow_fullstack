import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, IsUrl, Min } from 'class-validator';
export class CreateSubscriptionDto {
  @IsUUID() category_id!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() website_url?: string;
  @IsEmail() account_email!: string;
  @IsOptional() @IsString() account_username?: string;
  @Type(() => Number) @IsNumber() @Min(0) price!: number;
  @IsOptional() @IsString() currency?: string;
  @IsIn(['monthly','quarterly','half_yearly','yearly','custom']) billing_cycle!: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) custom_billing_days?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) tax_amount?: number;
  @IsOptional() @IsIn(['credit_card','debit_card','upi','net_banking','other']) payment_method?: string;
  @IsOptional() @IsBoolean() auto_pay_enabled?: boolean;
  @IsOptional() @IsIn(['paid','pending','failed']) payment_status?: string;
  @IsOptional() @IsString() payment_notes?: string;
  @IsOptional() @IsString() start_date?: string;
  @IsOptional() @IsString() last_payment_date?: string;
  @IsOptional() @IsString() next_renewal_date?: string;
  @IsOptional() @IsString() end_date?: string;
  @IsOptional() @IsBoolean() renewal_reminder?: boolean;
  @IsOptional() @Type(() => Number) @IsIn([3,7,15,30]) reminder_days_before?: number;
  @IsOptional() @IsIn(['active','inactive','cancelled','expired','trial']) status?: string;
  @IsOptional() @IsBoolean() auto_renewal_enabled?: boolean;
  @IsOptional() @IsString() notes?: string;
}
export class UpdateSubscriptionDto extends CreateSubscriptionDto {}
