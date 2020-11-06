import { Plugin, PluginConfig, PluginsServer } from './types'
import { PluginEvent } from 'posthog-plugins'

export async function processError(
    server: PluginsServer,
    plugin: Plugin,
    pluginConfig: PluginConfig | null,
    error: Error | string,
    event?: PluginEvent | null
) {
    console.error(error)

    const errorJson =
        typeof error === 'string'
            ? {
                  message: error,
                  time: new Date().toISOString(),
              }
            : {
                  message: error.message,
                  time: new Date().toISOString(),
                  name: error.name,
                  stack: error.stack,
                  event: event,
              }

    if (pluginConfig) {
        await server.db.query('UPDATE posthog_pluginconfig SET error = $1 WHERE id = $2', [errorJson, pluginConfig.id])
    } else {
        await server.db.query('UPDATE posthog_plugin SET error = $1 WHERE id = $2', [errorJson, plugin.id])
    }
}

export async function clearError(server: PluginsServer, plugin: Plugin, pluginConfig: PluginConfig | null) {
    if (pluginConfig) {
        await server.db.query('UPDATE posthog_pluginconfig SET error = NULL WHERE id = $1', [pluginConfig.id])
    } else {
        await server.db.query('UPDATE posthog_plugin SET error = NULL WHERE id = $1', [plugin.id])
    }
}
