import type { OfSchema } from 'accurtype'
declare type TestConfig = OfSchema<typeof configSchema>
declare const configSchema