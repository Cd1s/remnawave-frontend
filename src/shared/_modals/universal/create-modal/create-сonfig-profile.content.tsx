import { Button, Group, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import { useField } from '@mantine/form'
import { t } from 'i18next'
import { useState } from 'react'
import { generatePath, NavigateFunction } from 'react-router'

import { queryClient } from '@shared/api'
import {
    CONFIG_CORE_TYPE,
    CreateConfigProfileWithCoreCommand,
    TCoreType
} from '@shared/api/contracts/core-contract'
import { useCreateConfigProfile } from '@shared/api/hooks/config-profiles/config-profiles.mutation.hooks'
import { QueryKeys } from '@shared/api/hooks/keys-factory'
import { ROUTES } from '@shared/constants/routes'

interface IProps {
    onClose: () => void
    navigate: NavigateFunction
}

const generateDefaultConfig = (coreType: TCoreType) => {
    const randomNumber = Math.floor(Math.random() * 999999) + 1

    if (coreType === CONFIG_CORE_TYPE.SINGBOX) {
        return {
            log: {
                level: 'info',
                timestamp: true
            },
            inbounds: [
                {
                    type: 'anytls',
                    tag: `AnyTLS_${randomNumber}`,
                    listen: '::',
                    listen_port: 443,
                    users: [],
                    tls: {
                        enabled: true,
                        certificate_path: '/etc/remnawave/tls/fullchain.pem',
                        key_path: '/etc/remnawave/tls/privkey.pem'
                    }
                }
            ],
            outbounds: [
                {
                    type: 'direct',
                    tag: 'DIRECT'
                },
                {
                    type: 'block',
                    tag: 'BLOCK'
                }
            ],
            route: {
                rules: []
            }
        }
    }

    return {
        log: {
            loglevel: 'info'
        },
        inbounds: [
            {
                tag: `Shadowsocks_${randomNumber}`,
                port: 1234,
                protocol: 'shadowsocks',
                settings: {
                    clients: [],
                    method: 'chacha20-ietf-poly1305',
                    network: 'tcp,udp'
                },
                sniffing: {
                    enabled: true,
                    destOverride: ['http', 'tls', 'quic']
                }
            }
        ],
        outbounds: [
            {
                protocol: 'freedom',
                tag: 'DIRECT'
            },
            {
                protocol: 'blackhole',
                tag: 'BLOCK'
            }
        ],
        routing: {
            rules: []
        }
    }
}

export const CreateConfigProfileContent = (props: IProps) => {
    const { onClose, navigate } = props
    const [coreType, setCoreType] = useState<TCoreType>(CONFIG_CORE_TYPE.XRAY)

    const handleUpdate = async () => {
        await queryClient.refetchQueries({
            queryKey: QueryKeys.configProfiles.getConfigProfiles.queryKey
        })
    }

    const nameField = useField<
        ReturnType<typeof CreateConfigProfileWithCoreCommand.RequestBodySchema.parse>['name']
    >({
        initialValue: '',
        validateOnChange: true,
        validate: (value) => {
            const result = CreateConfigProfileWithCoreCommand.RequestBodySchema.pick({
                name: true
            }).safeParse({ name: value })
            return result.success ? null : result.error.issues[0]?.message
        }
    })
    const { mutate: createConfigProfile, isPending } = useCreateConfigProfile({
        mutationFns: {
            onSuccess: (data) => {
                onClose()

                setCoreType(CONFIG_CORE_TYPE.XRAY)
                handleUpdate()
                navigate(
                    generatePath(ROUTES.DASHBOARD.MANAGEMENT.CONFIG_PROFILE_BY_UUID, {
                        uuid: data.uuid
                    })
                )
            }
        }
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                createConfigProfile({
                    variables: {
                        name: nameField.getValue(),
                        coreType,
                        config: generateDefaultConfig(coreType)
                    }
                })
            }}
        >
            <Stack gap="md">
                <Text size="sm">
                    Choose the core for this profile, then customize its JSON configuration. AnyTLS
                    is available in sing-box profiles.
                </Text>
                <SegmentedControl
                    data={[
                        { label: 'Xray', value: CONFIG_CORE_TYPE.XRAY },
                        { label: 'sing-box + AnyTLS', value: CONFIG_CORE_TYPE.SINGBOX }
                    ]}
                    fullWidth
                    onChange={(value) => setCoreType(value as TCoreType)}
                    value={coreType}
                />
                <TextInput
                    data-autofocus
                    label={t('config-profiles-header-action-buttons.feature.profile-name')}
                    placeholder={t(
                        'config-profiles-header-action-buttons.feature.enter-profile-name'
                    )}
                    required
                    {...nameField.getInputProps()}
                />
                <Group justify="flex-end">
                    <Button color="gray" onClick={onClose} variant="light">
                        {t('common.action.cancel')}
                    </Button>

                    <Button color="teal" loading={isPending} type="submit">
                        {t('common.action.create')}
                    </Button>
                </Group>
            </Stack>
        </form>
    )
}
