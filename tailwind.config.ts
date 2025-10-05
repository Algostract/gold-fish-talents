import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    fontSize: {
      '3xs': ['0.5rem', '0.5625rem'],
      '2xs': ['0.625rem', '0.75rem'],
      xs: ['0.75rem', '0.875rem'],
      sm: ['0.875rem', '1.0625rem'],
      base: ['1rem', '1.5rem'],
      lg: ['1.25rem', '1.5625rem'],
      xl: ['1.5rem', '1.875rem'],
      '2xl': ['2rem', '2.5rem'],
      '3xl': ['2.5rem', '3.125rem'],
      '4xl': ['3rem', '3.625rem'],
      '5xl': ['3.5rem', '4.1875rem'],
    },
    fontFamily: {
      main: ['Hanken Grotesk', 'sans-serif'],
      sub: ['Hanken Grotesk', 'sans-serif'],
    },
    fontWeight: {
      light: '300',
      regular: '400',
      'semi-bold': '500',
      bold: '600',
    },
    colors: {
      transparent: 'transparent',
      white: '#FFFFFF',
      light: {
        400: '#F1F5F9',
        500: '#E9EBED',
        600: '#9399A4',
      },
      black: '#000000',
      dark: {
        400: '#10141D',
        500: '#1B2433',
        600: '#273349',
      },
      primary: {
        400: '#FFE14D',
        500: '#FFD400',
        600: '#B39400',
      },
      success: {
        400: '#89E774',
        500: '#4AD42B',
        600: '#66BE52',
      },
      warning: {
        400: '#FFE14D',
        500: '#FFD400',
        600: '#B39400',
      },
      alert: {
        400: '#F24067',
        500: '#E11D48',
        600: '#C02650',
      },
    },
  },
}
