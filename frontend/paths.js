var _sources = {
  libPath: './dev/deps/',
  appPath: './dev/code/',
  sassPath: './dev/sass/',
  imgPath: './dev/images/',
  spritePath: './dev/sprites/',
  markupPath: './dev/markup/',
  fontPath: './dev/fonts/',
  depsPath: './dev/deps/'
}

var _dests = {
  jsPath: '../public/js/',
  cssPath: '../public/css/',
  imgPath: '../public/images/',
  markupPath: '../public/',
  fontPath: '../public/fonts/',
  depsPath: '../public/js/deps/'
}

module.exports = {
  scripts:{

    origin:{

      // lib:[
      //   _sources.libPath + 'jquery.min.js',
      //   _sources.libPath + 'angular.min.js',
      //   _sources.libPath + 'angular-datepicker.min.js',
      //   _sources.libPath + 'lodash.min.js',
      //   _sources.libPath + 'modernizr.js'
      // ],

      app:[
        _sources.appPath + '**/*.js',
      ]
    },
    dest: _dests.jsPath
  },

  styles: {
    origin: _sources.sassPath + 'app.scss',
    watch: [
      _sources.sassPath + '**/*.scss',
      _sources.appPath + 'views/**/*.scss'
    ],
    dest: _dests.cssPath
  },

  sprites: {
    origin: _sources.spritePath + '**/*.{png,gif,jpg}',
    dest:{
      image: _dests.imgPath,
      styles: _sources.sassPath + 'transient'
    }
  },

  markup: {
    origin: _sources.markupPath + '**/*.html',
    dest: _dests.markupPath
  },

  fonts: {
    origin: _sources.fontPath + '**/*',
    dest: _dests.fontPath
  },

  images: {
    origin: _sources.imgPath + '**/*.{png,gif,jpg,svg}',
    dest: _dests.imgPath
  },

  deps: {
    origin: _sources.depsPath + '**/*',
    dest: _dests.depsPath
  }


}
