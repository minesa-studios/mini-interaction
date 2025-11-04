import {
        type APIAutoModerationAction,
        type APIAutoModerationRuleTriggerMetadata,
        AutoModerationRuleEventType,
        AutoModerationRuleTriggerType,
} from "discord-api-types/v10";
import type { RESTPostAPIAutoModerationRuleJSONBody } from "discord-api-types/v10";

import type { JSONEncodable } from "./shared.js";
import { resolveJSONEncodable } from "./shared.js";

/**
 * Shape describing initial data used to seed the auto moderation rule builder.
 */
export type AutomodRuleBuilderData = Partial<RESTPostAPIAutoModerationRuleJSONBody> & {
        name?: string;
        event_type?: AutoModerationRuleEventType;
        trigger_type?: AutoModerationRuleTriggerType;
        actions?: APIAutoModerationAction[];
};

/** Builder that produces Discord auto moderation rule payloads. */
export class AutomodRuleBuilder
        implements JSONEncodable<RESTPostAPIAutoModerationRuleJSONBody>
{
        private data: AutomodRuleBuilderData;

        constructor(data: AutomodRuleBuilderData = {}) {
                this.data = {
                        ...data,
                        actions: data.actions?.map(cloneAutoModerationAction) ?? [],
                        trigger_metadata: data.trigger_metadata
                                ? cloneTriggerMetadata(data.trigger_metadata)
                                : undefined,
                        exempt_roles: data.exempt_roles ? [...data.exempt_roles] : undefined,
                        exempt_channels: data.exempt_channels
                                ? [...data.exempt_channels]
                                : undefined,
                };
        }

        /** Sets the name of the rule. */
        setName(name: string): this {
                this.data.name = name;
                return this;
        }

        /** Sets the event type that will trigger the rule. */
        setEventType(eventType: AutoModerationRuleEventType): this {
                this.data.event_type = eventType;
                return this;
        }

        /** Sets the trigger type for the rule. */
        setTriggerType(triggerType: AutoModerationRuleTriggerType): this {
                this.data.trigger_type = triggerType;
                return this;
        }

        /**
         * Assigns trigger metadata describing how the rule should match content.
         */
        setTriggerMetadata(
                metadata: APIAutoModerationRuleTriggerMetadata | null | undefined,
        ): this {
                this.data.trigger_metadata = metadata
                        ? cloneTriggerMetadata(metadata)
                        : undefined;
                return this;
        }

        /**
         * Replaces the actions executed when the rule triggers.
         */
        setActions(
                actions: Array<
                        APIAutoModerationAction | JSONEncodable<APIAutoModerationAction>
                >,
        ): this {
                this.data.actions = actions.map((action) =>
                        cloneAutoModerationAction(resolveJSONEncodable(action)),
                );
                return this;
        }

        /** Adds an action to execute when the rule triggers. */
        addAction(
                action: APIAutoModerationAction | JSONEncodable<APIAutoModerationAction>,
        ): this {
                if (!this.data.actions) {
                        this.data.actions = [];
                }

                this.data.actions.push(
                        cloneAutoModerationAction(resolveJSONEncodable(action)),
                );
                return this;
        }

        /** Enables or disables the rule. */
        setEnabled(enabled: boolean): this {
                this.data.enabled = enabled;
                return this;
        }

        /** Replaces the list of exempt role ids. */
        setExemptRoles(roleIds: string[]): this {
                this.data.exempt_roles = [...roleIds];
                return this;
        }

        /** Adds an exempt role id if not already present. */
        addExemptRole(roleId: string): this {
                if (!this.data.exempt_roles) {
                        this.data.exempt_roles = [];
                }

                if (!this.data.exempt_roles.includes(roleId)) {
                        this.data.exempt_roles.push(roleId);
                }

                return this;
        }

        /** Replaces the list of exempt channel ids. */
        setExemptChannels(channelIds: string[]): this {
                this.data.exempt_channels = [...channelIds];
                return this;
        }

        /** Adds an exempt channel id if not already present. */
        addExemptChannel(channelId: string): this {
                if (!this.data.exempt_channels) {
                        this.data.exempt_channels = [];
                }

                if (!this.data.exempt_channels.includes(channelId)) {
                        this.data.exempt_channels.push(channelId);
                }

                return this;
        }

        /** Serialises the builder into a REST auto moderation rule payload. */
        toJSON(): RESTPostAPIAutoModerationRuleJSONBody {
                const { name, event_type, trigger_type } = this.data;
                const actions = this.data.actions ?? [];

                if (!name) {
                        throw new Error("[AutomodRuleBuilder] name is required");
                }

                if (event_type === undefined) {
                        throw new Error("[AutomodRuleBuilder] event type is required");
                }

                if (trigger_type === undefined) {
                        throw new Error("[AutomodRuleBuilder] trigger type is required");
                }

                if (actions.length === 0) {
                        throw new Error(
                                "[AutomodRuleBuilder] at least one action is required",
                        );
                }

                return {
                        name,
                        event_type,
                        trigger_type,
                        trigger_metadata: this.data.trigger_metadata
                                ? cloneTriggerMetadata(this.data.trigger_metadata)
                                : undefined,
                        actions: actions.map(cloneAutoModerationAction),
                        enabled: this.data.enabled,
                        exempt_roles: this.data.exempt_roles
                                ? [...this.data.exempt_roles]
                                : undefined,
                        exempt_channels: this.data.exempt_channels
                                ? [...this.data.exempt_channels]
                                : undefined,
                };
        }
}

function cloneTriggerMetadata(
        metadata: APIAutoModerationRuleTriggerMetadata,
): APIAutoModerationRuleTriggerMetadata {
        return {
                keyword_filter: metadata.keyword_filter
                        ? [...metadata.keyword_filter]
                        : undefined,
                presets: metadata.presets ? [...metadata.presets] : undefined,
                allow_list: metadata.allow_list ? [...metadata.allow_list] : undefined,
                regex_patterns: metadata.regex_patterns
                        ? [...metadata.regex_patterns]
                        : undefined,
                mention_total_limit: metadata.mention_total_limit,
                mention_raid_protection_enabled:
                        metadata.mention_raid_protection_enabled,
        };
}

function cloneAutoModerationAction(
        action: APIAutoModerationAction,
): APIAutoModerationAction {
        return {
                type: action.type,
                metadata: action.metadata
                        ? {
                                  channel_id: action.metadata.channel_id,
                                  duration_seconds: action.metadata.duration_seconds,
                                  custom_message: action.metadata.custom_message,
                          }
                        : undefined,
        };
}
