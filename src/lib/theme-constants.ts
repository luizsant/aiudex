// Constantes de tema para evitar duplicação de classes CSS

export const GRADIENTS = {
  // Gradientes de fundo principais
  PRIMARY: "bg-gradient-to-br from-slate-50 to-blue-50",
  SECONDARY: "bg-gradient-to-br from-blue-50 to-indigo-50",
  SUCCESS: "bg-gradient-to-br from-green-50 to-emerald-50",
  WARNING: "bg-gradient-to-br from-yellow-50 to-orange-50",
  DANGER: "bg-gradient-to-br from-red-50 to-pink-50",
  PURPLE: "bg-gradient-to-br from-purple-50 to-blue-50",
  EMERALD: "bg-gradient-to-br from-emerald-50 to-teal-50",

  // Gradientes de botões
  BUTTON_PRIMARY: "bg-gradient-to-r from-blue-600 to-green-600",
  BUTTON_SECONDARY: "bg-gradient-to-r from-purple-600 to-blue-600",
  BUTTON_SUCCESS: "bg-gradient-to-r from-green-500 to-blue-500",
  BUTTON_WARNING: "bg-gradient-to-r from-orange-500 to-yellow-500",
  BUTTON_DANGER: "bg-gradient-to-r from-red-500 to-pink-500",

  // Gradientes de cards
  CARD_BLUE: "bg-gradient-to-br from-blue-500 to-blue-600",
  CARD_GREEN: "bg-gradient-to-br from-green-500 to-green-600",
  CARD_PURPLE: "bg-gradient-to-br from-purple-500 to-purple-600",
  CARD_ORANGE: "bg-gradient-to-br from-orange-500 to-orange-600",
  CARD_RED: "bg-gradient-to-br from-red-500 to-pink-500",

  // Gradientes de ícones
  ICON_PRIMARY: "bg-gradient-to-r from-blue-100 to-purple-100",
  ICON_SUCCESS: "bg-gradient-to-r from-green-100 to-blue-100",
  ICON_WARNING: "bg-gradient-to-r from-yellow-100 to-blue-100",
} as const;

export const SHADOWS = {
  // Sombras personalizadas
  AIUDEX: "shadow-aiudex",
  AIUDEX_LG: "shadow-aiudex-lg",
  AIUDEX_XL: "shadow-aiudex-xl",

  // Sombras com hover
  AIUDEX_HOVER: "shadow-aiudex hover:shadow-aiudex-lg",
  AIUDEX_LG_HOVER: "shadow-aiudex-lg hover:shadow-aiudex-xl",
} as const;

export const BACKGROUNDS = {
  // Backgrounds com backdrop blur
  GLASS: "bg-white/90 backdrop-blur-md",
  GLASS_DARK: "bg-slate-900/90 backdrop-blur-md",
  GLASS_LIGHT: "bg-white/80 backdrop-blur-sm",

  // Backgrounds de cards
  CARD_GLASS: "bg-white/80 backdrop-blur-sm border-blue-200/50",
  CARD_GLASS_HOVER:
    "bg-white/80 backdrop-blur-sm border-blue-200/50 hover:shadow-aiudex-lg",
} as const;

export const BORDERS = {
  // Bordas comuns
  PRIMARY: "border-2 border-blue-200/50",
  PRIMARY_FOCUS: "border-2 border-blue-200/50 focus:border-blue-500",
  GLASS: "border-2 border-blue-200/30",
  GLASS_FOCUS: "border-2 border-blue-200/30 focus:border-blue-500",
} as const;

export const TRANSITIONS = {
  // Transições comuns
  DEFAULT: "transition-all duration-300",
  FAST: "transition-all duration-200",
  SLOW: "transition-all duration-500",
  HOVER_SCALE: "transition-all duration-300 transform hover:scale-105",
  HOVER_SCALE_SMALL: "transition-all duration-300 transform hover:scale-[1.02]",
} as const;

export const ROUNDED = {
  // Bordas arredondadas
  SM: "rounded-lg",
  MD: "rounded-xl",
  LG: "rounded-2xl",
  XL: "rounded-3xl",
  FULL: "rounded-full",
} as const;

// Combinações comuns
export const COMMON_CLASSES = {
  CARD_BASE: `${BACKGROUNDS.CARD_GLASS} ${SHADOWS.AIUDEX} ${TRANSITIONS.DEFAULT}`,
  CARD_HOVER: `${BACKGROUNDS.CARD_GLASS_HOVER} ${TRANSITIONS.HOVER_SCALE_SMALL}`,
  BUTTON_PRIMARY: `${GRADIENTS.BUTTON_PRIMARY} ${SHADOWS.AIUDEX} ${TRANSITIONS.HOVER_SCALE} text-white font-bold`,
  BUTTON_SECONDARY: `${GRADIENTS.BUTTON_SECONDARY} ${SHADOWS.AIUDEX} ${TRANSITIONS.HOVER_SCALE} text-white font-bold`,
  INPUT_BASE: `${BORDERS.PRIMARY_FOCUS} ${ROUNDED.MD} ${BACKGROUNDS.GLASS_LIGHT} focus:ring-4 focus:ring-blue-400/30`,
  ICON_CONTAINER: `${GRADIENTS.ICON_PRIMARY} ${ROUNDED.LG} ${SHADOWS.AIUDEX} flex items-center justify-center`,
} as const;

// Função utilitária para combinar classes
export const combineClasses = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
