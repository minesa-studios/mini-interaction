import type {
        APIComponentInContainer,
        APIContainerComponent,
        APIMediaGalleryComponent,
        APIMediaGalleryItem,
        APISectionAccessoryComponent,
        APISectionComponent,
        APISeparatorComponent,
        APITextDisplayComponent,
        APIThumbnailComponent,
        APIUnfurledMediaItem,
} from "discord-api-types/v10";
import { ComponentType, SeparatorSpacingSize } from "discord-api-types/v10";

import type { JSONEncodable } from "./shared.js";
import { resolveJSONEncodable } from "./shared.js";

/** Structured message container payload. */
export type MiniContainerComponent = APIContainerComponent;

/** Section within a structured message container. */
export type MiniSectionComponent = APISectionComponent;

/** Text display structured message component. */
export type MiniTextDisplayComponent = APITextDisplayComponent;

/** Separator structured message component. */
export type MiniSeparatorComponent = APISeparatorComponent;

/** Thumbnail payload used within sections. */
export type MiniThumbnailComponent = APIThumbnailComponent;

/** Gallery item payload. */
export type MiniGalleryItemComponent = APIMediaGalleryItem;

/** Gallery structured message component. */
export type MiniGalleryComponent = APIMediaGalleryComponent;

/** Union of supported components within a container. */
export type MiniContentComponent = APIComponentInContainer;

/** Union of supported section accessory components. */
export type MiniSectionAccessoryComponent = APISectionAccessoryComponent;

/** Data accepted by the container builder constructor. */
export type MiniContainerBuilderData = Partial<
        Omit<MiniContainerComponent, "components">
> & {
        components?: Array<MiniContentComponent | JSONEncodable<MiniContentComponent>>;
};

/** Data accepted by the section builder constructor. */
export type MiniSectionBuilderData = Partial<
        Omit<MiniSectionComponent, "components" | "accessory">
> & {
        components?: Array<MiniTextDisplayComponent | JSONEncodable<MiniTextDisplayComponent>>;
        accessory?: MiniSectionAccessoryComponent | JSONEncodable<MiniSectionAccessoryComponent>;
};

/** Data accepted by the text display builder constructor. */
export type MiniTextDisplayBuilderData = Partial<MiniTextDisplayComponent>;

/** Data accepted by the separator builder constructor. */
export type MiniSeparatorBuilderData = Partial<MiniSeparatorComponent>;

/** Data accepted by the gallery builder constructor. */
export type MiniGalleryBuilderData = Partial<
        Omit<MiniGalleryComponent, "items">
> & {
        items?: Array<MiniGalleryItemComponent | JSONEncodable<MiniGalleryItemComponent>>;
};

/** Data accepted by the gallery item builder constructor. */
export type MiniGalleryItemBuilderData = Partial<MiniGalleryItemComponent>;

/** Data accepted by the thumbnail builder constructor. */
export type MiniThumbnailBuilderData = Partial<MiniThumbnailComponent>;

function cloneContainerComponent(
        component: MiniContentComponent | JSONEncodable<MiniContentComponent>,
): MiniContentComponent {
        const resolved = resolveJSONEncodable(component) as MiniContentComponent;
        return { ...resolved };
}

function cloneAccessory(
        accessory:
                | MiniSectionAccessoryComponent
                | JSONEncodable<MiniSectionAccessoryComponent>,
): MiniSectionAccessoryComponent {
        const resolved = resolveJSONEncodable(accessory) as MiniSectionAccessoryComponent;
        return { ...resolved };
}

/** Builder for structured message container payloads. */
export class MiniContainerBuilder implements JSONEncodable<MiniContainerComponent> {
        private data: Partial<MiniContainerComponent>;

        constructor(data: MiniContainerBuilderData = {}) {
                const components = data.components
                        ? data.components.map((component) => cloneContainerComponent(component))
                        : [];

                this.data = {
                        ...data,
                        type: ComponentType.Container,
                        components,
                };
        }

        /** Replaces the components contained in the container. */
        setComponents(
                components: Array<MiniContentComponent | JSONEncodable<MiniContentComponent>>,
        ): this {
                this.data.components = components.map((component) =>
                        cloneContainerComponent(component),
                );
                return this;
        }

        /** Replaces the sections contained in the container. */
        setSections(
                sections: Array<MiniSectionComponent | JSONEncodable<MiniSectionComponent>>,
        ): this {
                return this.setComponents(sections);
        }

        /** Adds a component to the container. */
        addComponent(
                component: MiniContentComponent | JSONEncodable<MiniContentComponent>,
        ): this {
                this.data.components ??= [];
                this.data.components.push(cloneContainerComponent(component));
                return this;
        }

        /** Adds a section to the container. */
        addSection(
                section: MiniSectionComponent | JSONEncodable<MiniSectionComponent>,
        ): this {
                return this.addComponent(section);
        }

        /** Sets or clears the accent colour on the container. */
        setAccentColor(color: number | null | undefined): this {
                if (color === undefined) {
                        delete this.data.accent_color;
                } else {
                        this.data.accent_color = color ?? null;
                }

                return this;
        }

        /** Marks the container as a spoiler. */
        setSpoiler(spoiler: boolean | null | undefined): this {
                if (spoiler === null || spoiler === undefined) {
                        delete this.data.spoiler;
                } else {
                        this.data.spoiler = spoiler;
                }

                return this;
        }

        /** Serialises the container into a structured message payload. */
        toJSON(): MiniContainerComponent {
                const components = this.data.components ?? [];

                return {
                        ...(this.data as MiniContainerComponent),
                        type: ComponentType.Container,
                        components: components.map((component) => ({ ...component })),
                };
        }
}

/** Builder for structured message sections. */
export class MiniSectionBuilder implements JSONEncodable<MiniSectionComponent> {
        private data: Partial<MiniSectionComponent>;

        constructor(data: MiniSectionBuilderData = {}) {
                const components = data.components
                        ? data.components.map((component) => cloneTextDisplayComponent(component))
                        : [];
                const rawAccessory = data.accessory;
                const accessory =
                        rawAccessory === undefined || rawAccessory === null
                                ? undefined
                                : cloneAccessory(rawAccessory);

                this.data = {
                        ...data,
                        type: ComponentType.Section,
                        components,
                        accessory,
                };
        }

        /** Replaces the text components within the section. */
        setComponents(
                components: Array<MiniTextDisplayComponent | JSONEncodable<MiniTextDisplayComponent>>,
        ): this {
                this.data.components = components.map((component) =>
                        cloneTextDisplayComponent(component),
                );
                return this;
        }

        /** Adds a text component to the section. */
        addComponent(
                component: MiniTextDisplayComponent | JSONEncodable<MiniTextDisplayComponent>,
        ): this {
                this.data.components ??= [];
                this.data.components.push(cloneTextDisplayComponent(component));
                return this;
        }

        /** Sets or clears the accessory component. */
        setAccessory(
                accessory:
                        | MiniSectionAccessoryComponent
                        | JSONEncodable<MiniSectionAccessoryComponent>
                        | null
                        | undefined,
        ): this {
                if (accessory === null || accessory === undefined) {
                        this.data.accessory = undefined;
                } else {
                        this.data.accessory = cloneAccessory(accessory);
                }

                return this;
        }

        /** Serialises the section into a structured message payload. */
        toJSON(): MiniSectionComponent {
                const components = this.data.components ?? [];
                const accessory = this.data.accessory ? { ...this.data.accessory } : undefined;

                if (!accessory) {
                        throw new Error("[MiniSectionBuilder] accessory is required for sections");
                }

                return {
                        ...(this.data as MiniSectionComponent),
                        type: ComponentType.Section,
                        components: components.map((component) => ({ ...component })),
                        accessory,
                };
        }
}

function cloneTextDisplayComponent(
        component:
                | MiniTextDisplayComponent
                | JSONEncodable<MiniTextDisplayComponent>,
): MiniTextDisplayComponent {
        const resolved = resolveJSONEncodable(component) as MiniTextDisplayComponent;
        return { ...resolved };
}

/** Builder for structured message text display components. */
export class MiniTextDisplayBuilder
        implements JSONEncodable<MiniTextDisplayComponent>
{
        private data: Partial<MiniTextDisplayComponent>;

        constructor(data: MiniTextDisplayBuilderData = {}) {
                this.data = {
                        ...data,
                        type: ComponentType.TextDisplay,
                };
        }

        /** Sets or clears the primary text content. */
        setContent(content: string | null | undefined): this {
                if (content === null || content === undefined) {
                        delete this.data.content;
                } else {
                        this.data.content = content;
                }

                return this;
        }

        /** Serialises the component into a structured message payload. */
        toJSON(): MiniTextDisplayComponent {
                if (!this.data.content) {
                        throw new Error("[MiniTextDisplayBuilder] content is required for text displays");
                }

                return {
                        ...(this.data as MiniTextDisplayComponent),
                        type: ComponentType.TextDisplay,
                };
        }
}

/** Builder for structured message separator components. */
export class MiniSeparatorBuilder
        implements JSONEncodable<MiniSeparatorComponent>
{
        private data: Partial<MiniSeparatorComponent>;

        constructor(data: MiniSeparatorBuilderData = {}) {
                this.data = {
                        ...data,
                        type: ComponentType.Separator,
                };
        }

        /** Sets whether the separator should render a divider. */
        setDivider(divider: boolean | null | undefined): this {
                if (divider === null || divider === undefined) {
                        delete this.data.divider;
                } else {
                        this.data.divider = divider;
                }

                return this;
        }

        /** Sets the separator spacing value. */
        setSpacing(spacing: SeparatorSpacingSize | null | undefined): this {
                if (spacing === null || spacing === undefined) {
                        delete this.data.spacing;
                } else {
                        this.data.spacing = spacing;
                }

                return this;
        }

        /** Serialises the separator payload. */
        toJSON(): MiniSeparatorComponent {
                return {
                        ...(this.data as MiniSeparatorComponent),
                        type: ComponentType.Separator,
                };
        }
}

/** Builder for structured message thumbnails. */
export class MiniThumbnailBuilder
        implements JSONEncodable<MiniThumbnailComponent>
{
        private data: Partial<MiniThumbnailComponent>;

        constructor(data: MiniThumbnailBuilderData = {}) {
                this.data = {
                        ...data,
                        type: ComponentType.Thumbnail,
                        media: data.media ? { ...data.media } : undefined,
                };
        }

        /** Sets the media payload for the thumbnail. */
        setMedia(media: APIUnfurledMediaItem | null | undefined): this {
                if (media === null || media === undefined) {
                        delete this.data.media;
                } else {
                        this.data.media = { ...media };
                }

                return this;
        }

        /** Sets the thumbnail description. */
        setDescription(description: string | null | undefined): this {
                if (description === null || description === undefined) {
                        delete this.data.description;
                } else {
                        this.data.description = description;
                }

                return this;
        }

        /** Marks the thumbnail as a spoiler. */
        setSpoiler(spoiler: boolean | null | undefined): this {
                if (spoiler === null || spoiler === undefined) {
                        delete this.data.spoiler;
                } else {
                        this.data.spoiler = spoiler;
                }

                return this;
        }

        /** Serialises the thumbnail payload. */
        toJSON(): MiniThumbnailComponent {
                if (!this.data.media) {
                        throw new Error("[MiniThumbnailBuilder] media is required for thumbnails");
                }

                return {
                        ...(this.data as MiniThumbnailComponent),
                        type: ComponentType.Thumbnail,
                };
        }
}

/** Builder for structured message gallery items. */
export class MiniGalleryItemBuilder
        implements JSONEncodable<MiniGalleryItemComponent>
{
        private data: Partial<MiniGalleryItemComponent>;

        constructor(data: MiniGalleryItemBuilderData = {}) {
                this.data = {
                        ...data,
                        media: data.media ? { ...data.media } : undefined,
                };
        }

        /** Sets the media item payload. */
        setMedia(media: APIUnfurledMediaItem | null | undefined): this {
                if (media === null || media === undefined) {
                        delete this.data.media;
                } else {
                        this.data.media = { ...media };
                }

                return this;
        }

        /** Sets the media description. */
        setDescription(description: string | null | undefined): this {
                if (description === null || description === undefined) {
                        delete this.data.description;
                } else {
                        this.data.description = description;
                }

                return this;
        }

        /** Marks the media item as a spoiler. */
        setSpoiler(spoiler: boolean | null | undefined): this {
                if (spoiler === null || spoiler === undefined) {
                        delete this.data.spoiler;
                } else {
                        this.data.spoiler = spoiler;
                }

                return this;
        }

        /** Serialises the gallery item payload. */
        toJSON(): MiniGalleryItemComponent {
                if (!this.data.media) {
                        throw new Error("[MiniGalleryItemBuilder] media is required for gallery items");
                }

                return {
                        ...(this.data as MiniGalleryItemComponent),
                        media: { ...this.data.media },
                };
        }
}

/** Builder for structured message gallery components. */
export class MiniGalleryBuilder implements JSONEncodable<MiniGalleryComponent> {
        private data: Partial<MiniGalleryComponent>;

        constructor(data: MiniGalleryBuilderData = {}) {
                const items = data.items
                        ? data.items.map((item) => resolveGalleryItem(item))
                        : [];

                this.data = {
                        ...data,
                        type: ComponentType.MediaGallery,
                        items,
                };
        }

        /** Replaces the gallery items. */
        setItems(
                items: Array<MiniGalleryItemComponent | JSONEncodable<MiniGalleryItemComponent>>,
        ): this {
                this.data.items = items.map((item) => resolveGalleryItem(item));
                return this;
        }

        /** Adds a gallery item to the payload. */
        addItem(
                item: MiniGalleryItemComponent | JSONEncodable<MiniGalleryItemComponent>,
        ): this {
                this.data.items ??= [];
                this.data.items.push(resolveGalleryItem(item));
                return this;
        }

        /** Serialises the gallery payload. */
        toJSON(): MiniGalleryComponent {
                const items = this.data.items ?? [];

                if (items.length === 0) {
                        throw new Error("[MiniGalleryBuilder] at least one gallery item is required");
                }

                return {
                        ...(this.data as MiniGalleryComponent),
                        type: ComponentType.MediaGallery,
                        items: items.map((item) => ({ ...item })),
                };
        }
}

function resolveGalleryItem(
        item: MiniGalleryItemComponent | JSONEncodable<MiniGalleryItemComponent>,
): MiniGalleryItemComponent {
        const resolved = resolveJSONEncodable(item) as MiniGalleryItemComponent;
        if (!resolved.media) {
                throw new Error("[MiniGalleryBuilder] gallery items require media");
        }

        return {
                ...resolved,
                media: { ...resolved.media },
        };
}
