module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    // Add cssnano for production optimization
    ...(process.env.NODE_ENV === 'production' ? { 'cssnano': {} } : {})
  },
}