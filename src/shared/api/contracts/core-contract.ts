import {
    ConfigProfileSchema,
    CreateConfigProfileCommand,
    GetConfigProfileByUuidCommand,
    GetConfigProfilesCommand,
    GetNodeCommand,
    GetNodesCommand,
    NodesSchema,
    UpdateConfigProfileCommand
} from '@remnawave/backend-contract'
import { z } from 'zod'

export const CONFIG_CORE_TYPE = {
    XRAY: 'xray',
    SINGBOX: 'singbox'
} as const

export const CoreTypeSchema = z.enum([CONFIG_CORE_TYPE.XRAY, CONFIG_CORE_TYPE.SINGBOX])
export type TCoreType = z.infer<typeof CoreTypeSchema>

export const ConfigProfileWithCoreSchema = ConfigProfileSchema.extend({
    coreType: CoreTypeSchema.catch(CONFIG_CORE_TYPE.XRAY)
})
export type TConfigProfileWithCore = z.infer<typeof ConfigProfileWithCoreSchema>

export const CreateConfigProfileWithCoreCommand = {
    ...CreateConfigProfileCommand,
    RequestBodySchema: CreateConfigProfileCommand.RequestBodySchema.extend({
        coreType: CoreTypeSchema.default(CONFIG_CORE_TYPE.XRAY)
    }),
    ResponseSchema: z.object({
        response: ConfigProfileWithCoreSchema
    })
}

export const UpdateConfigProfileWithCoreCommand = {
    ...UpdateConfigProfileCommand,
    RequestBodySchema: UpdateConfigProfileCommand.RequestBodySchema.extend({
        coreType: CoreTypeSchema.optional()
    }),
    ResponseSchema: z.object({
        response: ConfigProfileWithCoreSchema
    })
}

export const GetConfigProfilesWithCoreCommand = {
    ...GetConfigProfilesCommand,
    ResponseSchema: z.object({
        response: z.object({
            total: z.number(),
            configProfiles: z.array(ConfigProfileWithCoreSchema)
        })
    })
}

export const GetConfigProfileByUuidWithCoreCommand = {
    ...GetConfigProfileByUuidCommand,
    ResponseSchema: z.object({
        response: ConfigProfileWithCoreSchema
    })
}

const NodeVersionsWithCoreSchema = z.object({
    coreType: CoreTypeSchema.optional(),
    core: z.string().optional(),
    xray: z.string(),
    singbox: z.string().optional(),
    node: z.string()
})

export const NodeWithCoreSchema = NodesSchema.extend({
    versions: NodeVersionsWithCoreSchema.nullable(),
    coreUptime: z.number().optional()
})
export type TNodeWithCore = z.infer<typeof NodeWithCoreSchema>

export const GetAllNodesWithCoreCommand = {
    ...GetNodesCommand,
    ResponseSchema: z.object({
        response: z.array(NodeWithCoreSchema)
    })
}

export const GetOneNodeWithCoreCommand = {
    ...GetNodeCommand,
    ResponseSchema: z.object({
        response: NodeWithCoreSchema
    })
}
