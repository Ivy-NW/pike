import { IsString } from "class-validator";

export class AttachPaymentMethodDto {
  @IsString()
  stripePaymentMethodId!: string;
}
