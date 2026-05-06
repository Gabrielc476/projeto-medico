import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StartTriageDto {
  @ApiProperty({ example: 'Paciente vindo de consulta externa', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SymptomDto {
  @ApiProperty({ example: 'C0010674', description: 'CUI do sintoma (UMLS)' })
  @IsString()
  @IsNotEmpty()
  cui: string;

  @ApiProperty({ example: 'DOR NO PEITO', description: 'Nome legível' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ContextualFactorDto {
  @ApiProperty({ example: 'IDADE', description: 'Tipo do fator' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '65', description: 'Valor do fator' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class DiagnoseTriageDto {
  @ApiProperty({ type: [SymptomDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomDto)
  symptoms: SymptomDto[];

  @ApiProperty({ type: [ContextualFactorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContextualFactorDto)
  contextualFactors: ContextualFactorDto[];
}

export class ExtractContextDto {
  @ApiProperty({ example: 'Sinto uma dor de cabeça constante há 3 dias e febre leve.' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
