import {
    ActionIcon,
    ActionIconGroup,
    Button,
    Group,
    Modal,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Tooltip
} from '@mantine/core'
import { useField } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbBox, TbCode, TbPlus, TbRefresh } from 'react-icons/tb'
import { generatePath, useNavigate } from 'react-router'

import { queryClient } from '@shared/api'
import {
    CONFIG_CORE_TYPE,
    CreateConfigProfileWithCoreCommand,
    TCoreType
} from '@shared/api/contracts/core-contract'
import { QueryKeys, useCreateConfigProfile, useGetConfigProfiles } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { HelpActionIconShared } from '@shared/ui/help-drawer'
import { XrayLogo } from '@shared/ui/logos'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { UniversalSpotlightActionIconShared } from '@shared/ui/universal-spotlight'

import { CONFIG_PROFILES_VIEW_MODE } from '@entities/dashboard/view-preferences-store'

interface IProps {
    configProfileCount: number
    setViewMode: (viewMode: CONFIG_PROFILES_VIEW_MODE) => void
    viewMode: CONFIG_PROFILES_VIEW_MODE
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

export const ConfigProfilesHeaderActionButtonsFeature = (props: IProps) => {
    const { configProfileCount, setViewMode, viewMode } = props
    const { isFetching } = useGetConfigProfiles()
    const { t } = useTranslation()

    const [opened, { open, close }] = useDisclosure(false)
    const [coreType, setCoreType] = useState<TCoreType>(CONFIG_CORE_TYPE.XRAY)
    const navigate = useNavigate()

    const handleUpdate = async () => {
        await queryClient.refetchQueries({
            queryKey: QueryKeys.configProfiles.getConfigProfiles.queryKey
        })
    }

    const nameField = useField<
        ReturnType<typeof CreateConfigProfileWithCoreCommand.RequestSchema.parse>['name']
    >({
        initialValue: '',
        validateOnChange: true,
        validate: (value) => {
            const result = CreateConfigProfileWithCoreCommand.RequestSchema.pick({
                name: true
            }).safeParse({ name: value })
            return result.success ? null : result.error.errors[0]?.message
        }
    })
    const { mutate: createConfigProfile, isPending } = useCreateConfigProfile({
        mutationFns: {
            onSuccess: (data) => {
                close()
                nameField.reset()
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
        <Group grow preventGrowOverflow={false} wrap="wrap">
            <HelpActionIconShared hidden={false} screen="PAGE_CONFIG_PROFILES" />

            {configProfileCount > 0 && <UniversalSpotlightActionIconShared />}

            <ActionIconGroup>
                <ActionIcon
                    color="gray"
                    onClick={() =>
                        setViewMode(
                            viewMode === CONFIG_PROFILES_VIEW_MODE.PROFILES
                                ? CONFIG_PROFILES_VIEW_MODE.SNIPPETS
                                : CONFIG_PROFILES_VIEW_MODE.PROFILES
                        )
                    }
                    size="input-md"
                    variant="soft"
                >
                    {viewMode === CONFIG_PROFILES_VIEW_MODE.PROFILES ? (
                        <TbCode size="24px" />
                    ) : (
                        <XrayLogo size="24px" />
                    )}
                </ActionIcon>
            </ActionIconGroup>

            <ActionIconGroup>
                <Tooltip label={t('common.update')} withArrow>
                    <ActionIcon
                        loading={isFetching}
                        onClick={handleUpdate}
                        size="input-md"
                        variant="soft"
                    >
                        <TbRefresh size="24px" />
                    </ActionIcon>
                </Tooltip>
            </ActionIconGroup>

            <ActionIconGroup>
                <Tooltip
                    label={t('config-profiles-header-action-buttons.feature.create-config-profile')}
                    withArrow
                >
                    <ActionIcon color="teal" onClick={open} size="input-md" variant="soft">
                        <TbPlus size="24px" />
                    </ActionIcon>
                </Tooltip>
            </ActionIconGroup>

            <Modal
                centered
                onClose={close}
                opened={opened}
                size="md"
                title={
                    <BaseOverlayHeader
                        IconComponent={coreType === CONFIG_CORE_TYPE.XRAY ? XrayLogo : TbBox}
                        iconVariant="soft"
                        title={t(
                            'config-profiles-header-action-buttons.feature.create-config-profile'
                        )}
                    />
                }
            >
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
                            Choose the core for this profile, then customize its JSON configuration.
                            AnyTLS is available in sing-box profiles.
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
                            <Button color="gray" onClick={close} variant="light">
                                {t('common.cancel')}
                            </Button>

                            <Button color="teal" loading={isPending} type="submit">
                                {t('common.create')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Group>
    )
}
