import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsMongoId,
} from 'class-validator';

export class UpdateRoleDto {
  @IsMongoId()
  userId!: string;

  @IsIn(['admin', 'user'])
  role!: 'admin' | 'user';
}

export class SyncBatchDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsMongoId({ each: true })
  userIds!: string[];
}
