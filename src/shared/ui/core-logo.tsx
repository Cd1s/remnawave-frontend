import { TbBox } from 'react-icons/tb'

import { TCoreType } from '@shared/api/contracts/core-contract'
import { XrayLogo } from '@shared/ui/logos'

interface CoreLogoProps {
    color?: string
    coreType: TCoreType
    size?: number | string
}

export const CoreLogo = ({ color, coreType, size = 16 }: CoreLogoProps) =>
    coreType === 'singbox' ? (
        <TbBox color={color} size={size} />
    ) : (
        <XrayLogo color={color} size={size} />
    )
