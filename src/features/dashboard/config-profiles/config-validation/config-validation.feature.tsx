import type { editor } from 'monaco-editor'

import { GetSnippetsCommand } from '@remnawave/backend-contract'
import consola from 'consola/browser'
import dayjs from 'dayjs'
import { RefObject } from 'react'

import { CONFIG_CORE_TYPE, TCoreType } from '@shared/api/contracts/core-contract'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const replaceSnippetsInArray = (array: any[], snippetsMap: Map<string, unknown>): void => {
    for (let i = array.length - 1; i >= 0; i--) {
        const item = array[i]

        if (item.snippet) {
            const snippet = snippetsMap.get(item.snippet)

            if (snippet) {
                if (Array.isArray(snippet)) {
                    array.splice(i, 1, ...snippet)
                } else {
                    // eslint-disable-next-line no-param-reassign
                    array[i] = snippet
                }
            } else {
                consola.error(`Snippet ${item.snippet} not found`)
                array.splice(i, 1)
            }
        }
    }
}

export const ConfigValidationFeature = {
    validate: (
        editorRef: RefObject<editor.IStandaloneCodeEditor | null>,

        setResult: (message: string) => void,
        setIsConfigValid: (isValid: boolean) => void,
        snippetsMap: Map<
            string,
            GetSnippetsCommand.Response['response']['snippets'][number]['snippet']
        >,
        coreType: TCoreType
    ) => {
        try {
            if (!editorRef.current) return

            const currentValue = editorRef.current.getValue()

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let clonedCurrentValue: any
            try {
                clonedCurrentValue = JSON.parse(currentValue)
            } catch {
                setResult(`${dayjs().format('HH:mm:ss')} | Invalid JSON.`)
                setIsConfigValid(false)
                return
            }

            if (clonedCurrentValue.outbounds) {
                replaceSnippetsInArray(clonedCurrentValue.outbounds, snippetsMap)
            }

            if (coreType === CONFIG_CORE_TYPE.SINGBOX) {
                if (clonedCurrentValue.route?.rules) {
                    replaceSnippetsInArray(clonedCurrentValue.route.rules, snippetsMap)
                }

                if (clonedCurrentValue.route?.rule_set) {
                    replaceSnippetsInArray(clonedCurrentValue.route.rule_set, snippetsMap)
                }

                if (
                    !Array.isArray(clonedCurrentValue.inbounds) ||
                    !clonedCurrentValue.inbounds.length
                ) {
                    setResult(`${dayjs().format('HH:mm:ss')} | sing-box config requires inbounds.`)
                    setIsConfigValid(false)
                    return
                }

                const seenTags = new Set<string>()
                for (const inbound of clonedCurrentValue.inbounds) {
                    if (!inbound || typeof inbound !== 'object' || !inbound.type || !inbound.tag) {
                        setResult(
                            `${dayjs().format('HH:mm:ss')} | Every sing-box inbound requires type and tag.`
                        )
                        setIsConfigValid(false)
                        return
                    }

                    if (seenTags.has(inbound.tag) || String(inbound.tag).includes(',')) {
                        setResult(
                            `${dayjs().format('HH:mm:ss')} | sing-box inbound tags must be unique and cannot contain commas.`
                        )
                        setIsConfigValid(false)
                        return
                    }
                    seenTags.add(inbound.tag)

                    if (inbound.type === 'anytls' && inbound.tls?.enabled !== true) {
                        setResult(
                            `${dayjs().format('HH:mm:ss')} | AnyTLS requires tls.enabled: true.`
                        )
                        setIsConfigValid(false)
                        return
                    }
                }

                setResult(`${dayjs().format('HH:mm:ss')} | sing-box config structure is valid.`)
                setIsConfigValid(true)
                return
            }

            if (clonedCurrentValue.routing?.rules) {
                replaceSnippetsInArray(clonedCurrentValue.routing.rules, snippetsMap)
            }

            if (clonedCurrentValue.routing?.balancers) {
                replaceSnippetsInArray(clonedCurrentValue.routing.balancers, snippetsMap)
            }

            const validationResult = window.XrayParseConfig(JSON.stringify(clonedCurrentValue))

            setResult(
                `${dayjs().format('HH:mm:ss')} | ${validationResult || 'Xray config is valid.'}`
            )
            setIsConfigValid(!validationResult)
        } catch (err: unknown) {
            const message = (err as Error).message
            if (message?.includes('Go program has already exited')) {
                setResult(`${dayjs().format('HH:mm:ss')} | WASM module crashed, restarting...`)
            } else {
                setResult(`${dayjs().format('HH:mm:ss')} | Validation error: ${message}`)
            }
            setIsConfigValid(false)
        }
    }
}
