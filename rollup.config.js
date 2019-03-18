import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/index.js',
    format: 'umd',
    name: 'index'
  },
  globals: {
    react: 'React',
  },
  external: ['react'],
  plugins: [
      typescript({
        lib: ['es5', 'es6', 'es7', 'dom'],
      }),
  ]
}
