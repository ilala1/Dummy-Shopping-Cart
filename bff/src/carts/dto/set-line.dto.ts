import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class SetLineDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(9999)
  quantity!: number;
}
