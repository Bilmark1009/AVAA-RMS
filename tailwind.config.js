import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                avaa: {
                    dark:           '#122431',
                    'dark-mid':     '#172F37',
                    'dark-light':   '#1D2835',
                    primary:        '#7EB0AB',
                    'primary-hover':'#6A9E99',
                    'primary-light':'#EAF3F2',
                    muted:          '#A4AAB8',
                    teal:           '#7EB0AB',
                    text:           '#4D5056',
                    dark2:          '#2C3E50',
                },
            },
        },
    },

    plugins: [forms],
};