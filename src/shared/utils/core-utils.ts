import { CONFIG_CORE_TYPE, TCoreType } from '@shared/api/contracts/core-contract'

type CoreAwareNode = {
    coreUptime?: number
    versions: null | {
        core?: string
        coreType?: TCoreType
        node: string
        singbox?: string
        xray: string
    }
    xrayUptime: number
}

export const getConfigProfileCoreType = (profile: object): TCoreType => {
    if (
        'coreType' in profile &&
        (profile.coreType === CONFIG_CORE_TYPE.XRAY ||
            profile.coreType === CONFIG_CORE_TYPE.SINGBOX)
    ) {
        return profile.coreType
    }

    return CONFIG_CORE_TYPE.XRAY
}

export const getNodeCoreType = (node: CoreAwareNode): TCoreType =>
    node.versions?.coreType ?? CONFIG_CORE_TYPE.XRAY

export const getNodeCoreVersion = (node: CoreAwareNode): string | null => {
    if (!node.versions) return null

    return (
        node.versions.core ??
        (getNodeCoreType(node) === CONFIG_CORE_TYPE.SINGBOX
            ? (node.versions.singbox ?? node.versions.xray)
            : node.versions.xray)
    )
}

export const getNodeCoreUptime = (node: CoreAwareNode): number => node.coreUptime ?? node.xrayUptime

export const getCoreLabel = (coreType: TCoreType): string =>
    coreType === CONFIG_CORE_TYPE.SINGBOX ? 'sing-box' : 'Xray'
