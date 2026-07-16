import { notifications } from '@mantine/notifications'
import {
    DeleteConfigProfileCommand,
    ReorderConfigProfileCommand
} from '@remnawave/backend-contract'

import {
    CreateConfigProfileWithCoreCommand,
    UpdateConfigProfileWithCoreCommand
} from '@shared/api/contracts/core-contract'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateConfigProfile = createMutationHook({
    endpoint: UpdateConfigProfileWithCoreCommand.TSQ_url,
    bodySchema: UpdateConfigProfileWithCoreCommand.RequestSchema,
    responseSchema: UpdateConfigProfileWithCoreCommand.ResponseSchema,
    requestMethod: UpdateConfigProfileWithCoreCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Config updated successfully',
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: `Update Config Profile`,
                message:
                    error instanceof Error ? error.message : `Request failed with unknown error.`,
                color: 'red'
            })
        }
    }
})

export const useDeleteConfigProfile = createMutationHook({
    endpoint: DeleteConfigProfileCommand.TSQ_url,
    responseSchema: DeleteConfigProfileCommand.ResponseSchema,
    routeParamsSchema: DeleteConfigProfileCommand.RequestSchema,
    requestMethod: DeleteConfigProfileCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Config deleted successfully',
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: `Delete Config Profile`,
                message:
                    error instanceof Error ? error.message : `Request failed with unknown error.`,
                color: 'red'
            })
        }
    }
})

export const useCreateConfigProfile = createMutationHook({
    endpoint: CreateConfigProfileWithCoreCommand.TSQ_url,
    responseSchema: CreateConfigProfileWithCoreCommand.ResponseSchema,
    bodySchema: CreateConfigProfileWithCoreCommand.RequestSchema,
    requestMethod: CreateConfigProfileWithCoreCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Config created successfully',
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: `Create Config Profile`,
                message:
                    error instanceof Error ? error.message : `Request failed with unknown error.`,
                color: 'red'
            })
        }
    }
})

export const useReorderConfigProfiles = createMutationHook({
    endpoint: ReorderConfigProfileCommand.TSQ_url,
    bodySchema: ReorderConfigProfileCommand.RequestSchema,
    responseSchema: ReorderConfigProfileCommand.ResponseSchema,
    requestMethod: ReorderConfigProfileCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: `Reorder Config Profiles`,
                message:
                    error instanceof Error ? error.message : `Request failed with unknown error.`,
                color: 'red'
            })
        }
    }
})
