import { css } from 'styled-components'

const sizes = {
    phone: 375,
    phoneLarge: 414,
    phoneXL: 550,
    tablet: 768,
    tabletLandscape: 1025,
    desktopSmall: 1250,
    desktop: 1440,
    desktopLarge: 1920,
    desktopXLarge: 2048,
}

// Iterate through the sizes and create a media template
export const mediaMin = Object.keys(sizes).reduce((acc, label) => {
    acc[label] = (...args) => css`
        @media (min-width: ${sizes[label] / 16}em) {
            ${css(...args)}
        }
    `

    return acc
}, {})

export const mediaMax = Object.keys(sizes).reduce((acc, label) => {
    acc[label] = (...args) => css`
        @media (max-width: ${sizes[label] / 16}em) {
            ${css(...args)}
        }
    `

    return acc
}, {})
