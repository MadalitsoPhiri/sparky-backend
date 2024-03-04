import {
  DynamicModule,
  ForwardReference,
  InjectionToken,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface AsyncConfig {
  url: string;
  username: string;
  password: string;
}
export type AsyncOptions = {
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useFactory: (...args: any[]) => AsyncConfig;
  import?: (
    | Type<any>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<any>
  )[];
};
