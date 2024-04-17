export const TOOLTIP_THEME = {
    "target": "cc-w-fit",
    "animation": "cc-transition-opacity",
    "arrow": {
        "base": "cc-absolute cc-z-10 cc-h-2 cc-w-2 cc-rotate-45",
        "style": {
            "dark": "cc-bg-gray-900 cc-dark:bg-gray-700",
            "light": "cc-bg-white",
            "auto": "cc-bg-white cc-dark:bg-gray-700"
        },
        "placement": "-4px"
    },
    "base": "cc-absolute cc-z-10 cc-inline-block cc-rounded-lg cc-px-3 cc-py-2 cc-text-sm cc-font-medium cc-shadow-sm",
    "hidden": "cc-invisible cc-opacity-0",
    "style": {
        "dark": "cc-bg-gray-900 cc-text-white cc-dark:bg-gray-700",
        "light": "cc-border cc-border-gray-200 cc-bg-white cc-text-gray-900",
        "auto": "cc-border cc-border-gray-200 cc-bg-white cc-text-gray-900 cc-dark:border-none cc-dark:bg-gray-700 cc-dark:text-white"
    },
    "content": "cc-relative cc-z-20"
}